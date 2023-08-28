import React, { useContext, useEffect, useState } from 'react'
import { Alert, Image, Modal, Pressable, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Switch, ActivityIndicator } from 'react-native';
import { AntDesign,  FontAwesome, Feather, Ionicons , Entypo, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SelectList } from 'react-native-dropdown-select-list'
import { SettingsContext } from '../../components/context/settings/SettingsContext';
import { Colours } from '../../../utils/MyColours';
import { useRoute } from '@react-navigation/native';
import { AuthContext } from '../../components/context/authContext/AuthContext';
import { and, arrayRemove, arrayUnion,  collection,  deleteDoc,  doc,  getDocs,  onSnapshot,   or,   query,   setDoc, updateDoc, where } from 'firebase/firestore';
import { db, storage } from '../../../../firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { FetchUsersContext } from '../../components/context/fetch/fetchUsersContext';
import { createGroupNotification } from '../../../utils/functions';


const Profile = ({navigation}) => {
    const {dark, i18n} = useContext(SettingsContext);
    const {user, updateUser, logout,} = useContext(AuthContext);
    const {allGroups, students, chats} = useContext(FetchUsersContext);
    const {params} = useRoute();
    
    const [currentFriend, setCurrentFriend] = useState(undefined);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [isPictureMode, setIsPictureMode] = useState(false);
    const [isShowBasic, setIsShowBasic] = useState(false);
    const [isShowFriends, setIsShowFriends] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [imageUri, setImageUri] = useState('');
    const [curentListTitle, setCurrentListTitle] = useState('fr')
    const [studentLevel, setStudentLevel] = useState(params?.currentUser.level);
    const [studentCourses, setStudentCourses] = useState([]);
    const [newMode, setNewMode] = useState(false);
    const [newCourse, setNewCourse] = useState('');


    const [isFriend, setIsFriend] = useState(false);
    const [isFollower, setIsFollower] = useState(false);
    const [isMe, setIsMe] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    const [fMode, setfMode] = useState(false);
    const [favMode, setFavMode] = useState(false);
    const [gMode, setGMode] = useState(false);
    const [bMode, setBMode] = useState(false);
    const [frMode, setFrMode] = useState(true);
    
    const [qquery, setQuery] = useState('');
    const [perc, setPerc] = useState('');
    const [courseLoading, setCourseLoading] = useState(false);
    const [topLoading, setTopLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [blockLoading, setBlockLoading] = useState(false);
    const [addLoading, setAddLoading] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [loadRoom, setLoadRoom] = useState(false);
    const [messLoading, setMessLoading] = useState(false);
    const [currentChat, setCurrentChat] = useState(undefined);

    const [hasUpdated, setHasUpdated] = useState('');

    const [phone, setPhone] = useState('');
    const [what, setWhat] = useState('');
    const [fullname, setFullname] = useState('');
    const [username, setUsername] = useState('');
    const [dep, setDep] = useState('');
    const [interest, setInterest] = useState('');
    const [desc, setDesc] = useState('');
    const [logoutLoading, setLogoutLoading] = useState(false);
    
    const handleLogout = ()=>{
        setLogoutLoading(true);
        logout();
        setLogoutLoading(false);
    }
    // console.log(params.currentUser);
    useEffect(()=>{
    
        let subscribe = true;
        if(subscribe){

            const friend = params?.currentUser?.friends.filter(memb=>memb === user.id);
            const foll = params?.currentUser?.folls.filter(foll=>foll === user.id);
            const block = params?.currentUser?.blocked.filter(blk=>blk === user.id);
            
            if(friend.length){
                setIsFriend(true);
            }
            if(foll.length){
                setIsFollower(true);
            }
            if(block.length){
                setIsBlocked(true);
            }
            if(params?.currentUser?.id === user.id){
                setIsMe(true);
            }
            // console.log(isMe)
        }
        
        return ()=>{
            subscribe = false;
        }
     },[params.currentUser])

    //  console.log('user Id '+ user.id + ' profile ID '+ params.currentUser.id)
    //  console.log(user.id === params.currentUser.id)
   
     useEffect(()=>{
        const unsub = onSnapshot(doc(db, 'users', user.id), (doc)=>{
            updateUser(doc.data());
            if(isMe){
                navigation.setParams({currentUser:doc.data()});
            }
        })
        return ()=>{
            unsub()
        }
     },[hasUpdated])
    

    //  console.log(params.currentUser.folls)
     
    const addFriend = async()=>{
        let mes = `${user.username || user.fullname} has friended you.`;
        let title = `New friend`;
        setAddLoading(true);
        try {
            const washingtonRef = doc(db, "users", user.id);
            await updateDoc(washingtonRef, {
                friends: arrayUnion(params.currentUser.id)
            });
            await updateDoc(doc(db, "users", params.currentUser.id), {
                friends: arrayUnion(user.id)
            });
            createGroupNotification(user.id, user.image, title, mes, params.currentUser.id);
            setAddLoading(false);
            alert(`${i18n.t('done')} ✅`);

            // CHECK IF EITHER OF U HAS SENT A FRIEND REQUEST... (THIS IS NOT FIXED YET)!!!!!!!
            const isReq = user.folls.filter(item=> item === params.currentUser.id).length > 0;
            const iReq = params.currentUser.folls.filter(item=> item === user.id).length > 0;
            if(isReq || iReq){
                await updateDoc(doc(db, "users", params.currentUser.id), {
                    folls: arrayRemove(user.id)
                });
                await updateDoc(doc(db, "users", user.id), {
                    folls: arrayRemove(params.currentUser.id)
                });
            }
            setHasUpdated('1');
            setIsDeleteMode(false);
            setCurrentFriend(null);
        } catch (error) {
            console.log(error);
            alert(i18n.t('errAddFr'));
            setAddLoading(false);
            setIsDeleteMode(false);
            setCurrentFriend(null);
        }
    }
    const followFriend = async()=>{
        let mes = `${user.username || user.fullname} has sent you a friend request.`;
        let title = `Friend Request`;
        setFollowLoading(true);
        try {
            await updateDoc(doc(db, "users", params.currentUser.id), {
                folls: arrayUnion(user.id)
            });
            setFollowLoading(false);
            alert(`${i18n.t('done')} ✅`);
            setHasUpdated('2');
            createGroupNotification(user.id, user.image, title, mes, params.currentUser.id);
            setIsDeleteMode(false);
            setCurrentFriend(null);
        } catch (error) {
            console.log(error);
            alert(i18n.t('errFrReq'));
            setFollowLoading(false);
            setIsDeleteMode(false);
            setCurrentFriend(null);
        }
    }
    // console.log(isMe)
   

   
    const promoteFollower = async(userid)=>{
        let mes = `Your request to befriend ${params.currentUser.username || params.currentUser.fullname} has been approved.`;
        let title = `Request approved`;
        setTopLoading(true);
        
        try {
            const washingtonRef = doc(db, "users", params.currentUser.id);
            const userRef = doc(db, "users", userid);
            await updateDoc(washingtonRef, {
                friends: arrayUnion(userid)
            });
            await updateDoc(userRef, {
                friends: arrayUnion(params.currentUser.id)
            });
            await updateDoc(washingtonRef, {
                folls: arrayRemove(userid)
            });
            setTopLoading(false);
            alert(`${i18n.t('done')} ✅`);
            createGroupNotification(params.currentUser.id, params.currentUser.image, title, mes, userid);
            setIsDeleteMode(false);
            setCurrentFriend(null);
            setHasUpdated('5');
        } catch (error) {
            console.log(error);
            alert(i18n.t('errWProc'));
            setTopLoading(false);
            setIsDeleteMode(false);
            setCurrentFriend(null);
        }
    }
    const sackFollower = async(userid)=>{
        setTopLoading(true);
        let mes = `Your request to befriend ${params.currentUser.username || params.currentUser.fullname} has been denied.`;
        let title = `Request declined`;
        try {
            const washingtonRef = doc(db, "users", params.currentUser.id);
            await updateDoc(washingtonRef, {
                folls: arrayRemove(userid)
            });
            setTopLoading(false);
            alert(`${i18n.t('done')} ✅`);
            setIsDeleteMode(false);
            setCurrentFriend(null);
            createGroupNotification(params.currentUser.id, params.currentUser.image, title, mes, userid);
            setHasUpdated('6');
        } catch (error) {
            console.log(error);
            setTopLoading(false);
            alert(i18n.t('errDecline'));
            setIsDeleteMode(false);
            setCurrentFriend(null);
        }
    }

    const cancelRequest = async()=>{
        setTopLoading(true);
        try {
            await updateDoc(doc(db, 'users', params.currentUser.id), {
                folls: arrayRemove(user.id)
            })
            alert(`${i18n.t('done')} ✅`);
            setHasUpdated('18');
            setTopLoading(false);
        } catch (error) {
            setTopLoading(false);
            console.log(error);
            alert(i18n.t('errFailed'))
        }
    }

    const leaveGroup = async(gid)=>{
        setTopLoading(true);
        try {
            const washingtonRef = doc(db, "users", params.currentUser.id);
            const groupRef = doc(db, "groups", gid);
            await updateDoc(washingtonRef, {
                groups: arrayRemove(gid)
            });
            await updateDoc(groupRef, {
                members: arrayRemove(params.currentUser.id)
            });
            setTopLoading(false);
            alert(`${i18n.t('done')} ✅`);
            setIsDeleteMode(false);
            setCurrentFriend(null);

            const q = query(
                collection(db, `favourites`), 
                and(where('id', '==', gid),
                where('user', '==', user.id)
                ));
                const chatqQuery = await getDocs(q);
                if(!chatqQuery.empty){
                    chatqQuery.docs.forEach(async(item)=>{
                    await deleteDoc(doc(db, 'favourites', item.id));
                })
            }
            setHasUpdated('7');

        } catch (error) {
            console.log(error);
            setTopLoading(false);
            alert(i18n.t('errLeaveGp'));
            setIsDeleteMode(false);
            setCurrentFriend(null);
        }
    }
    const unBlockFriend = async()=>{
        setTopLoading(true);
        try {
            const washingtonRef = doc(db, "users", params.currentUser.id);
            await updateDoc(washingtonRef, {
                blocked: arrayRemove(currentFriend),
                friends: arrayUnion(currentFriend)
            });
            setTopLoading(false);
            alert('Done ✅');
            setIsDeleteMode(false);
            setCurrentFriend(null);
            
        } catch (error) {
            console.log(error);
            setTopLoading(false);
            alert('Error occured unblocking friend');
            setIsDeleteMode(false);
            setCurrentFriend(null);
        }
    }
    const blockFriend = async()=>{
        setBlockLoading(true);
        try {
            const washingtonRef = doc(db, "users", user.id);
            await updateDoc(washingtonRef, {
                friends: arrayRemove(params.currentUser.id),
                blocked: arrayUnion(params.currentUser.id)
            });
            setBlockLoading(false);
            alert('Done ✅');
            setIsDeleteMode(false);
            setCurrentFriend(null);
            
        } catch (error) {
            console.log(error);
            setBlockLoading(false);
            alert('Error occured blocking friend');
            setIsDeleteMode(false);
            setCurrentFriend(null);
        }
    }
    const deleteFriend = ()=>{
        let mes = `${user.username || user.fullname} has unfriended you.`;
        let title = `Unfriended`;
        const chatId = user.id + params.currentUser.id;
        const chatId2 = params.currentUser.id + user.id;
        try {
            Alert.alert(i18n.t('df'), `${i18n.t('dfWarn')} ${i18n.t('dfWarn2')}`,
            [
                {text:i18n.t('yes'), onPress:async()=>{
                    const washingtonRef = doc(db, "users", user.id);
                    const userRef = doc(db, "users", params.currentUser.id);
                    setDeleteLoading(true);
                    await updateDoc(washingtonRef, {
                        friends: arrayRemove(params.currentUser.id)
                    });
                    await updateDoc(userRef, {
                        friends: arrayRemove(user.id)
                    });
                    alert(i18n.t('fdel'));
                    setDeleteLoading(false);
                    alert(`${i18n.t('done')} ✅`);
                    setIsDeleteMode(false);
                    setCurrentFriend(null);
                    createGroupNotification(user.id, user.image, title, mes, params.currentUser.id);
                    setHasUpdated('8');
                    const q = query(
                    collection(db, `favourites`), 
                    or(where('id', '==', chatId),
                    where('id', '==', chatId2)
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
            
        } catch (error) {
            console.log(error);
            setDeleteLoading(false);
            alert(i18n.t('errUnff'));
            setIsDeleteMode(false);
            setCurrentFriend(null);
        }
    }


    const handleDeleteFriend = (cid)=>{
        setCurrentFriend(cid);
        setIsDeleteMode(true)
        // Alert.alert('Delete Friend', `hi`)
    }
    const pressFriend = (fid)=>{
        if(isDeleteMode){
            setCurrentFriend(null);
            setIsDeleteMode(false)  
        }else{
           navigation.navigate('Chat', {chatNow:fid})
        }
        // Alert.alert('Delete Friend', `hi`)
    }


    const handleFollowList =()=>{
        setfMode(true);
        setCurrentListTitle('f')
        setGMode(false);
        setFavMode(false);
        setBMode(false);
        setFrMode(false);
    }
    const handleFavList =()=>{
        setFavMode(true);
        setCurrentListTitle('fa')
        setfMode(false);
        setGMode(false);
        setBMode(false);
        setFrMode(false);
    }
    const handleGroupList =()=>{
        setGMode(true);
        setCurrentListTitle('g')
        setfMode(false);
        setFavMode(false);
        setBMode(false);
        setFrMode(false);
    }
    const handleBlockedList =()=>{
        setBMode(true);
        setCurrentListTitle('b')
        setfMode(false);
        setGMode(false);
        setFavMode(false);
        setFrMode(false);
    }
    const handleFriendsList =()=>{
        setFrMode(true);
        setCurrentListTitle('fr')
        setfMode(false);
        setGMode(false);
        setFavMode(false);
        setBMode(false);
    }

    // console.log(isFollower)
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


    const removeCourse = async(c)=>{
        const courses =  studentCourses.filter(course=>course !==c );
        setStudentCourses(courses)
        setCourseLoading(true);
        try {
            await updateDoc(doc(db, 'users', params.currentUser.id),{
                cc: arrayRemove(c)
            })
            setCourseLoading(false);
            setIsDeleteMode(false);
            setCurrentFriend(null);
            setHasUpdated('9');
        } catch (error) {
            console.log(error);
            alert('Error occured. Try agin');
            setCourseLoading(false);
            setIsDeleteMode(false);
            setCurrentFriend(null);
        }
    }
    const addCourse = async()=>{
        if(newCourse === ''){
            alert(i18n.t('enterCc'));
        }
        else{

            setStudentCourses(studentCourses=>[...studentCourses, newCourse]);
            setNewMode(false);
            // setNewCourse('');
            try {
                await updateDoc(doc(db, 'users', params.currentUser.id),{
                    cc: arrayUnion(newCourse)
                })
                setNewCourse('');
                setIsDeleteMode(false);
                setCurrentFriend(null);
                setHasUpdated('10');
            } catch (error) {
                console.log(error);
                alert(i18n.t('errFailed'));
                setIsDeleteMode(false);
                setCurrentFriend(null);
            }
        }
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
            const storageRef = ref(storage, 'Profile/'+name);
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
                        await updateDoc(doc(db, 'users', params.currentUser.id), {
                            image: downloadURL
                        });
                    } catch (error) {
                        console.log(error)
                    }
                    console.log('File is available at ', downloadURL);
                    setHasUpdated('11');
                })
            }
            )
        }
        imageUri && UploadProfileImage();
    },[imageUri])

//    console.log(studentLevel);

    const updatePrimary = async()=>{
        const pData = {
            phone: phone !== ''? phone:params?.currentUser?.phone,
            dep: dep !== ''? dep:params?.currentUser?.dep,
            interest: interest !== ''? interest:params?.currentUser?.interest,
            fullname: fullname !== ''? fullname:params?.currentUser?.fullname,
            username: username !== ''? username:params?.currentUser?.username,
            desc: desc !== ''? desc:params?.currentUser?.desc,
            what: what !== ''? what:params?.currentUser?.what,
            level:studentLevel,
        }
        try {
            alert(`${i18n.t('done')} ✅`);
            await updateDoc(doc(db, 'users', params.currentUser.id), pData);
            setPhone('');
            setDep('');
            setInterest('');
            setFullname('');
            setUsername('');
            setDesc('');
            setHasUpdated('12');
        } catch (error) {
            console.log(error);
            alert(i18n.t('errFailed'));
        }
        
    }
    const updateSecondary = async()=>{
        const sData = {
            hidden: isHidden,
            public: isShowBasic,
            showFriends: isShowFriends
        }
        try {
            alert(`${i18n.t('done')} ✅`);
            await updateDoc(doc(db, 'users', params.currentUser.id), sData);
            setHasUpdated('13');
        } catch (error) {
            console.log(error);
            alert(i18n.t('errFailed'));
        }
    }
    // console.log(isShowFriends)



    const fetchRoom = async()=>{
        const chatId = user.id + params.currentUser.id;
        const chatId2 =  params.currentUser.id + user.id;
        const users = [user, params.currentUser];
        // setCurrentChat(id);
        try {
            setMessLoading(true);
            const roomData = {
                createdAt: new Date(),
                members:[user.id, params.currentUser.id],
                // image: params.currentUser.image,
                // name: params.currentUser.username,
                lastMsg:'',
                id: chatId,
                roomType:'private',
                notRead:[],
                users,
            }
    // console.log(roomData)
            // const q = query(
            //     collection(db, 'chats'), 
            //     or(where('id', '==', chatId),
            //     where('id', '==', chatId2)
            //     ));
            // const chatQuery = await getDocs(q);
            // console.log(chatQuery.docs)
            const chat = chats.filter(item=>item.id=== chatId || item.id === chatId2)[0];
            if(!chat){
                await setDoc(doc(db, 'chats', chatId), roomData);
                setMessLoading(false);
                navigation.navigate('Chat', {
                    users,
                    roomId:chatId,
                    roomType:'private',
                    what:params.currentUser?.what,
                    members:[user.id, params.currentUser.id],
                    data:null
                });
            }
            else{
                setMessLoading(false);
                navigation.navigate('Chat', {
                    users,
                    roomId:chat.id,
                    roomType:'private',
                    members:chat.members,
                });
            }
        } catch (error) {
            setMessLoading(false);
            console.log(error)
        }

    }

    // const txt = '+233541097145';
    // console.log(params.currentUser?.what);

    const createGroupWith =()=>{
        navigation.navigate('NewGroup', {newMember:params.currentUser.id});
    }

    const handleProfileBackBt = ()=>{
        if(params?.newProfile){
            navigation.replace('Tab', {screen:'ChatList', initial: false});
            // navigation.setParams({newProfile:false});
        }
        else{
            navigation.goBack()
        }
    }

    // console.log('image: ', user.image);
    const resetImage = async()=>{
        setImageUri(null);
        try {
            await updateDoc(doc(db, 'users', params.currentUser.id), {
                image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSpbF9MRc872DyqrFDJJ3MRq68r08IaEKCNGzAqYNpeSK38HOao_E2_50CtB2V4TGM_5ag&usqp=CAU"
            })
            alert(`${i18n.t('done')} ✅`);
        } catch (error) {
            console.log(error);
            alert(i18n.t('errFailed'));
        }
    }

    // console.log(isMe);

    return (
        <SafeAreaView style={[styles.main, {backgroundColor:dark? Colours.bacDark:Colours.bacLight}]} >
            {!isEditMode &&
                <View style={styles.header} >
                    <Pressable onPress={handleProfileBackBt} style={styles.back} >
                        <Ionicons  name="chevron-back-circle" size={40} color="#b9b7b7" />
                    </Pressable>
                    <Text style={[styles.editHeader, {color:dark? Colours.titeleDark:Colours.titeleLight }]}>{i18n.t('prof')}</Text>
                </View>
            }
            {
                !isEditMode ?
                <ScrollView>
                    <View style={styles.container} >
                        <View style={styles.top} >
                            {
                                params?.currentUser?.image &&
                                <View style={styles.imgcontainer}>
                                    <Image style={styles.img} source={{uri:params?.currentUser?.image}} />
                                </View>
                            }
                            {
                                (isMe || params.currentUser.showFriends) &&
                                <View style={styles.maindetail} >
                                    <Text style={[styles.nametext, {color:dark?Colours.titeleDark:Colours.textLight}]} >{params?.currentUser?.username} {params.currentUser?.level && `(${i18n.t('level')} `+ params.currentUser?.level+')'} </Text>
                                    <View style={styles.otherdetail} >
                                        <View>
                                            <Text style={[styles.others, {color: dark?Colours.titeleDark: Colours.textLight}]} >{params?.currentUser?.dep.length > 15 ? params?.currentUser?.dep.substring(0, 15)+'...':params?.currentUser?.dep }</Text>
                                            <Text style={[styles.others, {color: dark?Colours.titeleDark: Colours.textLight}]} >{params?.currentUser?.interest.length > 15 ? params?.currentUser?.interest.substring(0, 15)+'...':params?.currentUser?.interest }</Text>
                                        </View>
                                        <View  >
                                            <Text style={[styles.others, {color: dark?Colours.titeleDark: Colours.textLight}]} >{params?.currentUser?.friends?.length} {i18n.t('frds')}</Text>
                                            <Text style={[styles.others, {color: dark?Colours.titeleDark: Colours.textLight}]} >{params?.currentUser?.phone}</Text>
                                        </View>
                                    </View>
                                </View>
                            }
                            <View style={styles.butt} >
                                
                                {
                                    isFriend &&
                                    <>
                                    {
                                        messLoading ? <ActivityIndicator size={'small'} /> :
                                        <Pressable onPress={fetchRoom} style={styles.oneButt} >
                                            <AntDesign name="message1" size={24} color="#4aacf3" />
                                            <Text style={[styles.buttText, {color:dark?Colours.textDark:Colours.subTextDark}]} >{i18n.t('mess')}</Text>
                                        </Pressable>
                                    }
                                    </>
                                }
                                {
                                    !isFriend && !isMe && params.currentUser.public &&
                                    <View style={styles.oneButt} >
                                        {
                                            addLoading ?
                                            <ActivityIndicator size={'small'} />
                                            :
                                            <>
                                            <Pressable style={styles.oneButt} onPress={addFriend} >
                                                <AntDesign name="adduser" size={24} color="#4aacf3" />
                                                <Text style={[styles.buttText, {color:dark?Colours.textDark:Colours.subTextDark}]} >{i18n.t('addCont')}</Text>
                                            </Pressable>
                                            </>
                                        }
                                    </View>
                                }
                                {
                                    isFriend &&
                                    <>
                                        <Pressable onPress={createGroupWith} style={styles.oneButt} >
                                            <AntDesign name="addusergroup" size={24} color="#4aacf3" />
                                            <Text style={[styles.buttText, {color:dark?Colours.textDark:Colours.subTextDark}]} >{i18n.t('crtG')}</Text>
                                        </Pressable>

                                        {
                                            !isMe && params.currentUser?.what &&
                                            <View style={styles.oneButt} >
                                                
                                                    <Pressable style={styles.oneButt} onPress={()=>Linking.openURL(`whatsapp://send?phone=${params.currentUser?.what}`)} >
                                                        <FontAwesome name="whatsapp" size={24} color="#4aacf3" />
                                                        <Text style={[styles.buttText, {color:dark?Colours.textDark:Colours.subTextDark}]} >WhatsApp</Text>
                                                    </Pressable>
                                            </View>
                                        }

                                        {
                                            deleteLoading ?
                                            <ActivityIndicator size={'small'} />
                                            :

                                            <Pressable onPress={deleteFriend} style={styles.oneButt} >
                                                <Ionicons name="trash-bin-outline" size={24} color="#4aacf3" />
                                                <Text style={[styles.buttText, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{i18n.t('del')}</Text>
                                            </Pressable>
                                        }
                                    </>
                                }

                                    {
                                        (!isFollower && !isFriend && !isMe && !params.currentUser.public) &&
                                        <>
                                        {
                                            followLoading ?
                                            <ActivityIndicator size={'small'} />:
                                            <Pressable onPress={followFriend} style={styles.oneButt} >
                                                <Feather name="upload" size={24} color="#4aacf3" />
                                                <Text style={[styles.buttText, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >Send request</Text>
                                            </Pressable>
                                        }
                                        </>
                                    }
                                
                                {
                                    isMe &&
                                    <>
                                    <Pressable onPress={()=>setIsEditMode(true)} style={styles.oneButt} >
                                        <AntDesign name="edit" size={24} color="#4aacf3" />
                                        <Text style={[styles.buttText, {color:dark?Colours.textDark:Colours.subTextDark}]} >{i18n.t('edit')}</Text>
                                    </Pressable>
                              
                                    <Pressable onPress={handleLogout} style={styles.oneButt} >
                                        {
                                            logoutLoading ? <ActivityIndicator size={'small'} />:
                                            <>
                                            <AntDesign name="logout" size={24} color="#4aacf3" />
                                            <Text style={[styles.buttText, {color:dark?Colours.textDark:Colours.subTextDark}]} >{i18n.t('logout')}</Text>
                                            </>
                                        }
                                    </Pressable>
                                    </>
                                }
                            </View>
                        </View>
                        <View style={styles.middle} >
                            {
                                params?.currentUser?.desc &&
                                <View style={styles.blur} >
                                    <Text style={[styles.blurname, {color:dark?Colours.textDark:Colours.textLight}]} >{params?.currentUser?.fullname || params?.currentUser?.username}</Text>
                                    <Text style={[styles.blurtext, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{params?.currentUser?.desc}</Text>
                                </View>
                            }
                            {
                                params.currentUser.cc.length > 0 &&
                                <View style={styles.blur} >
                                    <Text style={[styles.blurname, {color:dark?Colours.textDark:Colours.textLight}]} >{i18n.t('courses')} ({params?.currentUser?.cc.length})</Text>
                                    {
                                        params.currentUser.cc.map((course, index)=>(
                                            <Text key={index} style={[styles.blurtext, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{course}</Text>
                                        ))
                                    }
                                </View>
                            }
                            
                        </View>
                    {
                        (isMe || params.currentUser.showFriends) &&
                        <View style={styles.down} >
                            <View style={styles.downHeaders} >
                                <Pressable onPress={handleFriendsList} style={curentListTitle === 'fr' ? styles.headersBut : [styles.headersBut2, {backgroundColor:Colours.bacDark}]} >
                                    <FontAwesome5 name="user-friends" style={[styles.frds, {color:Colours.bacLight}]} size={24} />
                                </Pressable>
                               
                                <Pressable onPress={handleFollowList} style={curentListTitle === 'f' ? styles.headersBut : [styles.headersBut2, {backgroundColor:Colours.bacDark}]} >
                                    <Entypo name="add-user" size={24} style={[styles.frds, {color:Colours.bacLight}]} />
                                </Pressable>
                                {/* <Pressable onPress={handleBlockedList} style={curentListTitle === 'b' ? styles.headersBut : [styles.headersBut2, {backgroundColor:Colours.bacDark}]} >
                                    <Entypo name="remove-user" size={24} style={[styles.frds, {color:Colours.bacLight}]} />
                                </Pressable> */}
                                <Pressable onPress={handleGroupList} style={curentListTitle === 'g' ? styles.headersBut : [styles.headersBut2, {backgroundColor:Colours.bacDark}]} >
                                    <FontAwesome name="group" style={[styles.frds, {color:Colours.bacLight}]} size={24}  />
                                </Pressable>
                            </View>
                            <TextInput style={[styles.oneInput3, {color:dark?Colours.iconDark:Colours.iconDark}]} 
                                placeholder={i18n.t('secfrd')}
                                value={qquery}
                                onChangeText={e=>setQuery(e)}
                            />
                            
                            {
                                fMode && params?.currentUser?.folls && 
                                students.filter((us)=>params.currentUser?.folls?.includes(us.id)).filter(item=>{
                                    return qquery === ''? item : Object.values(item)
                                    .join(' ')
                                    .toLowerCase()
                                    .includes(qquery.toLowerCase())}).map((frd)=>(
                                <TouchableOpacity onLongPress={()=>handleDeleteFriend(frd.id)} onPress={()=>navigation.replace('Profile', {currentUser:frd})} key={frd.id} style={styles.oneContact} >
                                    <View  style={styles.contactImg} >
                                        {
                                            frd.image &&
                                            <Image style={styles.frdimage} source={{uri:frd?.image }} />
                                        } 
                                        <Text style={[styles.frdname, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{frd?.fullname||frd?.username}</Text>
                                    </View>
                                    {
                                        isDeleteMode && frd.id === currentFriend && (isMe || frd.id === user.id) &&
                                        <View style={styles.usermode} >
                                            {
                                                topLoading?
                                                <ActivityIndicator size={'small'} />
                                                :
                                                <>
                                                {
                                                    isMe &&
                                                    <Pressable onPress={()=>promoteFollower(frd.id)} >
                                                        <AntDesign name="adduser" size={24} color="#4aacf3" />
                                                    </Pressable>
                                                }
                                                <Pressable onPress={frd.id === user.id ? cancelRequest : ()=>sackFollower(frd.id)} > 
                                                    <Entypo name="cross" size={24} color="#dc1499" />
                                                </Pressable>
                                                </>
                                            }
                                        </View>
                                    }
                                </TouchableOpacity>
                                ))
                            }
                            {
                                gMode && params?.currentUser?.groups && 
                                allGroups.filter((us)=>params?.currentUser?.groups?.includes(us.id)).filter(gp=> !gp.hidden)
                                .filter(item=>{
                                    return qquery === ''? item : Object.values(item)
                                    .join(' ')
                                    .toLowerCase()
                                    .includes(qquery.toLowerCase())}).map((frd)=>(
                                        <TouchableOpacity onLongPress={()=>handleDeleteFriend(frd.id)} onPress={()=>navigation.navigate('Group', {curGroup:frd})} key={frd.id} style={styles.oneContact} >
                                    <View  style={styles.contactImg} > 
                                        {
                                            frd.image &&
                                            <Image style={styles.frdimage} source={{uri:frd?.image }} />
                                        }
                                        <Text style={[styles.frdname, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{frd.gname}</Text>
                                    </View>
                                    {
                                        isDeleteMode && frd.id === currentFriend && isMe &&
                                        <>
                                        {
                                            topLoading ?
                                            <ActivityIndicator size={'small'} />
                                            :

                                            <Pressable onPress={()=>leaveGroup(frd.id)} >
                                                <Ionicons name="arrow-forward-circle-outline" size={24} color="#dc1499" />
                                            </Pressable>
                                        }
                                        </>
                                    }
                                </TouchableOpacity>
                                ))
                            }
                            {
                                bMode && params?.currentUser?.blocked && 
                                students.filter((us)=>params.currentUser?.blocked?.includes(us.id)).filter(item=>{
                                    return qquery === ''? item : Object.values(item)
                                    .join(' ')
                                    .toLowerCase()
                                    .includes(qquery.toLowerCase())}).map((frd)=>(
                                        <TouchableOpacity onLongPress={()=>handleDeleteFriend(frd.id)} onPress={()=>navigation.replace('Profile', {currentUser:frd})}key={frd.id} style={styles.oneContact} >
                                    <View  style={styles.contactImg} > 
                                        {
                                            frd.image &&
                                            <Image style={styles.frdimage} source={{uri:frd?.image }} />
                                        }
                                        <Text style={[styles.frdname, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{frd?.fullname || frd?.username}</Text>
                                    </View>
                                    {
                                        isDeleteMode && frd.id === currentFriend && isMe &&
                                        <>
                                        {
                                            topLoading ?
                                            <ActivityIndicator size={'small'} />
                                            :
                                            <Pressable onPress={()=>unBlockFriend(frd.id)} >
                                                <Feather name="user-check" size={24} color="#dc1499" />
                                            </Pressable>
                                        }
                                        </>
                                    }
                                </TouchableOpacity>
                                ))
                            }
                            {
                                frMode && params?.currentUser?.friends && 
                                students.filter((us)=>params.currentUser?.friends?.includes(us.id)).filter(item=>{
                                    return qquery === ''? item : Object.values(item)
                                    .join(' ')
                                    .toLowerCase()
                                    .includes(qquery.toLowerCase())}).map((frd)=>(
                                        <TouchableOpacity  onPress={()=>navigation.replace('Profile', {currentUser:frd})} key={frd.id} style={styles.oneContact} >
                                    <View  style={styles.contactImg} > 
                                        {
                                            frd.image &&
                                            <Image style={styles.frdimage} source={{uri:frd?.image }} />
                                        }
                                        <Text style={[styles.frdname, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{frd?.fullname || frd?.username}</Text>
                                    </View>
                                   
                                </TouchableOpacity>
                                ))
                            }

                        </View>
                        }
                    
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
                    <Text style={[styles.editHeader, {color:dark? Colours.titeleDark:Colours.titeleLight }]}>{i18n.t('editDetail')}</Text>
                </View>
                <ScrollView>
                        <View style={styles.editmode} >
                            <TouchableOpacity onPress={()=>setIsPictureMode(true)} style={styles.pictureImage} >
                                <Image style={styles.userPic} source={{uri: imageUri? imageUri: params?.currentUser.image}} />
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
                                    <Text style={[styles.editText, {color:dark?Colours.textDark:Colours.subTextDark}]} >{i18n.t('username')}</Text>
                                    <TextInput style={[styles.oneInput, {backgroundColor:dark?Colours.iconDark:Colours.textDark, color: dark?Colours.bacLight:Colours.subTextDark}]} 
                                    placeholder={params?.currentUser?.username|| i18n.t('editU')}
                                    value={username}
                                    onChangeText={e=>setUsername(e)}
                                    />
                                </View>

                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.textDark:Colours.subTextDark}]} >{i18n.t('full')}</Text>
                                    <TextInput style={[styles.oneInput, {backgroundColor:dark?Colours.iconDark:Colours.textDark, color: dark?Colours.bacLight:Colours.subTextDark}]} 
                                    placeholder={params?.currentUser?.fullname || i18n.t('fullN')}
                                    value={fullname}
                                    onChangeText={e=>setFullname(e)}
                                    />
                                </View>

                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.textDark:Colours.subTextDark}]}>{i18n.t('dep')}</Text>
                                    <TextInput style={[styles.oneInput, {backgroundColor:dark?Colours.iconDark:Colours.textDark, color: dark?Colours.bacLight:Colours.subTextDark}]} 
                                    placeholder={params?.currentUser?.dep || 'Edit department'}
                                    value={dep}
                                    onChangeText={e=>setDep(e)}
                                    />
                                </View>
                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.textDark:Colours.subTextDark}]}>{i18n.t('level')}</Text>
                                    <SelectList
                                        setSelected={(e)=>setStudentLevel(e)}
                                        data={[{key:1, value:'100'}, {key:2, value:'200' }, {key:3, value:'300' }, {key:4, value:'400' },]}
                                        save='value'
                                        search={false}
                                        dropdownTextStyles={{color:dark?Colours.titeleDark:Colours.subTextDark}}
                                        inputStyles={{color:dark?Colours.titeleDark:Colours.subTextDark, fontSize:16, }}
                                        boxStyles={{borderColor:'#4aacf3', borderWidth:1, backgroundColor:dark?Colours.iconDark:Colours.textDark}}
                                        arrowicon={<FontAwesome name="chevron-down" size={12} color={dark?Colours.bacLight:Colours.subTextDark} />}
                                        // defaultOption={{key:1, value:params?.currentUser?.level || '100'}}
                                    />
                                </View>

                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.textDark:Colours.subTextDark}]}>{i18n.t('phoneNumb')}</Text>
                                    <TextInput style={[styles.oneInput, {backgroundColor:dark?Colours.iconDark:Colours.textDark, color: dark?Colours.bacLight:Colours.subTextDark}]} 
                                    placeholder={params?.currentUser?.phone || i18n.t('editPn')}
                                    keyboardType='number-pad'
                                    value={phone}
                                    onChangeText={e=>setPhone(e)}
                                    />
                                </View>

                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.textDark:Colours.subTextDark}]}>WhatsApp contact</Text>
                                    <TextInput style={[styles.oneInput, {backgroundColor:dark?Colours.iconDark:Colours.textDark, color: dark?Colours.bacLight:Colours.subTextDark}]} 
                                    placeholder={params?.currentUser?.what || 'Edit WhatsApp number'}
                                    keyboardType='number-pad'
                                    value={what}
                                    onChangeText={e=>setWhat(e)}
                                    />
                                </View>

                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.textDark:Colours.subTextDark}]}>{i18n.t('int')}</Text>
                                    <TextInput style={[styles.oneInput, {backgroundColor:dark?Colours.iconDark:Colours.textDark, color: dark?Colours.bacLight:Colours.subTextDark}]} 
                                    placeholder={params?.currentUser?.interest || i18n.t('editInt')}
                                    value={interest}
                                    onChangeText={e=>setInterest(e)}
                                    />
                                </View>

                                <View style={styles.oneEdit} >
                                    <Text style={[styles.editText, {color:dark?Colours.textDark:Colours.subTextDark}]}>{i18n.t('decSelf')}</Text>
                                    <TextInput style={[styles.oneInput2, {backgroundColor:dark?Colours.iconDark:Colours.textDark, color: dark?Colours.bacLight:Colours.subTextDark}]} 
                                    placeholder={params?.currentUser?.desc || i18n.t('desSay')}
                                    multiline
                                    numberOfLines={3}
                                    value={desc}
                                    onChangeText={e=>setDesc(e)}
                                    />
                                </View>

                                {
                                    params?.currentUser?.cc.length > 0 &&
                                    <View style={styles.oneEdit2} >
                                        <Text style={[styles.editText, {color:dark?Colours.textDark:Colours.subTextDark}]}>{i18n.t('courses')}</Text>
                                        {
                                            params?.currentUser?.cc.map((course, index)=>(
                                                <View key={index} style={styles.oneCourse} >
                                                    <Text style={{color:dark?Colours.titeleDark:Colours.subTextDark}}>{course}</Text>
                                                    {
                                                        courseLoading ? 
                                                        <ActivityIndicator size={'small'} />
                                                        :
                                                        <Pressable onPress={()=>removeCourse(course)} style={styles.plus} >
                                                            <Entypo name="cross" size={24} color="#dc1482" />
                                                        </Pressable>
                                                    }
                                                </View>
                                            ))
                                        }
                                    </View>
                                }
                                <View style={styles.oneEdit} >
                                    {
                                        !newMode? 
                                        <Pressable onPress={()=>setNewMode(true)} style={[styles.addCourse, {backgroundColor:dark?'#4343c5':'orange'}]} >
                                            <Text style={[styles.editText, {color:dark?Colours.textDark:Colours.subTextDark}]}>{i18n.t('addCc')}</Text>
                                        </Pressable>
                                        :
                                        <View style={styles.courseDown} >
                                            <TextInput style={[styles.oneInput4, {color:dark?Colours.bacLight:Colours.subTextDark}]} 
                                            placeholder={i18n.t('enterCc')}
                                            placeholderTextColor='#99999B'
                                            value={newCourse}
                                            onChangeText={(e)=>setNewCourse(e)}
                                            />
                                            <View style={styles.coursePress} >
                                                <Pressable onPress={addCourse} style={styles.plus} >
                                                    <AntDesign name="plussquare" size={40} color={dark?'antiquewhite':'orange'} />
                                                </Pressable>
                                                <Pressable onPress={()=>setNewMode(false)} style={styles.plus} >
                                                    <Entypo name="squared-cross" size={40} color="#dc1482" />
                                                </Pressable>
                                            </View>
                                        </View>
                                    }
                                </View>
                                <TouchableOpacity onPress={updatePrimary} style={styles.save} >
                                    <Text style={styles.primarySave} >{i18n.t('save')}</Text>
                                </TouchableOpacity>
                            </View>

                            {/* privacy */}
                            <View style={styles.primary} >
                                <Text style={[styles.primaryHeader, {color:dark?Colours.titeleDark:Colours.textLight}]} >{i18n.t('pvcDetails')}</Text>
                                <View style={styles.oneSwitch} >
                                    <View style={styles.mainSwitch} >
                                        <Text style={[styles.switchTitle, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('showBscInfo')}</Text>
                                        <Text style={[styles.switchText, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('bscInfo')}</Text>
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
                                        <Text style={[styles.switchTitle, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('keepmehid')}</Text>
                                        <Text style={[styles.switchText, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('keepmeindex')}</Text>
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
                                        <Text style={[styles.switchTitle, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('showFrds')}</Text>
                                        <Text style={[styles.switchText, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('frdsInfo')}</Text>
                                    </View>
                                    <Switch 
                                        trackColor={{false: '#767577', true: '#81b0ff'}}
                                        thumbColor={isShowFriends ? '#035CDA' : '#f4f3f4'}
                                        ios_backgroundColor="#3e3e3e"
                                        onValueChange={()=>setIsShowFriends(!isShowFriends)}
                                        value={isShowFriends}
                                    />
                                </View>
                                <View style={styles.oneSwitch} >
                                    <View style={styles.mainSwitch} >
                                        <Text style={[styles.switchText, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('note')}</Text>
                                    </View>
                                   
                                </View>

                                
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

export default Profile

const styles = StyleSheet.create({
    usermode:{
        flexDirection:'row',
        gap:5
    },
    oneCourse:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        // width:'80%',
    },
    // editText2:{
    //     color:'antiquewhite',
    //     // fontWeight:'bold'
    // },
    oneEdit2:{
        width:'82%',
        // alignItems:'center',
        justifyContent:'center',
        gap:2,
        flexDirection:'column',
        paddingHorizontal:5,
        borderColor:'#4aacf3',
        borderWidth:0.5,
        borderRadius:5
    },
    coursePress:{
        flexDirection:'row',
        alignSelf:'flex-end',
        // justifyContent:'center'
        // alignItems:'center'
    },
    courseDown:{
        flexDirection:'row',
        // gap:8,
        justifyContent:'space-between'
    },
    addCourse:{
        justifyContent:'center',
        // backgroundColor:'#4343c5',
        width:165,
        alignItems:'center',
        paddingVertical:5,
        paddingHorizontal:8,
        borderRadius:5
    },
    oneInput4:{
        width:'70%',
        fontSize:16,
        paddingVertical:6,
        // backgroundColor:'#99999B',
        // borderRadius:6,
        paddingHorizontal:10,
        borderBottomWidth:1,
        borderColor:'#4aacf3',
        maxWidth:'70%'
    },
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
        alignItems:'center',
        alignSelf:'center',
        justifyContent:'space-evenly',
        width:'100%'
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
        paddingHorizontal:10,
        borderWidth:1,
        borderColor:'#4aacf3',
        maxHeight:200,
        maxWidth:'100%'
    },
    oneInput3:{
        width:'90%',
        fontSize:16,
        paddingVertical:6,
        borderRadius:6,
        color:'white',
        paddingHorizontal:10,
        borderWidth:1,
        borderColor:'#4aacf3',
        maxWidth:'90%'
    },
    oneInput:{
        width:'100%',
        fontSize:16,
        paddingVertical:6,
        borderRadius:6,
        paddingHorizontal:10,
        borderWidth:1,
        borderColor:'#4aacf3',
        maxWidth:'100%',
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
        borderRadius:20
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
        paddingBottom:15,
        marginBottom:15
    },
    frdname:{
        fontSize:16,
        fontWeight:'700'
    },
    frdimage:{
        width:50,
        height:50,
        borderRadius:25
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
    },
    down:{
        width:'100%',
        justifyContent:'center',
        gap:10,
        flexDirection:'column'
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
        borderRadius:10,
    },
    middle:{
        width:'100%',
        alignItems:'center',
        gap:10
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
        width:65,
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
        fontSize:16
    },
    otherdetail:{
        width:'80%',
        alignItems:'center',
        justifyContent:'space-between',
        flexDirection:'row',
        paddingHorizontal:10,
        paddingVertical:8,
        borderRadius:10,
        borderWidth:1,
        borderColor:'#4aacf3',
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
        width:'100%',
        height:'100%',
        transform:[{rotate:('10deg')}],
        borderRadius:10,
        aspectRatio:'4/4'
    },
    imgcontainer:{
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'rgb(74, 172, 243)',
        width:'60%',
        height:200,
        marginTop:30,
        borderRadius:30,
        transform:'rotate(-10deg)',
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
        paddingHorizontal:10,
        marginBottom:50
    },
    main:{
        flex:1,
        width:'100%',
        // alignItems:'center',
        // justifyContent:'center',
        paddingTop: 10,
        flexDirection:'column',
        // gap:20,
        position:'relative'
      }
})
