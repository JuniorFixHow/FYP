import React, { useContext, useEffect, useRef, useState } from 'react'
import { Image, Pressable, ScrollView, TouchableOpacity, Alert } from 'react-native';
import {Dimensions, SafeAreaView, View, Text, StyleSheet, TextInput } from 'react-native';
import OTPTextInput from 'react-native-otp-textinput';
import { Ionicons, AntDesign, MaterialCommunityIcons, Entypo } from '@expo/vector-icons';
import OTP from '../../../assets/images/otp.png';
import Google from '../../../assets/images/google2.png';
import PhoneInput from 'react-native-phone-number-input';
import { auth, db, firebaseConfig } from '../../../../firebase';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import 'expo-dev-client';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AuthContext } from '../../components/context/authContext/AuthContext';
// import { addPhoneUser } from '../../../miscellaneous/endpoints';
import { GoogleAuthProvider, PhoneAuthProvider, onAuthStateChanged, signInWithCredential } from 'firebase/auth';
import { addGoogleUser, addPhoneUser } from '../../../miscellaneous/endpoints';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Waiting from '../../../utils/loadings/Waiting';
import { useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SettingsContext } from '../../components/context/settings/SettingsContext';



export default function Phone({navigation}) {
    // const {dispatch} = useContext(AuthContext);
    const {login, verifiedId, boarded, setPhoneLogin, phoneLogin} = useContext(AuthContext);
    const {i18n} = useContext(SettingsContext);
    // const userRef = firebase.firestore().collection('users');
    const {params} = useRoute();
    const [otp, setOtp] = useState('');
    const [isOtpMode, setIsOtpMode] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [formattedNumber, setFormattedNumber] = useState(undefined);
    const [isValid, setIsValid] = useState(false);
    const [verifyId, setVerifyId] = useState(null);
    const [user, setUser] = useState('');
    const [initializing, setInitializing] = useState(true);
    const [settingsLoading, setSettingsLoading] = useState(false);
    const otpInput = useRef(null);
    const phone = useRef(null);
    const recaptchaVerifier = useRef(null);

    useEffect(()=>{
        AsyncStorage.setItem('phone', JSON.stringify(phoneLogin))
    }, [phoneLogin])

    useEffect(()=>{
        // if(!verifiedId){
        //     navigation.navigate('Verified');
        // }
        if(!boarded){
            navigation.navigate('Board');
        }
    },[])
    
    useEffect(()=>{
        if(formattedNumber !== ''){

            const checkValid = phone.current?.isValidNumber(phoneNumber)
            if(checkValid){
            setIsValid(true);
            setFormattedNumber('+'+phone.current.state.code+phoneNumber);
            }
            else{
                setIsValid(false);
            }
        }
        else{
            setIsValid(false);
        }
    }, [phoneNumber, phone, formattedNumber])

    const sendVeification = ()=>{
        if(phoneNumber !== '' && isValid){
        try {
            const phoneProvider = new PhoneAuthProvider(auth);
            phoneProvider
                .verifyPhoneNumber(formattedNumber, recaptchaVerifier.current)
                .then((res)=>{
                    setVerifyId(res)
                    setIsOtpMode(true);
                })
                .catch(err=>{
                    console.log(err);
                    setSettingsLoading(false);
                    Alert.alert('Error occured', 'Check your internet connection',
                    [
                        {
                            text:'OK', onPress:()=>{
                                setSettingsLoading(false);
                            },
                            style:'cancel'
                        }
                    ],
                    {cancelable:true}
                    )
                })
                
            } catch (error) {
                console.log(error)
                setSettingsLoading(false);
                Alert.alert('Error occured', 'Check your internet connection',
                [
                    {
                        text:'OK', onPress:()=>{
                            setSettingsLoading(false);
                        },
                        style:'cancel'
                    }
                ],
                {cancelable:true}
                )
            }
        }
        else{
            alert('Enter a phone number')
        }
    }
    // console.log(verifyId)

    const confirmCode = ()=>{
        try {
            setSettingsLoading(true);
            const credential =PhoneAuthProvider.credential(
                verifyId,
                otp
            );
            signInWithCredential(auth, credential)
            .then(async(user)=>{
                
                setOtp('');
                setPhoneLogin(true);
                const stId = params?.sId || '';
                const tk = params?.token || '';
                const data  = await addPhoneUser(user.user, stId, tk);
                login(data);
                setSettingsLoading(false);
            })
            .catch(error=>{
                console.log(error)
                setSettingsLoading(false);
                Alert.alert('Error occured', 'Process failed. Retry',
                [
                    {
                        text:'OK', onPress:()=>{
                            setSettingsLoading(false);
                        },
                        style:'cancel'
                    }
                ],
                {cancelable:true}
                )
            })
        } catch (error) {
            console.log(error)
            setSettingsLoading(false);
            Alert.alert(i18n.t('errOcc'), i18n.t('pccFailedRetry'),
            [
                {
                    text:i18n.t('OK'), onPress:()=>{
                        setSettingsLoading(false);
                    },
                    style:'cancel'
                }
            ],
            {cancelable:true}
            )
        }
    }
    // 758698820015-7tl5hcms7vq4bcordtp0ud9dm4b7utdu.apps.googleusercontent.com
    GoogleSignin.configure({
        webClientId: '270556400804-m98iv2kbdtkjrmij3f8o6ok56m7ckcmc.apps.googleusercontent.com',
      });

    const onGoogleButtonPress = async() => {

        try {
            setSettingsLoading(true);
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const { idToken } = await GoogleSignin.signIn();
            setSettingsLoading(false);

            const googleCredential = new GoogleAuthProvider.credential(idToken);
            try {
                setSettingsLoading(true);
                const user = await signInWithCredential(auth, googleCredential);
                if(user){
                    setPhoneLogin(false);
                    const tk = params?.token || '';
                    const data  = await addGoogleUser(user.user, params?.sId, tk);
                    
                    login(data);
                    setSettingsLoading(false);
                }
               
                
            } catch (error) {
                console.log(error);
                setSettingsLoading(false);
                Alert.alert(i18n.t('errOcc'), i18n.t('checkInt'),
                [
                    {
                        text:i18n.t('OK'), onPress:()=>{
                            setSettingsLoading(false);
                        },
                        style:'cancel'
                    }
                ],
                {cancelable:true}
                )
            }
        } catch (error) {
            console.log(error)
            setSettingsLoading(false);
            Alert.alert(i18n.t('errOcc'), i18n.t('pccFailedRetry'),
            [
                {
                    text:'OK', onPress:()=>{
                        setSettingsLoading(false);
                    },
                    style:'cancel'
                }
            ],
            {cancelable:true}
            )
        }
    }


    const onAuthStateChange = (user)=>{
        setUser(user);
        if(initializing) setInitializing(false);
    }

    useEffect(()=>{
        const subscriber = onAuthStateChanged(auth, onAuthStateChange)
        return subscriber;
        // await GoogleSignin.revokeAccess()
        // await firebase.auth().signOut().then().then.....
    },[])

    if(settingsLoading)
    {
        return(
            <Waiting />
        )
    }

    return (
        <SafeAreaView style={styles.main} >
            <StatusBar style='auto' />
            {
                isOtpMode ?
                <View style={styles.container} >
                     <FirebaseRecaptchaVerifierModal 
                            ref={recaptchaVerifier}
                            firebaseConfig={firebaseConfig}
                        />
                    <View style={styles.otpHead} >
                        <Pressable style={styles.back} onPress={()=>setIsOtpMode(false)}>
                            <AntDesign  name="arrowleft" color='black' size={24} />
                        </Pressable>
                        <Text style={styles.header} >{i18n.t('opt')}</Text>
                    </View>
                    <ScrollView style={{width:'100%'}} >
                        <View style={styles.otp} >
                            <Image style={styles.otpImg} source={OTP} />
                            <View style={styles.verify} >
                                <Text style={styles.verifyHeader} >{i18n.t('vcode')}</Text>
                                <Text style={styles.verifyText} >
                                    {i18n.t('vCodeSent')}
                                </Text>
                                <View style={styles.penNum} >
                                    <Text style={styles.numb} >{formattedNumber}</Text>
                                    <Pressable onPress={()=>setIsOtpMode(false)} >
                                        <MaterialCommunityIcons name="circle-edit-outline" size={24} color="#4aacf3" />
                                    </Pressable>
                                </View>
                                <OTPTextInput ref={otpInput}
                                handleTextChange={(e)=>setOtp(e)}
                                inputCount ={6}
                                inputCellLength={1}
                                // autoFocus={true}
                                tintColor='#3c74b3'
                                offTintColor='#b1b6b6'
                                containerStyle={styles.optContainer}
                                textInputStyle={styles.optText}
                                />

                                <View style={styles.noCode} >
                                    <Text style={styles.noCodeText} >{i18n.t('ddnt')}</Text>
                                    <TouchableOpacity onPress={sendVeification} style={styles.resend} >
                                        <Text style={styles.resendText} >{i18n.t('resend')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <TouchableOpacity onPress={confirmCode} style={styles.submit} >
                                    <Text style={styles.submitText} >{i18n.t('submit')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
           :
                <View style={styles.cont} >
                    <View style={styles.top} >
                        <FirebaseRecaptchaVerifierModal 
                            ref={recaptchaVerifier}
                            firebaseConfig={firebaseConfig}
                        />
                        <Text style={styles.topText} >{i18n.t('login')}</Text>
                        <Text style={styles.findText} >{i18n.t('hello')} FindMe</Text>
                    </View>
                    <View style={styles.middle} >
                        <Text style={styles.midNum} >{i18n.t('phoneNumb')}</Text>
                        <View style={styles.valid} >
                            <PhoneInput
                                ref={phone}
                                defaultValue={phoneNumber}
                                defaultCode="GH"
                                layout="first"
                                onChangeText={(text) => {
                                setPhoneNumber(text);
                                }}
                                onChangeFormattedNumber={(text) => 
                                    setFormattedNumber(text)
                                }
                                withDarkTheme
                                withShadow
                                autoFocus

                                containerStyle={styles.phoneContainer}
                                textContainerStyle={{backgroundColor:'#fff', borderLeftColor:'#afaeae', borderLeftWidth:2}}
                            />
                            {
                                !isValid ?
                                <Entypo name="cross" size={24} color="crimson" />
                                :
                                <Ionicons name="checkmark-circle-outline" size={24} color="green" />
                            }
                        </View>
                    </View>

                    <TouchableOpacity onPress={sendVeification} style={styles.submit} >
                        <Text style={styles.submitText} >{i18n.t('rqtOtp')}</Text>
                    </TouchableOpacity>

                    <View style={styles.down} >

                        <View style={styles.lines}>
                            <View style={styles.oneLine}></View>
                            <Text style={styles.numb} >{i18n.t('signinWith')}</Text>
                            <View style={styles.oneLine}></View>
                        </View>

                        <TouchableOpacity onPress={onGoogleButtonPress} style={styles.google} >
                            <Image style={styles.gImage} source={Google} />
                            <Text style={styles.numb} >Google</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    gImage:{
        width:40,
        height:40,
        resizeMode:'cover'
    },
    google:{
        backgroundColor:'rgb(248, 247, 252)',
        elevation:5,
        justifyContent:'center',
        alignItems:'center',
        width:'85%',
        paddingVertical:2,
        flexDirection:'row',
        gap:8,
        borderRadius:30,
    },
    oneLine:{
        borderWidth:1,
        borderColor:'lightgrey',
        width:'30%'
    },
    lines:{
        flexDirection:'row',
        width:'85%',
        alignItems:'center',
        justifyContent:'center',
        gap:8
    },
    down:{
        marginTop:50,
        flexDirection:'column',
        gap:20,
        alignItems:'center',
        justifyContent:'center',
        width:'100%'
    },
    valid:{
        flexDirection:'row',
        justifyContent:'center',
        gap:8,
    },
    midNum:{
        fontWeight:'600',
        color:'#999191',
    },
    middle:{
        gap:8,
        alignSelf:'flex-start',
        // width:'90%'
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
        marginTop:30,
        width:'90%',
        alignItems:'center',
        flexDirection:'column',
        gap:10
    },
    submitText:{
        fontWeight:'bold',
        color:'#fff',
        fontSize:18
    },
    submit:{
        backgroundColor:'#4aacf3',
        width:'80%',
        paddingVertical:10,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:20,
        marginTop:20
    },
    resendText:{
        color:'#fff',
        fontWeight:'500'
    },
    resend:{
        backgroundColor:'#0c9e9e',
        paddingVertical:4,
        paddingHorizontal:8,
        borderRadius:5
    },
    noCodeText:{
        fontWeight:'500',
        color:'#999191',
    },
    noCode:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        gap:10
    },
    optContainer:{
        // borderWidth:1,
        // borderColor:'#4aacf3',
        // paddingVertical:10,
        // paddingHorizontal:20,
        // borderRadius:20
        width:'100%',
        alignContent:'center',
        justifyContent:'center'
    },
    optText:{
        backgroundColor:'rgb(248, 247, 252)',
        borderRadius:25,
        elevation:5,
        width:40,
        height:40,
    },
    numb:{
        fontWeight:'500',
        fontSize:14
    },
    penNum:{
        flexDirection:'row',
        gap:10,
        alignItems:'center',
        justifyContent:'center'
    },
    verifyText:{
        fontWeight:'400',
        textAlign:'center',
        color:'#999191'
    },
    verifyHeader:{
        fontWeight:'800',
        fontSize:24,
        color:'#645e5e'
    },
    verify:{
        gap:10,
        alignItems:'center',
        justifyContent:'center',
        width:'100%'
    },
    otpImg:{
        width:130,
        height:150,
        resizeMode:'cover'
    },
    otp:{
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        marginTop:20,
        flexDirection:'column',
        gap:20
    },
    header:{
        fontSize:20,
        fontWeight:'600'
    },
    back:{
        position:'absolute',
        left:0
    },
    otpHead:{
        justifyContent:'center',
        alignItems:'center',
        flexDirection:'row',
        width:'100%',
        position:'relative'
    },
    container:{
        marginTop:30,
        width:'90%',
        alignItems:'center',
        flexDirection:'column',
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