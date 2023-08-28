import React, { useContext, useState, useEffect, useRef } from 'react'
import {  Alert, ActivityIndicator, Image, Linking, SafeAreaView, StyleSheet, Text, TextInput, Pressable, TouchableWithoutFeedback, View, Keyboard, Platform } from 'react-native';
import { Ionicons, Feather, AntDesign, Entypo, FontAwesome  } from '@expo/vector-icons';
import { ScrollView } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import { Modal } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { SettingsContext } from '../components/context/settings/SettingsContext';
import { Colours } from '../../utils/MyColours';
import { useRoute } from '@react-navigation/native';
import { Timestamp, addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, or, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { AuthContext } from '../components/context/authContext/AuthContext';
import { db, storage } from '../../../firebase';
import * as FileSystem from 'expo-file-system';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { FetchUsersContext } from '../components/context/fetch/fetchUsersContext';
import * as DocumentPicker from 'react-native-document-picker';

import * as Clipboard from 'expo-clipboard';
import { ToastAndroid } from 'react-native';
import { convertFileSize } from '../../utils/functions';
import {shareAsync} from 'expo-sharing';
import {ProgressBar} from '@react-native-community/progress-bar-android';
import Hyperlink from 'react-native-hyperlink';
import {openBrowserAsync} from 'expo-web-browser';


const Chat = ({navigation}) => {
    const {fz, dark, i18n, enter} = useContext(SettingsContext);
    const {user} = useContext(AuthContext);
    const {students, allGroups} = useContext(FetchUsersContext);

    const [imageUri, setImageUri] = useState('');
    const [isPictureMode, setIsPictureMode] = useState(false);
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [message, setMessage] = useState('');
    const [currentMessage, setCurrentMessage] = useState(undefined);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const [soundPlaying, setSoundPlaying] = useState(false);
    const [soundTime, setSoundTime] = useState('');
    const [msg, setMsg] = useState('');
    const [messages, setMessages] = useState([]);
    // const [friend, setFriend] = useState({});
    // const [member, setMemebr] = useState({});
    // const [recording, setRecording] = useState(null);
    // const [staus, setStatus] = useState('idle');
    // const [permission, setPermission] = useState(null);
    // const [audioUri, setAudioUri] = useState(null);
    // const [recordings, setRecordings] = useState([]);
    // const [recordedFile, setRecordedFile] = useState(null);
    // const [perc, setPerc] = useState('');
    // const [sound, setSound] = useState(null);
    const [currentSound, setCurrentSound] = useState(null);
    const [pdfUri, setPdfUri] = useState(null);
    const [unread, setUnread] = useState([]);
    const [downloadedPerc, setDownloadPerc] = useState('');
    const [dlProgress, setDlProgress] = useState('');
    const [cuurentDl, setCurrentDl] = useState(null);
    const [tokens, setTokens] = useState([]);
    const copyRef = useRef();
    const scrollRef = useRef(null);
    const {params} = useRoute();
    // console.log('This is enter: ', enter)
// console.log(cuurentDl);
    useEffect(()=>{
        const reference = collection(db, 'chats', params.roomId, 'messages');
        const unsub = onSnapshot(
            reference, {includeMetadataChanges:true},  (snapshot)=>{
                let list = [];
            //   console.log(list)
                snapshot.docs.forEach((doc)=>{
                    list.push({id:doc.id, ...doc.data()});
                    
                });
                // console.log(list.length>0)
                if(list.length){
                    setMessages(list.sort((a, b)=>a.createdAt>b.createdAt ? 1:-1));
                }
            },
            (error)=>{
                console.log(error)
            },
            orderBy('createdAt', 'desc')
        )
        return ()=>{
            unsub();
        }
    },[])
   
    useEffect(()=>{
        let list = [];
        students
            .filter(s=> s.id !== user.id)
            .filter(st=> st.allowNoti)
            .filter(student=> params.members?.includes(student.id))
            .forEach(item=>{
            list.push(item.tokens)
        });
        setTokens(list);
    },[])
    // console.log('tokens', tokens);
    useEffect(()=>{
        const reference = doc(db, 'chats', params?.roomId);
        const unsub = onSnapshot(reference, {includeMetadataChanges:true}, (doc) => {
            setUnread(doc.data()?.notRead);
            
        });
        return ()=>{
            unsub();
        }

    },[])

    useEffect(()=>{
        const readMessage = async()=>{
            await updateDoc(doc(db, 'chats', params.roomId), {
                notRead: arrayRemove(user.id)
            })
            console.log('first okay')
        }
        readMessage();
    },[messages])
   

    const pickPDF = async()=>{
        const gallery = await ImagePicker.requestMediaLibraryPermissionsAsync();
        // setIsPermissionGranted(gallery.status === 'granted');
        // // console.log(isPermissionGranted)
        // console.log(gallery.status)
        if(gallery.status === 'denied'){
            return Alert.alert(i18n.t('libPermTitle'), i18n.t('libPermDenied'))
        }
        else {
            let response = await DocumentPicker.pick({
                type: [DocumentPicker.types.allFiles]
            })
            // console.log(response)
            const {uri, name, type, size} = response[0];
            setPdfUri({
                uri, name, type, size
            });
            setIsPictureMode(false);
            // if(!DocumentPicker.isCancel){
            // }
            
        }
    }

    // console.log('file ', pdfUri);
    const handlePromttDelete =(id)=>{
        setIsDeleteMode(true);
        setCurrentMessage(id);
    }

    const deleteMessage = async(item)=>{
        setDeleteLoading(true);
        setIsDeleteMode(false);
        await deleteDoc(doc(db, 'chats', params.roomId, 'messages', item))
        setDeleteLoading(false);
        const lastMessages = messages.filter(data=>data.id !== item);
        setMessages(lastMessages);
        let lastMsg;
        if(lastMessages.length){
            lastMsg ={
                msg:lastMessages?.slice(-1)[0].msg || 'File', 
                time:lastMessages?.slice(-1)[0].createdAt,
                senderId: lastMessages?.slice(-1)[0].senderId,
                sender:lastMessages?.slice(-1)[0].sender,
            };
        }
        else{
            lastMsg =''
        }
        console.log('last', lastMsg)
        await updateDoc(doc(db, 'chats', params.roomId), {lastMsg})
    }

    const handleDelete =(item)=>{
        Alert.alert(i18n.t('delMsg'), i18n.t('delMsgBody'),
        [
            {
                text:i18n.t('yes'),
                onPress:()=>{
                    try {
                        deleteMessage(item)
                        
                    } catch (error) {
                        console.log(error)
                        setDeleteLoading(false)
                    }
                },
            },
            {
                text:i18n.t('no'),
                style:'cancel',
                onPress:()=>{
                    console.log('canceled');
                    setIsDeleteMode(false);
                }
            },
            
        ],
        {cancelable:true}
        )
    }
    
    // console.log(messages.filter(ms=>ms.readBy.filter(read=>read !== 'sdhjdsfasd')).length);
    // console.log(params.m)
// console.log(user.tokens)
    const sendNotification = async(content)=>{
        const message = {
            to: tokens,
            sound: 'default',
            title: params?.name || user.username,
            body: content,
            data: { },
            
          };
        
        try {
            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Accept-encoding': 'gzip, deflate',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(message),
              });
        } catch (error) {
            console.log(error)
        }
    }

    const createPrivateMessage = async()=>{
        const date = new Date();
        if(msg !==''){
            const messageData = {
                createdAt: date,
                senderId: user.id,
                sender:user.username,
                room: params.roomId,
                msg,
                type:'text',
                
            }
            const lastData = {
                msg, 
                time:date,
                senderId: user.id,
                sender:user.username,
            };
            try {
                setSendLoading(true)
                Keyboard.dismiss();
                setMsg('');
                await addDoc(collection(db, 'chats', params.roomId, 'messages'), messageData)
                setSendLoading(false);
                sendNotification(msg);
                await setDoc(doc(db, "chats", params.roomId), 
                {
                    lastMsg: lastData,
                    notRead: unread.concat(params.members.filter(item=> item!== user.id))
                }, 
                {merge:true});
            } catch (error) {
                setSendLoading(false);
                alert(i18n.t('errMsgSend'));
                console.log(error);
            }
        }
        else{
            alert(i18n.t('errMsgEmpty'));
        }       
    }
    
    // console.log(convertFileSize(102279767))


    const callback = downloadProgress => {
        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
        console.log(progress)
        setDlProgress(progress);
    };
    
    const downloadFile =async(link, name, id)=>{
        setIsDeleteMode(false);
        setCurrentDl(id);
        const file = FileSystem.documentDirectory + name ;
        
        const downloadResumable = FileSystem.createDownloadResumable(
            link,
            file,
            {},
            callback
            );
            try {
                const res = await downloadResumable.downloadAsync();
                // console.log('Finished downloading to ', uri);
                saveFile(res.uri, file, res.headers['Content-Type']);
                setCurrentDl(null);
                await updateDoc(doc(db, 'chats', params.roomId, 'messages', id),{
                    downloads: arrayUnion(user.id),
                })
            } catch (e) {
                console.error(e);
                setCurrentDl(null);
                alert(i18n.t('errDlfile'));
          }        
        
    };



    const saveFile = async(uri, name, mimetype)=>{
        if(Platform.OS === 'android'){
            const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if(permission.granted){
                const base64 = await FileSystem.readAsStringAsync(uri, {encoding:FileSystem.EncodingType.Base64});
                await FileSystem.StorageAccessFramework.createFileAsync(permission.directoryUri, name, mimetype)
                .then(async(uri)=>{
                    await FileSystem.writeAsStringAsync(uri, base64, {encoding:FileSystem.EncodingType.Base64});
                })
                .catch(e=>console.log(e))
            }
            else{
                shareAsync(uri)
            }
        }
        else{
            shareAsync(uri)
        }
        // const asset = await MediaLibrary.createAssetAsync(uri);
    }

    const createFileMessage = async()=>{
        setIsPictureMode(false);
        if(pdfUri.size <= 10485760){
            const date = new Date();       
            const messageData = {
                createdAt: date,
                senderId: user.id,
                sender:user.username,
                room: params.roomId,
                msg:message,
                type:'file',
                dataType: pdfUri.type,
                name:pdfUri.name,
                size:pdfUri.size,
                localUri:pdfUri.uri,
                uri:'',
                downloads: [user.id],
            }
            const lastData = {
                msg:`File (${convertFileSize(pdfUri.size)})`, 
                time:date,
                senderId: user.id,
                sender:user.username,
                type:'file'
            };
            try {
                setSendLoading(true)
                Keyboard.dismiss();
                setMsg('');
                setIsDeleteMode(false);
                setPdfUri(null);
                const newMes = await addDoc(collection(db, 'chats', params.roomId, 'messages'), messageData);
                uploadChatFile(newMes.id);
                sendNotification(`File ${convertFileSize(pdfUri.size)}`)
                setSendLoading(false);
                await setDoc(doc(db, "chats", params.roomId), 
                {
                    lastMsg: lastData,
                    notRead: unread.concat(params.members.filter(item=> item!== user.id))
                }, 
                {merge:true});
            } catch (error) {
                console.log(error);
                setSendLoading(false)
            }
        }
        else{
            alert(i18n.t('errFz'));
        }
        
    }


    const uploadChatFile = async(mesid)=>{
        setIsPictureMode(false);
        const blob = await new Promise((resolve, reject)=>{
            const xhr = new XMLHttpRequest();
            xhr.onload = function(){
                resolve(xhr.response);
            };
            xhr.onerror = function(){
                reject(new TypeError("Network request failed"));
            };
            xhr.responseType = 'blob';
            xhr.open("GET", pdfUri.uri, true);
            xhr.send(null);
        })
        /** @type {any} */
            const metadata = {
                contentType: pdfUri.type,
            };
        const name = new Date().getTime()+ params.roomId;
        const storageRef = ref(storage, 'Chats/'+name);
        const uploadTask = uploadBytesResumable(storageRef, blob, metadata);
        setPdfUri(null);
    
        uploadTask.on('state_changed', (snapshot)=>{
            setIsPictureMode(false);
            const progress = Math.floor((snapshot.bytesTransferred/snapshot.totalBytes) * 100);
            console.log(`upload is ${progress}% done`);
            setDownloadPerc(progress);
    
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
                // createFileMessage(downloadURL);
                try {
                    
                    await updateDoc(doc(db, 'chats', params.roomId, 'messages', mesid), {
                        uri:downloadURL
                    })
                    console.log('File is available at ', downloadURL);
                    
                } catch (error) {
                    console.log(error);
                }
            })
        }
        )
    }


    // console.log(params.roomType);
    
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
                // allowsEditing:true,
                // aspect:[4,3],
                quality:1
            });
            if(!image.canceled){
                setImageUri(image.assets[0].uri)
            }
        }
    }

    //Audios
    // useEffect(()=>{
    //     const getPermission = async()=>{
    //         console.log(`Permission Grantend: permission status`);
    //     }
    //     getPermission();

    //     return ()=>{
    //         if(recording){
    //             stopRecording();
    //         }
    //     }
    // },[])

    // const startRecording = async()=>{
    //     try {
    //         const perm = await Audio.requestPermissionsAsync();

    //         if(perm.granted){
    //             await Audio.setAudioModeAsync({
    //                 allowsRecordingIOS:true,
    //                 playsInSilentModeIOS:true
    //             });
    //         }

    //         console.log('Starting Recording');
    //         const {recording} = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY)
    //         // await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    //         // await recording.startAsync();
    //         setRecording(recording);
    //         setStatus('recording');
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
    
    // console.log(recording.getURI())

    // const stopRecording =async()=>{
    //     try {
    //         if(staus === 'recording'){
    //             await recording.stopAndUnloadAsync();
    //             await Audio.setAudioModeAsync({
    //                 allowsRecordingIOS: false,
    //             });
    //             const {sound, status} = await recording.createNewLoadedSoundAsync();
    //             const recodingUri = recording.getURI();
    //             const fileName = `recording-${new Date()}.caf`;
    //             setRecordedFile({
    //                 sound: sound,
    //                 duration: getRecordingDuration(status.durationMillis),
    //                 file:recodingUri
    //             })
    //             await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'recordings/', {intermediates:true});
    //             await FileSystem.moveAsync({
    //                 from:recodingUri,
    //                 to: FileSystem.documentDirectory + 'recordings/' + `${fileName}`
    //             });
    //             // console.log('recording uri '+recodingUri)
    //             const playbackObject = new Audio.Sound();
    //             await playbackObject.loadAsync({
    //                 uri: FileSystem.documentDirectory + 'recordings/' + `${fileName}`
    //             })
    //             // await UploadChatAudio(recodingUri);
    //             setAudioUri(FileSystem.documentDirectory + 'recordings/' + `${fileName}`);
                
    //             // await playbackObject.playAsync();
                
    //             setStatus('stopped')
    //             setRecording(null);
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }

    

    // const playAudioChats =async(uri)=>{
    //     setCurrentSound(uri);
    //     try {
    //         const pbo = new Audio.Sound();
    //         const play = await pbo.loadAsync(
    //             {uri:uri}, {shouldPlay:true}, {downloadFirst:true}
    //         );
    //         setSound(pbo);
            
    //         setSoundPlaying(play.isPlaying);
    //         // setSoundTime(getRecordingDuration(play.positionMillis));
    //     } catch (error) {
    //         console.log(error)
    //         setCurrentSound(null);
    //     }
        
    //     setCurrentSound(null);
    // }
    // console.log(currentSound)
    // console.log(soundTime +' <==> ' + soundPlaying)
    // useEffect(() => {
    //     return sound
    //       ? () => {
    //         //   console.log('Unloading Sound');
    //           sound?.unloadAsync();
    //         }
    //       : undefined;
    //   }, [sound]);
    // const handleRecordingPress = async()=>{
    //     if(recording){
    //         const uri = await stopRecording(recording);
    //         if(uri){
    //             console.log('Saved audio file to', recording.getURI());
    //         }
    //     }
    //     else{
    //         await startRecording();
    //     }
    // }

    // const getRecordingDuration=(t)=>{
    //     const minutes = t/1000/60;
    //     const minutesDisplay = Math.floor(minutes);
    //     const seconds = Math.round((minutes - minutesDisplay) * 60);
    //     const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
    //     return `${minutesDisplay}:${secondsDisplay}`;
    // }
// console.log(audioUri)

    // useEffect(()=>{

    //     const UploadChatAudio = async()=>{
    //         const blob = await new Promise((resolve, reject)=>{
    //             const xhr = new XMLHttpRequest();
    //             xhr.onload = function(){
    //                 resolve(xhr.response);
    //             };
    //             xhr.onerror = function(){
    //                 reject(new TypeError("Network request failed"));
    //             };
    //             xhr.responseType = 'blob';
    //             xhr.open("GET", audioUri, true);
    //             xhr.send(null);
    //         })
    //         /** @type {any} */
    //             const metadata = {
    //                 contentType: 'audio/caf',
    //             };
    //         console.log(recording.getURI())
    //         const name = new Date().getTime()+ user.id;
    //         const storageRef = ref(storage, 'Chats/'+name);
    //         const uploadTask = uploadBytesResumable(storageRef, blob, metadata);
        
    //         uploadTask.on('state_changed', (snapshot)=>{
    //             const progress = Math.floor((snapshot.bytesTransferred/snapshot.totalBytes) * 100);
    //             console.log(`upload is ${progress}% done`);
    //             setPerc(progress);
        
    //             switch(snapshot.state){
    //                 case 'paused':
    //                     console.log('Upload is paused');
    //                     break;
    //                 case 'running':
    //                     console.log('Upload in progress');
    //                     break;
    //                 case 'error':
    //                     alert('Error occured uploading image. Check your internet connection');
    //                     break;
    //                 case 'success':
    //                     console.log('Upload is done');
    //                     break;
        
    //                 default:
    //                     break;
    //             }
    //         },
    //         (error)=>{
    //             console.log(error);
    //             alert(error);
    //         },
    //         ()=>{
    //             getDownloadURL(uploadTask.snapshot.ref).then(async(downloadURL)=>{
    //                 const date = new Date();
    //                 const messageData = {
    //                     createdAt: date,
    //                     senderId: user.id,
    //                     sender:user.username,
    //                     localUri:audioUri,
    //                     room: params.roomId,                        
    //                     msg:downloadURL,
    //                     duration:recordedFile.duration,
    //                     type:'audio',
                        
    //                 }
    //                 try {
    //                     setSendLoading(true)
    //                     Keyboard.dismiss();
    //                     setMsg('');
    //                     await updateDoc(doc(db, 'chats', params.roomId), {
    //                         lastMsg:{msg:`Audio (${recordedFile.duration})`, 
    //                         time:date,
    //                         senderId: user.id,
    //                         sender:user.username,
    //                         messages: arrayUnion(messageData)
    //                     }})
    //                     setSendLoading(false)
    //                 } catch (error) {
    //                     console.log(error);
    //                     setSendLoading(false)
    //                 }
    //                 console.log('File is available at ', downloadURL);
    //                 setAudioUri(null);
    //             })
    //         }
    //         )
    //     }
    //     audioUri && UploadChatAudio()
    // },[audioUri])

    // useEffect(()=>{
    //     if(recordedFile){

    //         const audioData  = {
    //             createdAt: new Date(),
    //             senderId: user.id,
    //             sender:user.username,
    //             localUri:audioUri,                        
    //             msg:'',
    //             duration:recordedFile.duration,
    //             room: params.roomId,
    //             type:'audio',
                
    //         }
    //         if(perc !=='' && perc < 100){
    //             setMessages((messages)=> [...messages, audioData]);
    //         }
    //         else if(perc !=='' && perc === 100){
    //             setMessages((messages)=> [...messages])
    //             messages.pop
    //         }
    //         else if(dlProgress !=='' && dlProgress === 100){
    //             setMessages((messages)=> [...messages])
    //             messages.pop
    //         }
    //     }

    // },[audioUri, perc])

    const copyTextToClip = async(message)=>{
        Clipboard.setStringAsync(message);
        ToastAndroid.showWithGravity(
            'copied',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
        setIsDeleteMode(false);
    }

// console.log(user.tokens)

    const shareFile = (name)=>{
        try {
            shareAsync(FileSystem.documentDirectory+name)
        } catch (error) {
            console.log(error);
            alert(i18n.t('errFile'))
        }
    }


    const forwardText = (msg)=>{
        navigation.navigate('Home', {fromChat:true, mesData:msg});
    }

    const handleChatIcon = ()=>{
        if(params.roomType === 'private'){
            navigation.navigate('Profile', {
                // userNow: deleteUserId.members.filter(id=>id !== user.id)[0]
                currentUser: students.find(st=>st.id === params.members.filter(id=>id !== user.id)[0])
            })
        }
        else{
            navigation.navigate('Group', {
                // userNow: deleteUserId.members.filter(id=>id !== user.id)[0]
                curGroup: allGroups.filter(st=>st.id === params.roomId)[0]
            })
        }
    }

    useEffect(()=>{
        const createForwardMessage = async()=>{
    
            const date = new Date();       
            const messageData = {
                createdAt: date,
                senderId: user.id,
                sender:user.username,
                room: params.roomId,
                msg: params.data,
                type:'text',
                
            }
            const lastData = {
                msg:params.data, 
                time:date,
                senderId: user.id,
                sender:user.username,
            };
            try {
                setSendLoading(true)
                Keyboard.dismiss();
                setMsg('');
                await addDoc(collection(db, 'chats', params.roomId, 'messages'), messageData);
                sendNotification(params?.data);
                setSendLoading(false);
                await setDoc(doc(db, "chats", params.roomId), 
                {
                    lastMsg: lastData,
                    notRead: unread.concat(params.members.filter(item=> item!== user.id))
                }, 
                {merge:true});
                // navigation.setParams({data:null});
            } catch (error) {
                console.log(error);
                setSendLoading(false)
            }
        }
        params?.data && createForwardMessage();
    },[params?.data])

    // console.log(params.users.filter(item=>item.id!==user.id))
    const handleOpenWhatsApp = ()=>{
        const phoneNumber = params?.users.filter(item=> item.id !== user.id)[0]?.what;
        try {
            Linking.openURL(`whatsapp://send?phone=+233${phoneNumber}`)
        } catch (error) {
            console.log(error);
            alert(i18n.t('errWhat'));
        }
    }

    //Update chat profile includes
    useEffect(()=>{
        if(params.roomType === 'private'){
          try {
              updateDoc(doc(db, 'chats', params.roomId), {users: [user, students.find(item=> item.id === params.users.filter(item=>item.id !== user.id)[0].id)]})
          } catch (error) {
            console.log(error)
          }
        }
        else if(params.roomType === 'group'){
            try {
                const oldGroup = allGroups.filter(gp => gp.id === params.roomId)[0];
                updateDoc(doc(db, 'chats', params.roomId),{
                    name:oldGroup.gname,
                    members: oldGroup.members,
                    image:oldGroup.image
                })
            } catch (error) {
                console.log(error)
            }
          }
    },[])

    return (
        <SafeAreaView style={[styles.main, {backgroundColor:dark?Colours.bacDark:'gainsboro'}]} >
            <View style={[styles.top, {backgroundColor:dark?Colours.bacDark:Colours.bacLight, borderBottomColor: dark? '#b9b7b7':'#fff'}]} >
                <TouchableWithoutFeedback onPress={()=>navigation.navigate('Tab')} >
                    <Ionicons name="chevron-back-circle" size={40} color="#b9b7b7" />
                </TouchableWithoutFeedback>
                <Pressable style={{position:'absolute', left:70, }} onPress={handleChatIcon} >
                    <View style={styles.user} >
                        <Image style={styles.user_image} source={{uri:params?.image || params?.users.filter(item=> item.id !== user.id)[0].image}} />
                        <View style={styles.user_name} >
                            <Text style={[styles.name1, {color:dark?Colours.bacLight:Colours.textLight, fontSize:fz}]} >{params?.name || params?.users.filter(item=> item.id !== user.id)[0].username}</Text>
                            {/* <Text style={styles.online}>{i18n.t('online')}</Text> */}
                        </View>
                    </View>
                </Pressable>
                <View style={styles.icons}>
                    {/* <TouchableWithoutFeedback>
                        <Ionicons name="call-outline" size={24} color={dark?Colours.iconDark:Colours.iconLight} />
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback>
                        <Feather  name="video" size={24} color={dark?Colours.iconDark:Colours.iconLight} />
                    </TouchableWithoutFeedback> */}
                    {
                       params.roomType === 'private' && params?.users.filter(item=> item.id !== user.id)[0]?.what &&
                        <TouchableWithoutFeedback>
                            <FontAwesome onPress={handleOpenWhatsApp} name="whatsapp" size={35} color="#0fe77b" />
                        </TouchableWithoutFeedback>
                    }
                </View>
            </View>
            

            {/* Messages */}
            <ScrollView ref={scrollRef} onContentSizeChange={()=>scrollRef.current.scrollToEnd({animated:true})} showsVerticalScrollIndicator contentContainerStyle={[{width:'100%', flexGrow:1}, !dark && {backgroundColor:'gainsboro',}]} >
                 <View  style={styles.middle} >
                    {
                        messages && messages?.map(msg=>(  
                            <View key={msg.id} style={msg.senderId === user.id ? styles.message2: styles.message}>
                                <View style={styles.msgtop}>
                                    {
                                        params?.roomType === 'group' &&
                                        <Text style={styles.name} >{msg.senderId === user.id ? i18n.t('you'):msg?.sender.substring(0,10)}</Text>
                                    }
                                    <Text style={styles.online} >{new Timestamp( msg?.createdAt.seconds, msg?.createdAt.nanoseconds).toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                                    {
                                        isDeleteMode && currentMessage === msg.id ?
                                        <Pressable style={{position:'absolute', left:0, zIndex:999, right:0, backgroundColor:'#f0f3f5', padding:5, borderRadius:4, width:110}}  >
                                            {
                                                msg.senderId === user.id &&
                                                <TouchableOpacity onPress={()=>handleDelete(msg.id)} >
                                                    <Text style={{color:'crimson', fontSize:14, fontWeight:'700'}} >{i18n.t('del')}</Text>
                                                </TouchableOpacity>
                                            }
                                            {
                                                !msg.type === 'file' &&
                                                <TouchableOpacity onPress={()=>copyTextToClip(msg?.message||msg?.msg)} >
                                                    <Text style={styles.links} >{i18n.t('copy')}</Text>
                                                </TouchableOpacity>
                                            }
                                            {
                                                msg.type === 'text' &&
                                                <TouchableOpacity onPress={()=>forwardText(msg.msg)} >
                                                    <Text style={styles.links} >{i18n.t('fwd')}</Text>
                                                </TouchableOpacity>
                                            }
                                            {
                                                msg.type === 'file' &&
                                                <>
                                                {
                                                    msg?.downloads?.filter(item => item === user.id).length > 0 &&
                                                    <TouchableOpacity onPress={()=>shareFile(msg.name)} >
                                                        <Text style={styles.links} >{i18n.t('share')}</Text>
                                                    </TouchableOpacity>
                                                }
                                                <TouchableOpacity onPress={()=>downloadFile(msg.uri, msg.name, msg.id)} >
                                                    <Text style={styles.links} >{i18n.t('rdl')}</Text>
                                                </TouchableOpacity>
                                                </>
                                            }
                                            <TouchableOpacity onPress={()=>setIsDeleteMode(false)} >
                                                <Text style={styles.links} >{i18n.t('cancel')}</Text>
                                            </TouchableOpacity>
                                        </Pressable>
                                        :
                                        <Pressable onPress={()=>handlePromttDelete(msg.id)} >
                                            <AntDesign name="ellipsis1" size={24} color="#b3b0b0" />
                                        </Pressable>
                                    }
                                </View>

                                {
                                    msg.type === 'text' &&
                                    <View style={[styles.msgbody, {zIndex:-1}]} >
                                        <Hyperlink
                                            linkStyle={{ color: '#2980b9', fontSize: fz }}
                                            onPress={(url, text) => openBrowserAsync(url)}
                                        >
                                            <Text ref={copyRef} selectable style={[styles.text, {fontSize:fz, zIndex:-1}]} >
                                                {msg.message||msg.msg}
                                            </Text>
                                        </Hyperlink>
                                    </View>
                                }
                                {
                                    msg.type === 'audio' &&
                                    <View style={styles.audiobody} >
                                        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-around'}} >
                                            <Pressable onPress={()=>playAudioChats(msg.localUri)} style={{backgroundColor:Colours.mainBlue, paddingVertical:4, paddingHorizontal:7, borderRadius:20, alignItems:'center', justifyContent:'center'}} >
                                                <FontAwesome name={soundPlaying && currentSound === msg.localUri ? 'pause' : 'play'} size={24} color="white" />
                                                {/* <FontAwesome name="pause" size={24} color="black" /> */}
                                            </Pressable>
                                            <Text style={[styles.text, {fontSize:fz}]} >Audio ({msg?.duration}) </Text>
                                        </View>
                                        <View style={{}} />
                                    </View>
                                }
                                
                                {
                                    msg.type === 'file' &&
                                    <View style={[styles.imagebody, {zIndex:-10}]} >
                                        <View style={{ zIndex:-1, flexDirection:'column', gap:10, maxWidth:'100%', justifyContent:'center'}} >
                                            <View style={[styles.dlcontainer, {zIndex:-1}]} >
                                                {
                                                    msg?.downloads?.filter(item => item === user.id).length > 0 ?
                                                    <>
                                                    {
                                                        (dlProgress !=='' && dlProgress < 1) && (cuurentDl === msg.id) ?
                                                        <ProgressBar progress={dlProgress} /> :
                                                        <FontAwesome  onPress={()=>alert(i18n.t('fileExist'))} style={{ borderRadius:5, backgroundColor:'teal', padding:5}} name="file" size={30} color="gainsboro" />
                                                    }
                                                    </>
                                                    
                                                    :
                                                    <>
                                                    {
                                                        (dlProgress !=='' && dlProgress < 1) && (cuurentDl === msg.id) ?
                                                        <ProgressBar progress={dlProgress} /> :
                                                        <Entypo onPress={()=>downloadFile(msg.uri, msg.name, msg.id)} name="arrow-with-circle-down" style={styles.dicon} color="#161718" />
                                                    }
                                                    </>
                                                }
                                                {/* <Entypo onPress={()=>downloadFile(msg.uri, msg.name)} name="arrow-with-circle-down" style={styles.dicon} color="#161718" /> */}
                                                <View style={[styles.msg_image, {zIndex:-1}]} >
                                                    <Hyperlink
                                                        linkStyle={{color: '#2980b9', fontSize: fz}}
                                                        onPress={(url, text) => openBrowserAsync(url)}
                                                    >
                                                        <Text style={[styles.text, {fontSize:fz, zIndex:-1, fontWeight:'600'}]}>
                                                            {msg.name} ({convertFileSize(msg.size)})
                                                        </Text>
                                                    </Hyperlink>
                                                </View>
                                            </View>
                                                {
                                                    msg.msg &&
                                                    <View style ={{zIndex:-1}} >
                                                        <View style={[styles.msg_image, {zIndex:-2}]} >
                                                            <Hyperlink
                                                                linkStyle={{color: '#2980b9', fontSize: fz}}
                                                                onPress={(url, text) => openBrowserAsync(url)}
                                                            >
                                                                <Text style={[styles.text2, {fontSize:fz, zIndex:-2, alignSelf:'flex-start'}]}>
                                                                    {msg.msg}
                                                                </Text>
                                                            </Hyperlink>
                                                        </View>
                                                    </View>
                                                }
                                        </View>
                                    </View>
                                }

                                {
                                    deleteLoading && currentMessage === msg.id &&
                                    <ActivityIndicator animating size={'small'} style={{position:'absolute', right:0, bottom:0, zIndex:-1}} />
                                }

                                {
                                    sendLoading && messages.slice(-1)[0].id === msg.id && messages.slice(-1)[0].senderId === user.id &&
                                    <ActivityIndicator size={'small'} style={{position:'absolute', right:0, bottom:0}} />
                                }
                                    <Text style={[styles.date, {zIndex:-1}]} >{new Timestamp( msg?.createdAt.seconds, msg?.createdAt.nanoseconds).toDate().toLocaleDateString([], {year: 'numeric', month: 'numeric', day: 'numeric'})}</Text>
                                
                        </View>
                        
                      
                        ))
                    }                      
         
                    </View>


            </ScrollView>
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

                            <TouchableOpacity onPress={pickPDF} style={styles.oneModal} >
                                <FontAwesome name="photo" size={24} color="black" />
                                <Text style={styles.oneModalText} >{i18n.t('gal')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={()=>setPdfUri(null)} style={styles.oneModal} >
                                <Feather name="camera-off" size={24} color="black" />
                                <Text style={styles.oneModalText} >{i18n.t('rem')}</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Modal>

            {/* Typing area */}
            {
                !pdfUri  ?
                <View style={{width:'100%', flexDirection:'column', }} >

                    <View style={styles.outsideType} >
                        <View style={[styles.type, {backgroundColor:dark?Colours.type:Colours.textDark}, !dark&& {borderColor:Colours.mainBlue, borderWidth:1}]}>
                            {/* <Pressable onPress={handleRecordingPress} style={styles.emojo} >
                                <Entypo  name="emoji-happy" size={30} color={dark?Colours.iconDark:'#c9ab04cb'} />
                                <FontAwesome name="microphone" size={30} color={recording? 'crimson': Colours.mainBlue} />
                            </Pressable> */}
                            <TextInput
                            keyboardAppearance='light'
                            placeholder={i18n.t('tpMes')}
                            placeholderTextColor='#99999B'
                            multiline={!enter}
                            value={msg}
                            onChangeText={e=>setMsg(e)}
                            style={[styles.typing, {color:dark?Colours.subTextLight:Colours.subTextDark}]}
                            selectTextOnFocus={true}
                            keyboardType='default'
                            returnKeyType='send'
                            onSubmitEditing={createPrivateMessage}
                            />
                            <Pressable onPress={()=>setIsPictureMode(true)} style={styles.clip} >
                                <Feather  name="paperclip" size={30} color="#99999B" />
                            </Pressable>
                        </View>
                        <Pressable onPress={createPrivateMessage} style={styles.paper}>
                            <Entypo name="paper-plane" size={40} color="#fff" />
                        </Pressable>
                    </View>
                  
            </View>

            :


            <View style={styles.outsideType2} >
                <Pressable onPress={()=>setPdfUri(null)} style={{alignSelf:'flex-end', padding:4}} >
                    <Text style={{color:'crimson',}} >X</Text>
                </Pressable>
                <Text style={[styles.text, {fontSize:fz, zIndex:-1}]}>{pdfUri?.name}</Text>
                <View style={styles.imageContainer} >
                    <View style={styles.imageType2} >
                        <TextInput
                            placeholder={i18n.t('capt')}
                            placeholderTextColor='#99999B'
                            multiline
                            style={styles.imageTyping}
                            value={message}
                            onChangeText={e=>setMessage(e)}
                        />
                    </View>
                    <Pressable onPress={createFileMessage} style={styles.paper2}>
                        <Entypo name="paper-plane" size={40} color="#fff" />
                    </Pressable>
                </View>
            </View>
            }
        </SafeAreaView>
    )
}

export default Chat

const styles = StyleSheet.create({
    links:{
        color:'#3ba4d4', 
        fontSize:14, 
        fontWeight:'700', 
        zIndex:999,
        width:'100%',
    },
    imageTyping:{
        width:'100%',
        fontSize:16,
        paddingVertical:2,
        paddingHorizontal:5,
        borderColor:'#99999B',
        borderBottomWidth:1,
        maxWidth:'100%',
        maxHeight:80,
        color:'#fff'
    },
    paper2:{
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#035CDA',
        borderRadius:50,
    },
    imageType2:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
        width:'85%',
    },
    imageContainer:{
        width:'100%',
        alignItems:'center',
        justifyContent:'space-between',
        flexDirection:'row',
        // gap:10
    },
    imgImg:{
        width:230,
        height:200,
        resizeMode:'contain',
        aspectRatio:4/3,
        borderRadius:10
    },
    outsideType2:{
        width:'80%',
        bottom:30,
        flexDirection:'column',
        // position:'absolute',
        // alignItems:'center',
        // justifyContent:'space-between',
        alignSelf:'center',
        gap:1,
        backgroundColor:'#293f81',
        padding:10,
        borderRadius:10
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
    blurcolor:{
        height:'90%',
        width:'90%',
        backgroundColor:'#ffffff49',
        position:'absolute',
        zIndex:1
    },
    blur:{
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#fff',
        position:'relative',
        borderRadius:10,
    },
    img:{
        height:100,
        width:150,
        borderRadius:10,
        resizeMode:'cover'
    },
    clip:{
        position:'absolute',
        right:5,
        // alignSelf:'flex-end',
        // paddingVertical:10,
        // marginBottom:5
    },
    paper:{
        position:'absolute',
        right:0,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#035CDA',
        borderRadius:50

    },
    typing:{
        fontSize:16,
        width:'85%',
        // marginRight:30,
        // borderLeftWidth:2,
        // borderLeftColor:'#99999B',
        paddingHorizontal:8,
        alignSelf:'center'
    },
    emojo:{
        position:'absolute',
        left:15,
        // alignSelf:'flex-end',
        // paddingVertical:10,
    },
    type:{
        borderRadius:25,
        flexDirection:'row',
        width:'85%',
        alignSelf:'center',
        alignItems:'center',
        justifyContent:'space-between',
        paddingHorizontal:10,
        paddingVertical:7,
        maxHeight:80,
        maxWidth:'85%',
    },
    outsideType:{
        width:'95%',
        bottom:10,
        borderRadius:25,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        alignSelf:'center',
        // backgroundColor:'yellow',
    },
    message2:{
        flexDirection:'column',
        // gap:2,
        maxWidth:'80%',
        // alignItems:'center',
        justifyContent:'space-around',
        backgroundColor:'#293f81',
        paddingHorizontal:8,
        paddingVertical:4,
        borderBottomLeftRadius:15,
        borderTopLeftRadius:15,
        borderTopRightRadius:15,
        alignSelf:'flex-end',
        marginRight:20,
    },
    dlcontainer:{
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'column',
        gap:5,
        width:'100%',
        // position:'relative' 
    },
    dicon:{
        fontSize:40,
        fontWeight:'bold',
    },
    
    msg_image:{
        alignItems:'center',
        justifyContent:'center',
        width:'100%'
    },
    imagebody:{
        alignItems:'center',
        justifyContent:'center',
        maxWidth:'80%',
    },
    // text2:{
    //     color:'#d8d8da',
    //     textAlign:'center',
    // },
    text:{
        color:'#d8d8da',
        textAlign:'left',
    },
    text2:{
        color:'#d8d8da',
        textAlign:'left',
    },
    msgbody:{
        paddingHorizontal:8,
        alignSelf:'flex-start',
    },
    msgtop:{
        flexDirection:'row',
        // alignItems:'center',
        paddingHorizontal:8,
        justifyContent:'space-between',
        maxWidth:'100%',
        gap:5
    },
    message:{
        flexDirection:'column',
        // gap:5,
        maxWidth:'80%',
        // alignItems:'center',
        justifyContent:'space-around',
        backgroundColor:'#565e75',
        paddingHorizontal:8,
        paddingVertical:4,
        borderBottomRightRadius:15,
        borderTopLeftRadius:15,
        borderTopRightRadius:15,
        alignSelf:'flex-start',
    },
    middle:{
        flexDirection:'column',
        gap:20,
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        marginTop:20,
        marginLeft:10,
        marginBottom:100,
        // flex:1,
    },
    icons:{
        flexDirection:'row',
        gap:15
    },
    date:{
        color:'#99999B',
        alignSelf:'flex-end',
        fontSize:12,
    },
    online:{
        color:'#99999B',
        fontSize:13,
    },
    name1:{
        fontWeight:'bold',
    },
    name:{
        fontWeight:'bold',
        color:'#fff'
    },
    user_name:{
        flexDirection:'column',
        justifyContent:'center',
    },
    user_image:{
        height:50,
        width:50,
        borderRadius:25,
    },
    user:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        gap:8,
    },
    top:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingHorizontal:10,
        paddingVertical:10,
        borderBottomWidth:1,
    },
    main:{
        flex:1,
        width:'100%',
        flexDirection:'column',
        position:'relative',
        justifyContent:'center',
        // alignItems:'center'
    },

})
