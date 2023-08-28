import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Image, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Switch, ToastAndroid } from 'react-native';
import { AntDesign, MaterialCommunityIcons, FontAwesome, Feather, Ionicons, Entypo, MaterialIcons  } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SelectList } from 'react-native-dropdown-select-list';
import { SettingsContext } from '../../components/context/settings/SettingsContext';
import { Colours } from '../../../utils/MyColours';
import { useRoute } from '@react-navigation/native';
import { Timestamp, and, arrayRemove, arrayUnion,  collection,  deleteDoc, doc,  getDoc,  getDocs,  onSnapshot,  query,  setDoc, updateDoc, where } from 'firebase/firestore';
import { db, storage } from '../../../../firebase';
import { AuthContext } from '../../components/context/authContext/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { FetchUsersContext } from '../../components/context/fetch/fetchUsersContext';
import { createGroupNotification } from '../../../utils/functions';


const Group = ({navigation}) => {
    const {dark, i18n} = useContext(SettingsContext);
    const {user, updateUser} = useContext(AuthContext);
    const {students, chats} = useContext(FetchUsersContext);
    const {params} = useRoute();

    const [contacts, setContacts] = useState([]);
    const [currentFriend, setCurrentFriend] = useState(undefined);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isPictureMode, setIsPictureMode] = useState(false);
    const [isShowBasic, setIsShowBasic] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [imageUri, setImageUri] = useState('');
    const [imageLink, setImageLink] = useState('');
    const [curentListTitle, setCurrentListTitle] = useState('m')
    const [studentLevel, setStudentLevel] = useState('100');
    const [perc, setPerc] = useState('');

    const [gname, setGname] = useState('');
    const [dep, setDep] = useState('');
    const [course, setCourse] = useState('');
    const [maxNum, setMaxNum] = useState('');
    const [cc, setCc] = useState('');
    const [desc, setDesc] = useState('');
    const [followers, setFollowers] = useState([]);
    const [admins, setAdmin] = useState([]);
    const [qquery, setqQuery] = useState('');

    const [mMode, setmMode] = useState(true);
    const [fMode, setfMode] = useState(false);
    const [aMode, setaMode] = useState(false);

    const [isAdmin, setIsAdmin] = useState(false);
    const [isFollower, setIsFollower] = useState(false);
    const [isMember, setIsMember] = useState(false);
    const [isCreator, setIsCreator] = useState(false);


    const [joinLoading, setJoinLoading] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [topLoading, setTopLoading] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [messLoading, setMesssLoading] = useState(false);
    const [hasUpdated, setHasUpdated] = useState('');

    const handleMList = () =>{
        setCurrentListTitle('m');
        setmMode(true);
        setfMode(false);
        setaMode(false);
    }
    const handleFList = () =>{
        setCurrentListTitle('f');
        setfMode(true);
        setmMode(false);
        setaMode(false);
    }
    const handleAList = () =>{
        setCurrentListTitle('a');
        setaMode(true);
        setfMode(false);
        setmMode(false);
    }

    // useEffect(()=>{
    //     if(curentListTitle === 'm'){
    //         setmMode(true);
    //     }
    // },[])

    useEffect(()=>{
        const unsub = onSnapshot(doc(db, 'groups', params.curGroup.id), (doc)=>{
            // navigation.setParams({curGroup:doc.data()})
        })
        return ()=>{
            unsub()
        }
     },[hasUpdated])

    const updatePrimary = async()=>{
        const pData = {
            gname: gname !==''? gname : params?.curGroup?.gname,
            dep: dep !==''? dep: params?.curGroup?.dep, 
            course: course !==''? course : params?.curGroup?.course,
            maxNum: maxNum !==''? maxNum : params?.curGroup?.maxNum,
            cc: cc !==''? cc : params?.curGroup?.cc,
            desc: desc !==''? desc : params?.curGroup?.desc,
            level:studentLevel,
        }
        try {
            alert(`${i18n.t('done')} ✅`);
            console.log(pData)
            const pubRef = doc(db, "groups", params.curGroup.id);
            await updateDoc(pubRef, pData);
            setHasUpdated('1')
        } catch (error) {
            console.log(error)
        }
    }
    const updateSecondary = async()=>{
        const sData = {
            hidden: isHidden,
            public: isShowBasic
        }
        alert(`${i18n.t('done')} ✅`);
        const pubRef = doc(db, "groups", params.curGroup.id);
        await updateDoc(pubRef, sData);
        setHasUpdated('2')
    }
    useEffect(()=>{
        let subscribe = true;
        if(subscribe){

            // setCurGroup(doc.data());
            setContacts(params?.curGroup?.members);
            setAdmin(params?.curGroup?.admins);
            setFollowers(params?.curGroup?.folls);
            setStudentLevel(params?.curGroup?.level);
    
            // setIsShowBasic(curGroup.public);
            // setIsHidden(curGroup.hidden);
    
            const admin = params?.curGroup?.admins.filter(admin=>admin === user.id);
            const memb = params?.curGroup?.members.filter(memb=>memb === user.id);
            const creator = params?.curGroup?.creatorId === user.id;
            const foll = params?.curGroup?.folls.filter(foll=>foll === user.id);
            if(admin.length){
                setIsAdmin(true);
            }
            if(memb.length){
                setIsMember(true);
            }
            if(creator){
                setIsCreator(true);
            }
            if(foll.length){
                setIsFollower(true);
            }
            // console.log(params.curGroup)
        }

        return()=>{
            subscribe = false;
        }
        
    },[])
    

    const cancelRequest = async()=>{
        setTopLoading(true);
        try {
            await updateDoc(doc(db, 'groups', params.curGroup.id), {
                folls: arrayRemove(user.id)
            })
            alert(`${i18n.t('done')} ✅`);
            setHasUpdated('20');
            setTopLoading(false);
        } catch (error) {
            setTopLoading(false);
            console.log(error);
            alert(i18n.t('errFailed'))
        }
    }
    
   
    const deleteFriend = ()=>{
        let mes = `You have been removed from ${params?.curGroup?.cc} of ${params?.curGroup?.dep}.`;
        let title = `Removed`;
        try {
            if(currentFriend ){
                Alert.alert(i18n.t('dm'), `${i18n.t('dmWarn')} ${i18n.t('dmWarn2')}`,
                [
                    {text:i18n.t('yes'), onPress:async()=>{
                        setTopLoading(true);
                        const washingtonRef = doc(db, "groups", params.curGroup.id);
                        await updateDoc(washingtonRef, {
                            members: arrayRemove(currentFriend),
                            admins: arrayRemove(currentFriend)
                        });
                        await updateDoc(doc(db, 'users', currentFriend), {
                            groups: arrayRemove(params.curGroup.id)
                        });
                        setHasUpdated('3')
                        alert(i18n.t('mdel'));
                        setIsDeleteMode(false);
                        setTopLoading(false);
                        createGroupNotification(params.curGroup.id, params?.curGroup?.image, title, mes, currentFriend);
                        const q = query(
                        collection(db, `favourites`), 
                        and(where('id', '==', params.curGroup.id),
                        where('user', '==', currentFriend)
                        ));
                        const chatqQuery = await getDocs(q);
                        if(!chatqQuery.empty){
                            chatqQuery.docs.forEach(async(item)=>{
                                await deleteDoc(doc(db, 'favourites', item.id));
                            })
                        }
                    }},
                    {text:i18n.t('no'), onPress:()=>{
                        console.log('canceled');
                        setIsDeleteMode(false);
                    }, style:'cancel'},
                ],
                {cancelable:true}
                )
            }
        } catch (error) {
            console.log(error);
            setTopLoading(false);
        }
    }

    const makeAdmin = async()=>{
        setTopLoading(true);
        if(currentFriend ){
            try {
                const isAd = params?.curGroup?.admins?.filter(admin=>admin === currentFriend);
                //console.log(isAdmin)
                if(isAd.length){
                    alert(i18n.t('adminAlready'));
                    setCurrentFriend(undefined);
                }
                else{

                    const oldAdmins = params?.curGroup.admins;
                    const newAdmins = [...oldAdmins, currentFriend];
                    await setDoc(doc(db, "groups", params.curGroup.id), {admins:newAdmins}, {merge:true});
                    setTopLoading(false);
                    alert(`${i18n.t('adAdmin')}`);
                    setIsDeleteMode(false);
                    setCurrentFriend(undefined);
                    setHasUpdated('4')
                }
            } catch (error) {
                console.log(error);
                setTopLoading(false);
                alert(i18n.t('pccFailed'));
            }
        }
    }

    const removeAdmin = async()=>{
        setTopLoading(true);
        if(currentFriend ){
            try {
                await updateDoc(doc(db, 'groups', params.curGroup?.id), {
                    admins: arrayRemove(currentFriend)
                })
                setTopLoading(false);
                alert(`${i18n.t('done')} ✅`);
                setHasUpdated('5')
            } catch (error) {
                console.log(error);
                setTopLoading(false);
                alert(i18n.t('pccFailed'));
            }
        }
    }

    const removeRequest = async()=>{
        setTopLoading(true);
        let mes = `Your request to join ${params.curGroup?.cc} from ${params.curGroup?.dep} has been declined.`;
        let title = `Request declined`;
        if(currentFriend ){
            try {
                await updateDoc(doc(db, 'groups', params.curGroup?.id), {
                    folls: arrayRemove(currentFriend)
                });
                setTopLoading(false);
                alert(`${i18n.t('done')} ✅`);
                setHasUpdated('6')
                createGroupNotification(params.curGroup?.id, params.curGroup?.image, title, mes, currentFriend);
            } catch (error) {
                console.log(error);
                setTopLoading(false);
                alert(i18n.t('pccFailed'));
            }
        }
    }
    // console.log(params.groupNow)
    const promoteRequest = async(mid)=>{
        let mes = `Your request to join ${params.curGroup?.cc} of ${params.curGroup?.dep} has been approved. You are now a member`;
        let title = `Request - ${params.curGroup?.cc}`;
        setTopLoading(true);
        if(currentFriend ){
            try {
                if(params.curGroup?.members.lenght < params.curGroup?.maxNum){

                    await updateDoc(doc(db, 'groups', params.curGroup.id), {
                        folls: arrayRemove(currentFriend)
                    });
                    await updateDoc(doc(db, 'groups', params.curGroup.id), {
                        members: arrayUnion(currentFriend)
                    });
                    await updateDoc(doc(db, 'users', currentFriend), {
                        groups: arrayUnion(params.curGroup.id),
                        currentFriend: Timestamp.fromDate(new Date())
                    });
                    setTopLoading(false);
                    alert(`${i18n.t('done')} ✅`);
                    setHasUpdated('7')
                    createGroupNotification(params.curGroup.id, params.curGroup.image, title, mes, mid);
                }
                else{
                    alert(`${i18n.t('gpf')}`)
                }
            } catch (error) {
                console.log(error);
                setTopLoading(false);
                alert(i18n.t('pccFailed'));
            }
        }
    }
    
    const leaveGroup = async()=>{
        setLeaveLoading(true);
        try {
            await updateDoc(doc(db, 'groups', params.curGroup.id), {
                members: arrayRemove(user.id)
            });
            await updateDoc(doc(db, 'users', user.id), {
                groups: arrayRemove(params.curGroup.id)
            });
            if(isAdmin){
                await updateDoc(doc(db, 'groups', params.curGroup.id), {
                    members: arrayRemove(user.id)
                });
            }
            setHasUpdated('8')
            setLeaveLoading(false);
            const q = query(
            collection(db, `favourites`), 
            and(where('id', '==', params.curGroup.id),
            where('user', '==', user.id)
            ));
            const chatqQuery = await getDocs(q);
            if(!chatqQuery.empty){
                chatqQuery.docs.forEach(async(item)=>{
                    await deleteDoc(doc(db, 'favourites', item.id));
                })
            }
            const userData = await getDoc(doc(db, 'users', user.id));
            updateUser(userData.data());

        } catch (error) {
            console.log(error);
            setLeaveLoading(false);
            alert(i18n.t('pccFailed'));
        }
        
    }

    // console.log(params.curGroup?.members.lenght)
    
    const joinGroup = async()=>{
        setJoinLoading(true);
        let mes = `You are now a member of ${params.curGroup?.cc} of ${params.curGroup?.dep}.`;
        let title = `New group`;
        try {
            if(params.curGroup?.members.length < params.curGroup?.maxNum ){

                await updateDoc(doc(db, 'groups', params.curGroup.id), {
                    members: arrayUnion(user.id)
                });
                await updateDoc(doc(db, 'users', user.id), {
                    groups: arrayUnion(params.curGroup.id),
                });
                
                if(isFollower){
                    await updateDoc(doc(db, 'groups', params.curGroup.id), {
                        folls: arrayRemove(user.id),
                    });
                }
                setHasUpdated('9')
                setJoinLoading(false);
                alert(`${i18n.t('done')} ✅`);
                createGroupNotification(params.curGroup.id, params.curGroup.image, title, mes, user.id);
                const userData = await getDoc(doc(db, 'users', user.id));
                updateUser(userData.data());
            }
            else{
                alert(i18n.t('gpf'));
                setJoinLoading(false);
            }
        } catch (error) {
            console.log(error);
            setJoinLoading(false);
            alert(i18n.t('pccFailed'));
        }
       
    }
    // console.log(params.curGroup)
    const handleAddMember = async(mid)=>{
        setJoinLoading(true);
        let mes = `You are now a member of ${params.curGroup?.cc} of ${params.curGroup?.dep}.`;
        let title = `New group`;
        try {
            if(params.curGroup?.members.length < params.curGroup?.maxNum ){

                await updateDoc(doc(db, 'groups', params.curGroup.id), {
                    members: arrayUnion(mid),
                    added: arrayUnion({member:mid, date: Timestamp.fromDate(new Date())})
                });
                await updateDoc(doc(db, 'users', mid), {
                    groups: arrayUnion(params.curGroup.id),
                });
                
                if(followers.filter(mem => mem === mid)?.length > 0){
                    await updateDoc(doc(db, 'groups', params.curGroup.id), {
                        folls: arrayRemove(mid),
                    });
                }
                setHasUpdated('10')
                setJoinLoading(false);
                alert(`${i18n.t('done')} ✅`);
                createGroupNotification(params.curGroup.id, params.curGroup.image, title, mes, mid);
            }
            else{
                alert(i18n.t('gpf'));
                setJoinLoading(false);
            }

            navigation.setParams({membId:null});
        } catch (error) {
            console.log(error);
            setJoinLoading(false);
            alert(i18n.t('pccFailed'));
        }
       
    }


    const followGroup = async()=>{
        setFollowLoading(true);
        try {
            await updateDoc(doc(db, 'groups', params.curGroup.id), {
                folls: arrayUnion(user.id)
            });
            setFollowLoading(false);
            alert(`${i18n.t('done')} ✅`);
            setHasUpdated('11')
        } catch (error) {
            console.log(error);
            setFollowLoading(false);
            alert(i18n.t('pccFailed'));
        }
       
    }
    const deleteGroup = async()=>{
        try {
            Alert.alert(i18n.t('cf'), `${i18n.t('yAboutToDel')} `+params.curGroup?.gname+`. ${i18n.t('undone')}`,
            [
                {
                    text:i18n.t('yes'),
                    onPress:async()=>{
                        setDeleteLoading(true);
                        try {
                            await deleteDoc(doc(db, 'groups', params.curGroup.id));
                            navigation.navigate('Tab', {screen:'People'});
                            setDeleteLoading(false);
                            const chat = chats.filter(item => item.id === params.curGroup.id)[0];
                            if(chat){
                                await deleteDoc(doc(db, 'chats', params.curGroup.id));
                            }

                            const q = query(
                            collection(db, `favourites`), 
                            where('id', '==', params.curGroup.id));
                            const chatqQuery = await getDocs(q);
                            if(!chatqQuery.empty){
                                chatqQuery.docs.forEach(async(item)=>{
                                    await deleteDoc(doc(db, 'favourites', item.id));
                                })
                            }

                        } catch (error) {
                            setDeleteLoading(false);
                            console.log(error)
                        }
                    }
                },

                {
                    text:i18n.t('no'),
                    onPress:()=>{
                        console.log('Canceled')
                    },
                    style:'cancel'
                }
            ],
            {cancelable:true}
            )
            
            
        } catch (error) {
            console.log(error);
            setDeleteLoading(false);
            alert(i18n.t('pccFailed'));
        }
       
    }
    const handleDeleteFriend = (cid)=>{
        setCurrentFriend(cid);
        setIsDeleteMode(true)
        // Alert.alert('Delete Friend', `hi`)
    }
    

    useEffect(()=>{
        const UploadProfileImage = async()=>{
            const blob = await new Promise((resolve, reject)=>{
                const xhr = new XMLHttpRequest();
                xhr.onload = function(){
                    resolve(xhr.response);
                };
                xhr.onerror = function(){
                    reject(new TypeError("Network request failed"));
                };
                xhr.responseType = 'blob';
                xhr.open("GET", imageUri, true);
                xhr.send(null);
            })
            /** @type {any} */
                const metadata = {
                    contentType: 'image/jpeg',
                };
            const name = new Date().getTime()+ user.id;
            const storageRef = ref(storage, 'Groups/'+name);
            const uploadTask = uploadBytesResumable(storageRef, blob, metadata);
        
            uploadTask.on('state_changed', (snapshot)=>{
                const progress = (snapshot.bytesTransferred/snapshot.totalBytes) * 100;
                console.log(`upload is ${progress}% done`);
                setPerc(progress);
        
                switch(snapshot.state){
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload in progress');
                        break;
                    case 'error':
                        alert(i18n.t('errImageUpload'));
                        break;
                    case 'success':
                        console.log('Upload is done');
                        break;
        
                    default:
                        break;
                }
            },
            (error)=>{
                console.log(error);
                alert(error);
            },
            ()=>{
                getDownloadURL(uploadTask.snapshot.ref).then(async(downloadURL)=>{
                    try {
                        await updateDoc(doc(db, "groups", params.curGroup.id), {image:downloadURL});
                        console.log('File is available at ', downloadURL);
                        setImageLink(downloadURL);
                        setHasUpdated('12')
                    } catch (error) {
                        console.log(error)
                    }
                })
            }
            )
        }
        imageUri && UploadProfileImage();
    },[imageUri])
   
//   console.log(params.curGroup)
    const pickImage = async()=>{
        const gallery = await ImagePicker.requestMediaLibraryPermissionsAsync();
        // setIsPermissionGranted(gallery.status === 'granted');
        // // console.log(isPermissionGranted)
        console.log(gallery.status)
        if(gallery.status === 'denied'){
            return Alert.alert(i18n.t('libPermTitle'), i18n.t('libPermDenied'))
        }
        else {
            let response = await ImagePicker.launchImageLibraryAsync({
                mediaTypes:ImagePicker.MediaTypeOptions.Images,
                allowsEditing:true,
                aspect:[4,3],
                quality:1,
            });
            // console.log(response)
            if(!response.canceled){
                setImageUri(response.assets[0].uri);
            }
            
        }
    }

// console.log(followers)
    async function camerapressHandler(){
        const camera =await ImagePicker.requestCameraPermissionsAsync();
        if (camera.status === 'denied'){
            return Alert.alert(
                i18n.t('camPermTitle'),
                i18n.t('camPermDenied')
            );
        }
        else{
            const image=await ImagePicker.launchCameraAsync({
                allowsEditing:true,
                aspect:[4,3],
                quality:1
            });
            if(!image.canceled){
                setImageUri(image.assets[0].uri)
            }
        }
    }


    const fetchRoom = async()=>{
        // setCurrentChat(id);
        
        try {
            setMesssLoading(true);
            const roomData = {
                createdAt: new Date(),
                members:params.curGroup.members,
                image: params.curGroup.image,
                name: params.curGroup.gname,
                lastMsg:'',
                id: params.curGroup.id,
                roomType:'group',
                notRead:[],
                what:''
            }
            
            // const chatqQuery = await getDoc(doc(db, 'chats', params.curGroup.id));
            const chat = chats.filter(item=>item.id=== params.curGroup.id)[0];
            // console.log(chatqQuery.docs)
            if(!chat){
                await setDoc(doc(db, 'chats', params.curGroup.id), roomData);
                setMesssLoading(false);
                navigation.navigate('Chat', {
                    chatNow: params.curGroup.id, 
                    name:params.curGroup.gname, 
                    image:params.curGroup.image, 
                    roomId:params.curGroup.id,
                    roomType:'group',
                    members:[user.id],
                });
            }
            else{
                setMesssLoading(false);
                navigation.navigate('Chat', {
                    chatNow: params.curGroup.id, 
                    name:params.curGroup.gname, 
                    image:params.curGroup.image, 
                    roomId:params.curGroup.id,
                    roomType:chat.roomType,
                    members: chat.members
                });
            }
        } catch (error) {
            setMesssLoading(false);
            console.log(error)
        }

    }

    // console.log(params.curGroup)

    useEffect(()=>{
        if(params?.membId){
            handleAddMember(params?.membId);
        }
    },[params?.membId])

    const copyGroupLink = () => {
        ToastAndroid.showWithGravity(
            i18n.t('gpCopy'),
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
      };
    //   indexof

    const handleChatPage = (memb)=>{
        navigation.navigate('Profile', {
            // userNow: deleteUserId.members.filter(id=>id !== user.id)[0]
            currentUser: memb
        })
    }

    const resetImage = async()=>{
        setImageUri(null);
        try {
            await updateDoc(doc(db, 'users', params.curGroup.id), {
                image:'https://static.javatpoint.com/tutorial/group-discussion/images/importance-of-gd.png'
            })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <SafeAreaView style={[styles.main, {backgroundColor:dark?Colours.bacDark:Colours.bacLight}]} >
            {!isEditMode &&
                <View style={styles.header} >
                    <Pressable onPress={()=>navigation.goBack()} style={styles.back} >
                        <Ionicons  name="chevron-back-circle" size={40} color="#b9b7b7" />
                    </Pressable>
                    <Text style={[[styles.editHeader, {color:dark?Colours.titeleDark:Colours.titeleLight}], {color:dark?Colours.titeleDark:Colours.titeleLight}]}>{params.curGroup?.gname}</Text>
                </View>
            }
            {
                !isEditMode ?
                <ScrollView>
                    <View style={styles.container} >
                        <View style={styles.top} >
                            <View style={styles.imgcontainer}>
                                {
                                    params.curGroup?.image &&
                                    <Image style={styles.img} source={{uri:params?.curGroup?.image}} />
                                }
                            </View>
                            <View style={styles.maindetail} >
                                <View style={{flexDirection:'row', gap:6, alignContent:'center', justifyContent:'center'}} >
                                    <Text style={[styles.nametext, {color:dark? Colours.titeleDark:Colours.textLight}]} >{params.curGroup?.cc}</Text>
                                    {
                                        params.curGroup?.level &&
                                        <Text style={[styles.nametext, {color:dark? Colours.titeleDark:Colours.textLight}]} >({'Level '+params.curGroup?.level}) </Text>
                                    }
                                </View>
                                <View style={styles.otherdetail} >
                                    <View style={styles.detLeft}>
                                        <Text style={[styles.others, {color:dark?Colours.titeleDark:Colours.textLight}]} >{params.curGroup?.dep}</Text>
                                        <Text style={[styles.others, {color:dark?Colours.titeleDark:Colours.textLight}]} >{params.curGroup?.course}</Text>
                                    </View>
                                    {
                                        params.curGroup?.members &&
                                        <View style={styles.detRight}>
                                            <Text style={[styles.others, {color:dark?Colours.titeleDark:Colours.textLight}]} >{params.curGroup?.members.length} {i18n.t('membs')}</Text>
                                        </View>
                                    }
                                </View>
                            </View>
                            <View style={styles.butt} >
                                {
                                    isMember &&
                                    <>
                                    {
                                        messLoading ? <ActivityIndicator size={'small'} /> :
                                        <Pressable onPress={fetchRoom} style={styles.oneButt} >
                                            <AntDesign name="message1" size={24} color="#4aacf3" />
                                            <Text style={[styles.buttText, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{i18n.t('mess')}</Text>
                                        </Pressable>
                                    }
                                    </>
                                }

                                {
                                    !isMember && params.curGroup.public &&
                                    <>
                                    {
                                        joinLoading ?
                                        <ActivityIndicator size={'small'} /> :
                                        <Pressable onPress={joinGroup} style={styles.oneButt} >
                                            <AntDesign name="adduser" size={24} color="#4aacf3" />
                                            <Text style={[styles.buttText, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >Join</Text>
                                        </Pressable>
                                    }
                                    </>
                                }

                                {
                                    (!isMember && !isFollower && !params.curGroup.public) &&
                                    <>
                                    {
                                        followLoading ?
                                        <ActivityIndicator size={'small'} />:
                                        <Pressable onPress={followGroup} style={styles.oneButt} >
                                            <Feather name="upload" size={24} color="#4aacf3" />
                                            <Text style={[styles.buttText, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >Send request</Text>
                                        </Pressable>
                                    }
                                    </>
                                }
                                
                                {
                                    isAdmin &&
                                    <>
                                    {
                                        joinLoading ? <ActivityIndicator size={'small'} /> :
                                        <Pressable onPress={()=>navigation.navigate('Home', {fromGroup:true, curGroup:params.curGroup}) } style={styles.oneButt} >
                                            <AntDesign name="addusergroup" size={24} color="#4aacf3" />
                                            <Text style={[styles.buttText, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >Add Member</Text>
                                        </Pressable>
                                    }
                                    </>
                                }
                                {
                                    isAdmin &&
                                    <Pressable onPress={()=>setIsEditMode(true)} style={styles.oneButt} >
                                        <AntDesign name="edit" size={24} color="#4aacf3" />
                                        <Text style={[styles.buttText, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{i18n.t('edit')}</Text>
                                    </Pressable>
                                }

                                {
                                    isMember && !isCreator &&
                                    <>
                                    {
                                        leaveLoading ? <ActivityIndicator size={'small'} /> :
                                        <Pressable onPress={leaveGroup} style={styles.oneButt} >
                                            <Entypo name="log-out" size={24} color="#4aacf3" />
                                            <Text style={[styles.buttText, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{i18n.t('leave')}</Text>
                                        </Pressable>
                                    }
                                    </>
                                }

                                {
                                    isCreator &&
                                    <>
                                    {
                                        deleteLoading ? <ActivityIndicator size={'small'} /> :
                                        <Pressable onPress={deleteGroup} style={styles.oneButt} >
                                            <Ionicons name="trash-bin-outline" size={24} color="#4aacf3" />
                                            <Text style={[styles.buttText, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{i18n.t('del')}</Text>
                                        </Pressable>
                                    }
                                    </>
                                }
                            </View>
                        </View>
                        <View style={styles.middle} >
                            {
                                params.curGroup?.desc &&
                                <View style={styles.blur} >
                                    <Text style={[styles.blurname, {color:dark?Colours.bacLight:Colours.textLight}]} >{i18n.t('desc')}</Text>
                                    <Text style={[styles.blurtext, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{params.curGroup?.desc}</Text>
                                </View>
                            }
                        </View>
                        <View style={styles.down} >
                            <View style={styles.downHeaders} >
                                <Pressable onPress={handleMList} style={curentListTitle === 'm' ? styles.headersBut : [styles.headersBut2, {backgroundColor:Colours.bacDark}]} >
                                    <Text style={styles.frds} >{i18n.t('membs')}</Text>
                                </Pressable>
                                <Pressable onPress={handleAList} style={curentListTitle === 'a' ? styles.headersBut : [styles.headersBut2, {backgroundColor:Colours.bacDark}]} >
                                    <Text style={styles.frds} >{i18n.t('admins')}</Text>
                                </Pressable>
                                <Pressable onPress={handleFList} style={curentListTitle === 'f' ? styles.headersBut : [styles.headersBut2, {backgroundColor:Colours.bacDark}]} >
                                    <Text style={styles.frds} >{i18n.t('req1')}</Text>
                                </Pressable>
                            </View>
                            <TextInput style={[styles.oneInput3, {color:dark?Colours.iconDark:Colours.subTextDark}]} 
                                placeholder={i18n.t('secMem')}
                                value={qquery}
                                onChangeText={e=>setqQuery(e)}
                            />
                            {
                                mMode && contacts && 
                                students?.filter((us)=>contacts?.includes(us.id))
                                .filter(item=>item.id !== user.id)
                                .filter(item=>{
                                    return qquery === ''? item : Object.values(item)
                                    .join(' ')
                                    .toLowerCase()
                                    .includes(qquery.toLowerCase())}).map((frd)=>(
                                <TouchableOpacity onLongPress={()=>handleDeleteFriend(frd.id)} onPress={()=>handleChatPage(frd)} key={frd.id} style={styles.oneContact} >
                                    <View  style={styles.contactImg} > 
                                        <Image style={styles.frdimage} source={{uri:frd?.image }} />
                                        <Text style={[styles.frdname, {color:dark?Colours.titeleDark:Colours.textLight}]} >{frd?.fullname||frd?.username}</Text>
                                    </View>
                                    {
                                        isDeleteMode && (frd.id === currentFriend) && (frd.id !== params.curGroup.creatorId)  && isAdmin &&
                                        <>
                                        {
                                            topLoading ? <ActivityIndicator size={'small'} /> :
                                            <View style={styles.admin} >
                                                <Pressable onPress={deleteFriend} > 
                                                    <MaterialCommunityIcons name="account-cancel-outline" size={24} color="#dc1499" />
                                                </Pressable>
                                                <Pressable onPress={makeAdmin} >
                                                    <MaterialIcons name="admin-panel-settings" size={24} color="teal" />
                                                </Pressable>
                                            </View>
                                        }
                                        </>
                                    }
                                </TouchableOpacity>
                                ))
                            }
                            {
                                aMode && admins && 
                                students?.filter((us)=>admins?.includes(us.id))
                                .filter(item=>item.id !== user.id)
                                .filter(item=>{
                                    return qquery === ''? item : Object.values(item)
                                    .join(' ')
                                    .toLowerCase()
                                    .includes(qquery.toLowerCase())}).map((frd)=>(
                                <TouchableOpacity onLongPress={()=>handleDeleteFriend(frd.id)} onPress={()=>handleChatPage(frd)} key={frd.id} style={styles.oneContact} >
                                    <View  style={styles.contactImg} > 
                                        <Image style={styles.frdimage} source={{uri:frd?.image }} />
                                        <Text style={[styles.frdname, {color:dark?Colours.titeleDark:Colours.textLight}]} >{frd?.fullname||frd?.username}</Text>
                                    </View>
                                    {
                                        isDeleteMode && frd.id === currentFriend && !isCreator && isAdmin &&
                                        <View style={styles.admin} >
                                            <Pressable onPress={removeAdmin} > 
                                                <AntDesign name="user" size={24} color="#dc1499" />
                                            </Pressable>
                                            
                                        </View>
                                    }
                                </TouchableOpacity>
                                ))
                            }
                            {
                                fMode && followers && 
                                students?.filter((us)=>followers?.includes(us.id)).filter(item=>{
                                    return qquery === ''? item : Object.values(item)
                                    .join(' ')
                                    .toLowerCase()
                                    .includes(qquery.toLowerCase())}).map((frd)=>(
                                <TouchableOpacity onLongPress={()=>handleDeleteFriend(frd.id)} onPress={()=>handleChatPage(frd)} key={frd.id} style={styles.oneContact} >
                                    <View  style={styles.contactImg} > 
                                        <Image style={styles.frdimage} source={{uri:frd?.image }} />
                                        <Text style={[styles.frdname, {color:dark?Colours.titeleDark:Colours.textLight}]} >{frd?.fullname||frd?.username}</Text>
                                    </View>
                                    {
                                        isDeleteMode && frd.id === currentFriend && 
                                        <View style={styles.admin} >
                                            {
                                                isAdmin &&
                                                <Pressable onPress={()=>promoteRequest(frd.id)} >
                                                        <AntDesign name="adduser" size={24} color="#4aacf3" />
                                                </Pressable>
                                            }
                                            {
                                                (isAdmin || frd.id === user.id ) &&
                                                <Pressable onPress={frd.id === user.id ? cancelRequest : removeRequest} > 
                                                    <Entypo name="cross" size={24} color="#dc1499" />
                                                </Pressable>
                                            }
                                        </View>
                                    }
                                </TouchableOpacity>
                                ))
                            }

                        </View>
                    
                    {/* set async variable to store allow camera to access library */}

                        {/* Edit mode */}

                    </View>
                </ScrollView>

                    :

                <View style={styles.downDown}>
                        <View style={styles.header} >
                            <Pressable onPress={()=>setIsEditMode(false)} style={styles.back} >
                                <Ionicons  name="chevron-back-circle" size={40} color="#b9b7b7" />
                            </Pressable>
                            <Text style={[styles.editHeader, {color:dark?Colours.titeleDark:Colours.titeleLight}]}>{i18n.t('editGp')}</Text>
                        </View>
                    <ScrollView>
                        <View style={styles.editmode} >
                            <TouchableOpacity onPress={()=>setIsPictureMode(true)} style={styles.pictureImage} >
                                <Image style={styles.userPic} source={{uri: imageUri? imageUri: params?.curGroup?.image}} />
                                <Pressable onPress={()=>setIsPictureMode(true)} style={styles.cam} >
                                    <FontAwesome  name="camera" size={44} color="black" />
                                </Pressable>
                            </TouchableOpacity>
                            <Modal
                                animationType='slide'
                                transparent={true}
                                visible={isPictureMode}
                                onRequestClose={()=>setIsPictureMode(false)}
                            >
                                <Pressable onPress={()=>setIsPictureMode(false)} style={styles.mainModal}>

                                    <View  style={styles.inModal} >
                                        <TouchableOpacity onPress={camerapressHandler} style={styles.oneModal} >
                                            <Feather name="camera" size={24} color="black" />
                                            <Text style={styles.oneModalText} >{i18n.t('cam')}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={pickImage} style={styles.oneModal} >
                                            <FontAwesome name="photo" size={24} color="black" />
                                            <Text style={styles.oneModalText} >{i18n.t('gal')}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={resetImage} style={styles.oneModal} >
                                            <Feather name="camera-off" size={24} color="black" />
                                            <Text style={styles.oneModalText} >{i18n.t('rem')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Pressable>
                            </Modal>
                                {
                                    perc !=='' && perc < 100 && <Text style={{color:'crimson'}} >{i18n.t('uploadPic')}: {Math.floor(perc)}%</Text>
                                }
                                {
                                    perc === 100 && <Text style={{color:'green'}} >{i18n.t('doneUpload')}: {perc}%</Text>
                                }
                            <View style={styles.primary} >
                                <Text style={[styles.primaryHeader, {color:dark?Colours.titeleDark:Colours.textLight}]} >{i18n.t('pmDetails')}</Text>
                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('enterGName')}</Text>
                                    <TextInput style={[styles.oneInput, {backgroundColor:dark?Colours.iconDark:Colours.textDark, color:dark?Colours.bacLight:Colours.textLight}]} 
                                    value={gname}
                                    placeholder={params.curGroup?.gname}
                                    onChangeText={e=>setGname(e)}
                                    />
                                </View>

                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('dep')}</Text>
                                    <TextInput style={[styles.oneInput, {backgroundColor:dark?Colours.iconDark:Colours.textDark, color:dark?Colours.bacLight:Colours.textLight}]} 
                                    placeholder={params.curGroup?.dep}
                                    value={dep}
                                    onChangeText={e=>setDep(e)}
                                    />
                                </View>

                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.bacLight:Colours.subTextDark}]}>{i18n.t('cct')}</Text>
                                    <TextInput style={[styles.oneInput, {backgroundColor:dark?Colours.iconDark:Colours.textDark, color:dark?Colours.bacLight:Colours.textLight}]} 
                                    placeholder={params.curGroup?.course}
                                    value={course}
                                    onChangeText={e=>setCourse(e)}
                                    />
                                </View>

                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.bacLight:Colours.subTextDark}]}>{i18n.t('cc')}</Text>
                                    <TextInput style={[styles.oneInput, {backgroundColor:dark?Colours.iconDark:Colours.textDark, color:dark?Colours.bacLight:Colours.textLight}]} 
                                    placeholder={params.curGroup?.cc}
                                    value={cc}
                                    onChangeText={e=>setCc(e)}
                                    />
                                </View>

                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.bacLight:Colours.subTextDark}]}>{i18n.t('level')}</Text>
                                    <SelectList
                                        setSelected={(e)=>setStudentLevel(e)}
                                        data={[{key:1, value:'100'}, {key:2, value:'200' }, {key:3, value:'300' }, {key:4, value:'400' },]}
                                        save='value'
                                        search={false}
                                        dropdownTextStyles={{color:dark?Colours.titeleDark:Colours.subTextDark}}
                                        inputStyles={{color: dark? Colours.titeleDark:Colours.subTextDark, fontSize:16, }}
                                        boxStyles={{borderColor:'#4aacf3', borderWidth:1, backgroundColor:dark?Colours.iconDark:Colours.textDark}}
                                        arrowicon={<FontAwesome name="chevron-down" size={12} color={dark?Colours.bacLight:Colours.subTextDark} />}
                                        // defaultOption={{value:params.curGroup?.level}}
                                    />
                                </View>

                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.bacLight:Colours.subTextDark}]}>{i18n.t('maxMem')}</Text>
                                    <TextInput style={[styles.oneInput, {backgroundColor:dark?Colours.iconDark:Colours.textDark, color:dark?Colours.bacLight:Colours.textLight}]} 
                                    placeholder={params.curGroup?.maxNum.toString()}
                                    keyboardType='number-pad'
                                    value={maxNum}
                                    onChangeText={e=>setMaxNum(e)}
                                    />
                                </View>

                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.bacLight:Colours.subTextDark}]}>{i18n.t('desGp')}</Text>
                                    <TextInput style={[styles.oneInput2, {backgroundColor:dark?Colours.iconDark:Colours.textDark, color:dark?Colours.bacLight:Colours.textLight}]} 
                                    placeholder={params.curGroup?.desc?.substring(0, 30) || i18n.t('gpdesc')}
                                    multiline
                                    numberOfLines={3}
                                    value={desc}
                                    onChangeText={e=>setDesc(e)}
                                    />
                                </View>
                                
                                <TouchableOpacity onPress={updatePrimary} style={styles.save} >
                                    <Text style={styles.primarySave} >{i18n.t('save')}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* privacy */}
                            <View style={styles.primary} >
                                <Text style={[styles.primaryHeader, {color:dark?Colours.titeleDark:Colours.textLight}]} >{i18n.t('pvcy')}</Text>
                                <View style={styles.oneSwitch} >
                                    <View style={styles.mainSwitch} >
                                        <Text style={[styles.switchTitle, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('mkGpPb')}</Text>
                                        <Text style={[styles.switchText, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('gpPublic')}</Text>
                                    </View>
                                    <Switch 
                                        trackColor={{false: '#767577', true: '#81b0ff'}}
                                        thumbColor={isShowBasic ? '#035CDA' : '#f4f3f4'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={()=>setIsShowBasic(!isShowBasic)}
                                        value={isShowBasic}
                                    />
                                </View>
                                <View style={styles.oneSwitch} >
                                    <View style={styles.mainSwitch} >
                                        <Text style={[styles.switchTitle, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('keepgphid')}</Text>
                                        <Text style={[styles.switchText, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('keepgpindex')}</Text>
                                    </View>
                                    <Switch 
                                        trackColor={{false: '#767577', true: '#81b0ff'}}
                                        thumbColor={isHidden ? '#035CDA' : '#f4f3f4'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={()=>setIsHidden(!isHidden)}
                                        value={isHidden}
                                    />
                                </View>

                                <View style={styles.oneSwitch} >
                                    <View style={styles.mainSwitch} >
                                        <Text style={[styles.switchText, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('note')}</Text>
                                    </View>
                                </View>

                                {/* <View style={styles.oneSwitch} >
                                    <View style={styles.mainSwitch} >
                                        <Text style={[styles.switchTitle, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('cpGpLink')}</Text>
                                        <Text style={[styles.switchText, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('gpLink')}</Text>
                                    </View>
                                   <TouchableOpacity onPress={copyGroupLink}  style={{marginRight:10}} >
                                        <Ionicons name="copy-outline" size={35} color="grey" />
                                   </TouchableOpacity>
                                </View> */}
                               
                                <TouchableOpacity onPress={updateSecondary} style={styles.save} >
                                    <Text style={styles.primarySave} >{i18n.t('save')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                </ScrollView>
            </View>
            }
        </SafeAreaView>
    )
}

export default Group

const styles = StyleSheet.create({
    headersBut2:{
        paddingVertical:4,
        paddingHorizontal:10,
        borderRadius:15,
        borderWidth:0.5,
        borderColor:'#4aacf3',
    },
    headersBut:{
        backgroundColor:'#4aacf3',
        paddingVertical:4,
        paddingHorizontal:10,
        borderRadius:15
    },
    downHeaders:{
        flexDirection:'row',
        gap:2,
        alignItems:'center'
    },
    admin:{
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        gap:5,
    },
    back:{
        position:'absolute',
        left:0
    },
    header:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        width:'100%',
        marginLeft:10,
        // backgroundColor:'red',
        position:'relative',
        marginTop:10,
        marginBottom:20,
    },
    switchText:{
        fontSize:13
    },
    switchTitle:{
        fontWeight:'bold',
        fontSize:16
    },
    mainSwitch:{
        flexDirection:'column',
        width:'80%',
        gap:5,
        marginLeft:10
    },
    oneSwitch:{
        width:'100%',
        alignItems:'center',
        justifyContent:'space-between',
        flexDirection:'row'
    },
    primarySave:{
        color:'#fff',
        fontWeight:'bold'
    },
    save:{
        backgroundColor:'#4aacf3',
        paddingHorizontal:30,
        paddingVertical:10,
        borderRadius:10,
        alignSelf:'flex-end',
        marginRight:30
    },
    primaryHeader:{
        fontSize:23,
        fontWeight:'bold',
        // alignSelf:'flex-start',
        // marginLeft:10
    },
    oneInput2:{
        width:'100%',
        fontSize:16,
        paddingVertical:6,
        borderRadius:6,
        color:'white',
        paddingHorizontal:10,
        borderWidth:1,
        borderColor:'#4aacf3',
        maxHeight:200
    },
    oneInput3:{
        width:'90%',
        fontSize:16,
        paddingVertical:6,
        borderRadius:6,
        color:'white',
        paddingHorizontal:10,
        borderWidth:1,
        borderColor:'#4aacf3'
    },
    oneInput:{
        width:'100%',
        fontSize:16,
        paddingVertical:6,
        borderRadius:6,
        paddingHorizontal:10,
        borderWidth:1,
        borderColor:'#4aacf3'
    },
    editText:{
        fontWeight:'bold'
    },
    oneEdit:{
        width:'100%',
        // alignItems:'center',
        justifyContent:'center',
        gap:2,
        flexDirection:'column',
        paddingHorizontal:30
    },
    primary:{
        width:'95%',
        alignItems:'center',
        justifyContent:'center',
        gap:15,
        borderWidth:1,
        borderColor:'#4aacf3',
        paddingVertical:20,
        borderRadius:20,
        marginBottom:20
    },
    oneModal:{
        alignItems:'center',
        justifyContent:'center',
        gap:10,
    },
    inModal:{
        height:150,
        backgroundColor:'#fff',
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row',
        gap:30,
        paddingHorizontal:10,
        paddingVertical:8,
        borderTopRightRadius:10,
        borderTopLeftRadius:10,
        width:'100%',
        alignSelf:'flex-end',
    },
    mainModal:{
        flexDirection:'row',
        position:'absolute',
        width:'100%',
        height:'100%',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#000000aa'
    },
    cam:{
        position:'absolute'
    },
    userPic:{
        width:150,
        height:150,
        borderRadius:75,
        
    },
    pictureImage:{
        width:160,
        justifyContent:'center',
        alignItems:'center',
        position:'relative',
        height:160,
        backgroundColor:'#4aacf3',
        borderRadius:80,
    },
    editmode:{
        marginTop:20,
        flexDirection:'column',
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        gap:20
    },
    editHeader:{
        fontSize:23,
        textAlign:'center',
        fontWeight:'bold',
    },
    downDown:{
        flexDirection:'column',
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        paddingBottom:15
    },
    frdname:{
        fontSize:16,
    },
    frdimage:{
        width:50,
        height:50,
        borderRadius:25,
        resizeMode:'cover'
    },
    contactImg:{
        flexDirection:'row',
        gap:5,
        alignItems:'center',
    },
    oneContact:{
        width:'95%',
        alignItems:'center',
        justifyContent:'space-between',
        flexDirection:'row'
    },
    frds:{
        fontWeight:'bold',
        fontSize:15,
        color:'#fff'
    },
    down:{
        width:'100%',
        justifyContent:'center',
        gap:10,
        flexDirection:'column',
        marginBottom:50,
    },
    blurtext:{
        textAlign:'justify',
        fontSize:13,
    },
    blurname:{
        textAlign:'left',
        fontSize:17,
        fontWeight:'bold'
    },
    blur:{
        borderWidth:1,
        borderColor:'#4aacf3',
        width:'90%',
        paddingHorizontal:20,
        paddingVertical:10,
        borderRadius:10
    },
    middle:{
        width:'100%',
        alignItems:'center'
    },
    buttText:{
        textAlign:'center',
        fontSize:13,
        fontWeight:'bold'
    },
    oneButt:{
        flexDirection:'column',
        alignItems:'center',
        // justifyContent:'center',
        // backgroundColor:'#4aacf3',
        // width:"100%"
        // borderColor:'#4aacf3',
        // borderWidth:1,
        width:60,
        height:60,
        gap:5
    },
    butt:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        width:'100%',
        paddingHorizontal:20,
        gap:10,
    },
    others:{
        fontSize:16,
    },
    detLeft:{
        flex:2,
    },
    detRight:{
        flex:1,
    },
    otherdetail:{
        width:'80%',
        // alignItems:'center',
        justifyContent:'space-between',
        flexDirection:'row',
        paddingHorizontal:10,
        paddingVertical:8,
        borderRadius:10,
        borderWidth:1,
        borderColor:'#4aacf3'
    },
    nametext:{
        fontSize:20,
        fontWeight:'bold'
    },
    maindetail:{
        gap:10,
        alignItems:'center',
        justifyContent:'center',
        width:'100%'
    },
    img:{
        width:150,
        height:150,
        // transform:[{rotate:('10deg')}],
        borderRadius:75
    },
    imgcontainer:{
        alignItems:'center',
        justifyContent:'center',
        // backgroundColor:'rgb(74, 172, 243)',
        // width:'50%',
        // height:150,
        // marginTop:30,
        // borderRadius:30,
        // transform:'rotate(-10deg)',
    },
    top:{
        alignItems:'center',
        justifyContent:'center',
        gap:20,
        flexDirection:'column'
    },
    container:{
        width:'100%',
        // alignItems:'center',
        justifyContent:'center',
        gap:20,
        flexDirection:'column',
        paddingHorizontal:10
    },
    main:{
        flex:1,
        width:'100%',
        // alignItems:'center',
        justifyContent:'center',
        paddingTop: 10,
        flexDirection:'column',
        // gap:20,
        position:'relative'
      }
})
