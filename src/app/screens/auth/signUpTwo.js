import React, { useEffect, useState } from 'react'
import {Dimensions, SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Entypo, FontAwesome  } from '@expo/vector-icons'; 
import * as ImagePicker from 'expo-image-picker';
import { Colours } from '../../../utils/MyColours';
import { useContext } from 'react';
import { AuthContext } from '../../components/context/authContext/AuthContext';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../../firebase';
import { doc, collection, set, updateDoc } from 'firebase/firestore';
import { getUserWithAuth } from '../../../miscellaneous/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SettingsContext } from '../../components/context/settings/SettingsContext';

export default function SignUpTwo({navigation}) {
    const {user, login, setHasSetImage} = useContext(AuthContext);
    const {i18n} = useContext(SettingsContext);
    const [imageUri, setImageUri] = useState('');
    const [imageLink, setImageLink] = useState(null);
    const [username, setUsername] = useState('');
    const [hasUpdated, setHasUpdated] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [perc, setPerc] = useState('');
   
  
    const pickImage = async()=>{
        const gallery = await ImagePicker.requestMediaLibraryPermissionsAsync();
        // setIsPermissionGranted(gallery.status === 'granted');
        // // console.log(isPermissionGranted)
        console.log(gallery.status)
        if(gallery.status === 'denied'){
            return Alert.alert(i18n.t('libPermTitle'), i18n.t('libPermDenied'));
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

// console.log('has set image '+hasSetImage);
    
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
                setImageUri(image.assets[0].uri);
            }
        }
    }
    
    useEffect(()=>{
        if(user?.username && user?.image){
            navigation.replace('New');
            setHasSetImage(true);
            AsyncStorage.setItem('imageset', JSON.stringify(true));
        }
    },[])
    

    // useEffect(()=>{

    // },[])
    // console.log('image '+hasSetImage)
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
            const storageRef = ref(storage, 'Profiles/'+name);
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
                    console.log('File is available at ', downloadURL);
                    setImageLink(downloadURL);
                    await updateDoc(doc(db, 'users', user.id), {image:downloadURL});
                })
            }
            )
        }
        imageUri && UploadProfileImage();
    },[imageUri])
    // console.log((user?.image && user?.username) && (username === '' || imageLink ===null))

    const updateProfile = async()=>{
        setUpdateLoading(true);
        const userRef = doc(db, "users", user.id);
        let data = {
            image: user?.image || imageLink,
            username
        };
        if((user?.image && user?.username) && (username === '' || imageLink ===null) ){
            setHasSetImage(true);
            AsyncStorage.setItem('imageset', JSON.stringify(true));
            navigation.navigate('Tab');
        }
        else if((!user?.username && username==='')){
            alert(i18n.t('usernameRe'));
            setUpdateLoading(false);
        }
        else{

            updateDoc(userRef, data).then(()=>{
            setHasUpdated(true);
            console.log('User updated!');
            setHasSetImage(true);
            navigation.replace('Tab');
            setUpdateLoading(false);
            }).catch(e=>{
             console.log(e);
             Alert.alert(i18n.t('errOcc'), i18n.t('checkInt'),
            [
                {
                    text:i18n.t('OK'), onPress:()=>{
                        setUpdateLoading(false);
                    },
                    style:'cancel'
                }
            ],
            {cancelable:true}
            )
            setUpdateLoading(false);
            })
           
        }

    }


    // console.log(user)
    useEffect(()=>{
        hasUpdated && getUserWithAuth(user.id).then(data=>{
            login(data);
        }).catch(err=>console.log(err));
        AsyncStorage.setItem('imageset', JSON.stringify(true));
    },[hasUpdated])
// console.log(user.image)
    return (
        <SafeAreaView style={styles.main} >
            <StatusBar style='auto' />
            <View style = {styles.inputArea}>
                <Text style={styles.header} >Continue Login</Text>
                
                <View style={styles.inputs} >
                    <View style={styles.imageContainer}>
                        <Image style={styles.avatar}
                        source={{uri:imageUri || user?.image ||  'https://img.freepik.com/premium-vector/anonymous-user-circle-icon-vector-illustration-flat-style-with-long-shadow_520826-1931.jpg?w=2000'}}
                        />
                        <View style={styles.lib} >
                            <FontAwesome onPress={pickImage}  name="picture-o" color='orange' size={30} />
                            <Entypo onPress={camerapressHandler} name="camera" size={30} color="orange" />
                        </View>
                        {
                            perc !=='' && perc < 100 && <Text style={{color:'crimson'}} >{i18n.t('uploadPic')}: {Math.floor(perc)}%</Text>
                        }
                        {
                            perc === 100 && <Text style={{color:'green'}} >{i18n.t('doneUpload')}: {perc}%</Text>
                        }
                        <TextInput style={styles.user} keyboardType='default'
                        textContentType='givenName'
                        placeholder={user?.username || username || i18n.t('enterU')}
                        value={user?.username || username}
                        onChangeText={(e)=>setUsername(e)}
                        defaultValue={user?.username || username}
                        />
                    </View>
                    {
                        updateLoading ?
                        <ActivityIndicator size={'large'} />
                        :
                        <TouchableOpacity onPress={updateProfile} style={styles.butt} >
                            <Text style={{fontWeight:'bold', color:'#fff', fontSize:19, alignSelf:'center'
                        }}>Continue</Text>
                        </TouchableOpacity>
                    }
                        
                </View>
            </View>
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    main:{
        flex:1,
        backgroundColor:'#fff',
        // justifyContent:'center',
        alignItems:'center',
        width:'100%'
    },
    inputArea:{
        width:'80%',
        // justifyContent:'center',
        alignItems:'center',
        flex:1,
        gap:50,
        marginTop:50,
    },
    header:{
        fontWeight:'bold',
        fontSize:22,
        color:Colours.subTextDark
    },

    imageContainer:{
        position:'relative',
        alignItems:'center',
        justifyContent:'center',
        width:'100%',
        marginBottom:30
    },

    avatar:{
        height:150,
        width:150,
        borderRadius:75
    },
    lib:{
        position:'absolute',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        gap:5
    },

    inputs:{
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        gap:10,
    },
    user:{
        width:'90%',
        fontSize:15,
        // borderRadius:10,
        paddingVertical:5,
        paddingHorizontal:10,
        borderBottomWidth:1,
    },
    input:{
        width:'90%',
        backgroundColor:'white',
        fontSize:19,
        borderRadius:10,
        paddingVertical:5,
        paddingHorizontal:10
    },
    butt:{
        backgroundColor:Colours.mainBlue,
        width:'92%',
        paddingVertical:6,
        paddingHorizontal:10,
        borderRadius:10
    },
    below:{
        alignSelf:'flex-start',
        flexDirection:'row',
        marginLeft:14
    }
})