import React, { useContext, useEffect, useState } from 'react'
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, Modal, Alert, ActivityIndicator } from 'react-native'
import { AntDesign, MaterialIcons, FontAwesome, Feather, Ionicons, Entypo, MaterialCommunityIcons  } from '@expo/vector-icons';
import { SelectList } from 'react-native-dropdown-select-list'
import * as ImagePicker from 'expo-image-picker';
import { SettingsContext } from '../../components/context/settings/SettingsContext';
import { Colours } from '../../../utils/MyColours';
import { AuthContext } from '../../components/context/authContext/AuthContext';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { db, storage } from '../../../../firebase';
import { Timestamp, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { addData } from '../../../miscellaneous/endpoints';
import { useRoute } from '@react-navigation/native';
import { FetchUsersContext } from '../../components/context/fetch/fetchUsersContext';
import { sendUniversalNotification } from '../../../utils/functions';

const NewGroup = ({navigation}) => {
    const {dark, i18n} = useContext(SettingsContext);
    const {user} = useContext(AuthContext);
    const {students} = useContext(FetchUsersContext);
    const {params} = useRoute();

    const [groupType, setGroupType] = useState('Public');
    const [groupLevel, setGroupLevel] = useState('100');
    const [isPictureMode, setIsPictureMode] =useState(false);
    const [imageUri, setImageUri] = useState('');
    const [imageLink, setImageLink] = useState(null);
    const [perc, setPerc] = useState('');

    const [gname, setGname] = useState('');
    const [dep, setDep] = useState('');
    const [cc, setCc] = useState('');
    const [course, setCourse] = useState('');
    const [maxNum, setMaxNum] = useState(2);
    const [pub, setPub] = useState(true);
    const [postLoading, setPostingLoading] = useState(false);
    const [desc, setDesc] = useState('');

    const [tokens, setTokens] = useState([]);
   

    useEffect(()=>{
        let list = [];
        students
            .filter(s=> s.id !== user.id)
            .filter(st=> st.allowNoti)
            .filter(student=> student.dep.toLowerCase() === dep.toLowerCase())
            .filter(stu=> stu.level === groupLevel)
            .forEach(item=>{
            list.push(item.tokens)
        });
        setTokens(list);
    },[dep, groupLevel])

        console.log(tokens)
    // console.log(params?.newMember)
    // navigation.setParams({newMember:null})
    // console.log(params?.newMember)
    const createGroup = async()=>{
        setPostingLoading(true);
        const data = {
            creatorId: user.id,
            gname,
            dep,
            cc,
            course,
            maxNum,
            level:groupLevel,
            public:pub,
            image:imageLink || 'https://static.javatpoint.com/tutorial/group-discussion/images/importance-of-gd.png',
            hidden:false,
            createdAt:Timestamp.fromDate(new Date()),
            admins:[user.id],
            members:[user.id],
            folls:[],
            desc,
            adds: [],
            tokens: [user?.tokens]
        };
        if(gname===''||dep===''||cc===''||course===''||maxNum===''){
            alert('Complete the fields ❗');
            setPostingLoading(false);
        }
        else{
            try {
                // alert('Success ✅');
                const group = await addData('groups', data);
                await updateDoc(doc(db, 'users', user.id),{
                    groups: arrayUnion(group.id)
                })
                if(params?.newMember){
                    await updateDoc(doc(db, 'users', params?.newMember),{
                        groups: arrayUnion(group.id)
                    })
                    await updateDoc(doc(db, 'groups', group.id),{
                        members: arrayUnion(params?.newMember)
                    })
                    navigation.setParams({newMember:null})
                }
                const newgp =  await getDoc(doc(db, 'groups', group.id));
                setPostingLoading(false);
                const title = 'Group Opportunity';
                const content = `A study room called '${newgp.data().gname}' has been created in your department for ${course}`;
                setGname(''); setDep(''); setCc(''); setCourse(''); setMaxNum('');
                navigation.navigate('Group', {curGroup:{...newgp.data(), id: newgp.id}});
                if(newgp.data().public){
                    sendUniversalNotification(title, content, tokens);
                }
            } catch (error) {
                console.log(error)
                setPostingLoading(false);
                alert(i18n.t('oppFailed'))
            }
        }
    }
    
// console.log(curGroup)
    useEffect(()=>{
        if(groupType==='Public'){
            setPub(true)
        }
        else if(groupType === 'Private'){
            setPub(false);
        }
    }, [groupType])
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
            const storageRef = ref(storage, 'Group/'+name);
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
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=>{
                    console.log('File is available at ', downloadURL);
                    setImageLink(downloadURL);
                })
            }
            )
        }
        imageUri && UploadProfileImage();
    },[imageUri])

// console.log(perc)
    return (
        <SafeAreaView style={[styles.main, {backgroundColor: dark? Colours.bacDark:Colours.bacLight}]} >
            <View style={styles.header} >
                <Pressable onPress={()=>navigation.navigate('More')} style={styles.back} >
                    <Ionicons  name="chevron-back-circle" size={40} color="#b9b7b7" />
                </Pressable>
                <Text style={[styles.editHeader, {color: dark ? Colours.titeleDark:Colours.titeleLight}]}>{i18n.t('newGTitle')}</Text>
            </View>

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

                        <TouchableOpacity onPress={()=>setImageUri(null)} style={styles.oneModal} >
                            <Feather name="camera-off" size={24} color="black" />
                            <Text style={styles.oneModalText} >{i18n.t('rem')}</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

            <ScrollView style={{width:'100%'}} >
                <View style={styles.container} >
                    <View style={styles.top}>
                        <TouchableOpacity onPress={()=>setIsPictureMode(true)} style={[styles.imageContainer, {backgroundColor:Colours.mainBlue}]} >
                            <Image style={styles.img} source={{uri: imageUri ? imageUri : 'https://static.javatpoint.com/tutorial/group-discussion/images/importance-of-gd.png'}} />
                            <Pressable onPress={()=>setIsPictureMode(true)} style={styles.cam} >
                                <FontAwesome  name="camera" size={44} color="black" />
                            </Pressable>
                        </TouchableOpacity>
                        {
                            perc !=='' && perc < 100 && <Text style={{color:'crimson'}} >{i18n.t('uploadPic')}: {Math.floor(perc)}%</Text>
                        }
                        {
                            perc === 100 && <Text style={{color:'green'}} >{i18n.t('doneUpload')}: {(perc)}%</Text>
                        }
                        <TextInput
                            placeholder={i18n.t('enterGName')}
                            value={gname}
                            onChangeText={e=>setGname(e)}
                            style={[styles.groupName, {borderBottomColor: Colours.mainBlue, color:dark?Colours.titeleDark:Colours.subTextDark}]}
                            placeholderTextColor='grey'
                        />
                    </View>
                    <View style={styles.middle} >
                        <View style={styles.one} >
                            <Text style={[styles.oneTitle, {color: dark? Colours.textDark:Colours.textLight}]} >{i18n.t('sltLevel')}</Text>
                            <SelectList
                                setSelected={(e)=>setGroupLevel(e)}
                                data={[{key:1, value:'100'}, {key:2, value:'200' }, {key:3, value:'300' }, {key:4, value:'400' },]}
                                save='value'
                                search={false}
                                dropdownTextStyles={{color:dark?Colours.titeleDark:Colours.subTextDark}}
                                inputStyles={{color:dark?Colours.titeleDark:Colours.subTextDark, fontSize:16}}
                                boxStyles={{borderColor:Colours.mainBlue, borderWidth:1}}
                                arrowicon={<FontAwesome name="chevron-down" size={12} color={dark? Colours.textLight: Colours.subTextDark} />}
                                // defaultOption={{key:1, value:'100',}}
                            />
                        </View>
                        <View style={styles.one} >
                            <Text style={[styles.oneTitle, {color: dark? Colours.textLight:Colours.textLight}]} >{i18n.t('spcDep')}</Text>
                            <TextInput
                                style={[styles.oneInput, {color:dark?Colours.titeleDark:Colours.subTextDark}]}
                                value={dep}
                                onChangeText={e=>setDep(e)}
                                placeholder={i18n.t('enterDDDep')}
                                placeholderTextColor='grey'
                            />
                        </View>
                        <View style={styles.one} >
                            <Text style={[styles.oneTitle, {color: dark? Colours.textLight:Colours.textLight}]} >{i18n.t('cct')}</Text>
                            <TextInput
                                style={[styles.oneInput, {color:dark?Colours.titeleDark:Colours.subTextDark}]}
                                value={course}
                                onChangeText={e=>setCourse(e)}
                                placeholder={i18n.t('enterDDC')}
                                placeholderTextColor='grey'
                            />
                        </View>
                        <View style={styles.one} >
                            <Text style={[styles.oneTitle, {color: dark? Colours.textLight:Colours.textLight}]} >{i18n.t('cc')}</Text>
                            <TextInput
                                style={[styles.oneInput, {color:dark?Colours.titeleDark:Colours.subTextDark}]}
                                value={cc}
                                onChangeText={e=>setCc(e)}
                                placeholder={i18n.t('enterCc')}
                                placeholderTextColor='grey'
                            />
                        </View>
                        <View style={styles.one} >
                            <Text style={[styles.oneTitle, {color: dark? Colours.textLight:Colours.textLight}]} >{i18n.t('maxMem')}</Text>
                            <TextInput
                                style={[styles.oneInput, {color:dark?Colours.titeleDark:Colours.subTextDark}]}
                                placeholder={i18n.t('enterMaxMem')}
                                value={maxNum.toString()}
                                onChangeText={e=>setMaxNum(e)}
                                keyboardType='numeric'
                                placeholderTextColor='grey'
                            />
                        </View>
                        <View style={styles.one} >
                            <Text style={[styles.oneTitle, {color: dark? Colours.textLight:Colours.textLight}]} >{i18n.t('gType')}</Text>
                            <SelectList
                                setSelected={(e)=>setGroupType(e)}
                                data={[{key:1, value:i18n.t('public')}, {key:2, value:i18n.t('private') }]}
                                save='value'
                                search={false}
                                dropdownTextStyles={{color:dark?Colours.titeleDark:Colours.subTextDark}}
                                inputStyles={{color:dark?Colours.titeleDark:Colours.subTextDark, fontSize:16}}
                                boxStyles={{borderColor:'#4aacf3', borderWidth:1}}
                                arrowicon={<FontAwesome name="chevron-down" size={12} color={dark? Colours.textLight: Colours.subTextDark} />}
                                defaultOption={{key:1, value:'Public',}}
                            />
                        </View>
                        <View style={styles.one} >
                            {
                                postLoading ?
                                <ActivityIndicator size={'small'} />
                                :
                                <TouchableOpacity onPress={createGroup} style={styles.create} >
                                    <Text>{i18n.t('create')}</Text>
                                </TouchableOpacity>
                            }                               
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default NewGroup

const styles = StyleSheet.create({
    create:{
        backgroundColor:'#4aacf3',
        // paddingHorizontal:30,
        paddingVertical:10,
        width:'40%',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:8
    },
    oneInput:{
        width:'100%',
        borderColor:'#4aacf3',
        borderWidth:1,
        paddingHorizontal:10,
        paddingVertical:6,
        borderRadius:8,
        fontSize:16,
    },
    oneTitle:{
        fontSize:16,
        fontWeight:'700',
    },
    one:{
        width:'90%',
        justifyContent:'center',
        gap:5
    },
    middle:{
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        gap:20,
        marginBottom:25,
    },
    groupName:{
        fontSize:16,
        width:'90%',
        paddingHorizontal:10,
        paddingVertical:7,
        borderBottomWidth:2,
        borderRadius:5,
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
    img:{
        width:140,
        height:140,
        borderRadius:70
    },
    imageContainer:{
        width:150,
        height:150,
        borderRadius:75,
        alignItems:'center',
        justifyContent:'center',
        position:'relative',
    },
    top:{
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        gap:10,
    },
    container:{
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        gap:15,
        paddingHorizontal:10,
    },
    editHeader:{
        fontSize:23,
        fontWeight:'bold'
    },
    back:{
        position:'absolute',
        left:0
    },
    header:{
        flexDirection:'row',
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        position:'relative',
        marginTop:10,
        marginLeft:10,
    },
    main:{
        flex:1,
        width:'100%',
        alignItems:'center',
        // justifyContent:'center',
        paddingTop: 10,
        flexDirection:'column',
        gap:20,
      }
})
