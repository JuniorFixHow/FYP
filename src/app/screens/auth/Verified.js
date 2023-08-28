import React, { useContext, useEffect, useRef, useState } from 'react'
import { Image, Pressable, ActivityIndicator, KeyboardAvoidingView, TouchableOpacity, Alert, ScrollView } from 'react-native';
import {  View, Text, StyleSheet, TextInput } from 'react-native';
import { db} from '../../../../firebase';
import { AuthContext } from '../../components/context/authContext/AuthContext';
// import { addPhoneUser } from '../../../miscellaneous/endpoints';
import {doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { registerForPushNotificationsAsync } from '../../../utils/useNotifications';
import { SettingsContext } from '../../components/context/settings/SettingsContext';
import { Colours } from '../../../utils/MyColours';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';




export default function Verfied({navigation}) {
    const {user} = useContext(AuthContext);
    const {checkStudent, boarded} = useContext(AuthContext);
    const {i18n} = useContext(SettingsContext);
    // const userRef = firebase.firestore().collection('users');
    const [idLoading, setIdLoading] = useState(false);
    const [id, setId] = useState('');
    const [accept, setAccept] = useState(false);
    const [token, setToken] = useState(false);

    useEffect(()=>{
        if(!boarded){
            navigation.navigate('Board')
        }
    },[])
// console.log(user);


useEffect(()=>{
    registerForPushNotificationsAsync().then(tk=>{
        setToken(tk);
        console.log('Token set')
    }).catch(e=>console.log(e))
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
    });
},[])


    const handleVerify =async()=>{
        if(id !=='' && id.length === 8){
            try {
                setIdLoading(true);
                const student = await getDoc(doc(db, 'studentids', 'DWu8MYe52u80BmAmwF4j'));
                // console.log(student.data())
                const isStudent  = student.data().ID.filter(sid=>sid===id)
                if(isStudent.length){
                    checkStudent(true)
                    setIdLoading(false);
                    Alert.alert(i18n.t('idVer'), `✅ ${i18n.t('verify')}!`,
                    [
                        {
                            text:i18n.t('OK'),
                            onPress:()=>{
                                navigation.replace('Phone', {sId:id, token})
                            },
                            style:"default"
                        }
                    ],{cancelable:false})
                }
                else{
                    alert(i18n.t('inv'))
                    setIdLoading(false);
                }
            } catch (error) {
                console.log(error);
                alert(i18n.t('netError'));
                setIdLoading(false);
            }
        }
        else{
            alert(i18n.t('vldID'))
        }
    }
    

   
    // console.log(verifyId)
   
   
    return (
        <SafeAreaView style={styles.main} >
            <StatusBar style='auto' />
            <ScrollView style={{width:'90%',}} >
            <View style={styles.cont} >
                <View style={styles.top} >
                    <Text style={styles.topText} >{i18n.t('verifyID')}</Text>
                    <Text style={styles.findText} >{i18n.t('proveST')}</Text>
                </View>

                {/* <ScrollView contentContainerStyle={{flexGrow:1}} > */}
                {/* <KeyboardAvoidingView style={{flexGrow:1, }} behavior='position' > */}
                <View style={styles.notice} >
                    <Text style={styles.noticeHead} >{i18n.t('impnotice')}</Text>
                    <Text style={styles.noticeText} >
                        {i18n.t('idNotice')}
                    </Text>
                </View>
                <View style={styles.check} >
                    <Text style={styles.noticeText} >{i18n.t('under')}</Text>
                        <Pressable style={styles.box} onPress={()=>setAccept(pre=> !pre)} >
                            <View  style={[ styles.fill, {backgroundColor: accept? Colours.mainBlue : null}]} />
                        </Pressable>
                   
                </View>
                <View  style={styles.middle} >
                    <Text style={styles.midNum} >{i18n.t('digit')}</Text>
                    <TextInput
                        placeholder='eg.1XXXXXXX'
                        onChangeText={(e)=>setId(e)}
                        value={id}
                        style={styles.idInput}
                        />
                        <TouchableOpacity disabled={!accept} onPress={handleVerify} style={[styles.submit, {backgroundColor:accept? Colours.mainBlue:'#93d9f5'}]} >
                        {
                            idLoading ?
                            <ActivityIndicator size={'large'} />:
                            <Text style={styles.submitText} >{i18n.t('prc')}</Text>
                        }
                    </TouchableOpacity>
                </View>
                {/* </KeyboardAvoidingView> */}
                {/* </ScrollView> */}


            </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    fill:{
        height:10,
        width:10,
    },
    box:{
        borderWidth:1,
        height:15,
        width:15,
        borderRadius:2,
        alignItems:'center',
        justifyContent:'center',
        borderColor:'#a7a6a6'
    },
    check:{
        alignSelf:'flex-end',
        flexDirection:'row',
        gap:5,
        alignItems:'center',
        marginTop:10,
    },
    noticeText:{
        fontSize:15,
        textAlign:'justify',
        color:'#5c5b5b',
    },
    noticeHead:{
        fontSize:20,
        fontWeight:'700',
        color: '#645e5e'
    },
    notice:{
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        paddingVertical:5,
        paddingHorizontal:13,
        borderWidth:1,
        borderColor:'#d6d2d2',
        borderRadius:10,
        gap:10,
    },
    idInput:{
        borderWidth:1,
        fontSize:16,
        borderColor:'#d6d2d2',
        width:'100%',
        paddingVertical:6,
        paddingHorizontal:10,
        borderRadius:10
    },
    midNum:{
        fontWeight:'600',
        color:'#999191',
    },
    middle:{
        gap:8,
        alignSelf:'flex-start',
        width:'90%',
        marginTop:20
    },
    findText:{
        fontWeight:'400',
        textAlign:'center',
        color:'#999191',
    },
    topText:{
        fontWeight:'800',
        fontSize:24,
        color:'#645e5e'
    },
    top:{
        alignSelf:'flex-start',
        marginVertical:20
    },
    cont:{
        width:'100%',
        alignItems:'center',
        flexDirection:'column',
        gap:10,
        
    },
    submitText:{
        fontWeight:'bold',
        color:'#fff',
        fontSize:18
    },
    submit:{
        // width:'80%',
        paddingVertical:10,
        paddingHorizontal:20,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:6,
        marginTop:5,
        alignSelf:'flex-end'
    },
    
 
    main:{
        flex:1,
        backgroundColor:'#fff',
        // justifyContent:'center',
        alignItems:'center',
        width:'100%',
        flexDirection:'column'
    },
    
})