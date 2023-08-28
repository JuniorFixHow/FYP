import React, { createRef, useCallback, useContext, useEffect, useState } from 'react'
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, Switch, Pressable, Alert, Modal, TouchableOpacity, TouchableWithoutFeedback, } from 'react-native';
import {  Fontisto, Ionicons, MaterialIcons   } from '@expo/vector-icons'; 
import { RadioButton } from 'react-native-paper';
import { SettingsContext } from '../app/components/context/settings/SettingsContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../app/components/context/authContext/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';





const Settings = ({navigation}) => {
  
    const {user, updateUser} = useContext(AuthContext);
    const [showTheme, setShowTheme] = useState(false);
    const [showLang, setShowLang] = useState(false);
    const [showFont, setShowFont] = useState(false);
    // const [sound, setSound] = useState(null);

   
    const {i18n, locale, setLocale,  tonePath, fz, setFz, themeOption, setThemeOption, setEnter, setShowNoti, enter, showtNoti, convTone,  setDark, dark, setFont, font, setNotiTone, notiTone, setLanguage, language} = useContext(SettingsContext);

    const changeToEnglish = ()=>{
        i18n.locale = 'en';
        // console.log(i18n.locale)
        setLocale('en');
        setLanguage('English');
    }
    const changeToFrench = ()=>{
        i18n.locale = 'fr';
        // console.log(i18n.locale)
        setLocale('fr');
        setLanguage('Français');
    }
    const changeToSpanish = ()=>{
        i18n.locale = 'es';
        // console.log(i18n.locale)
        setLocale('es');
        setLanguage('Español');
    }

    // console.log(locale);
    
    useEffect(()=>{
        AsyncStorage.setItem('tone', notiTone);
        AsyncStorage.setItem('tp', JSON.stringify(tonePath));
        // playTone(tonePath);
    },[notiTone])

    useEffect(()=>{
        AsyncStorage.setItem('font', font);
        AsyncStorage.setItem('fz', JSON.stringify(fz));
    },[font])

    useEffect(()=>{
        AsyncStorage.setItem('dark', JSON.stringify(dark));
        AsyncStorage.setItem('theme', themeOption);
    },[dark])

    useEffect(()=>{
        AsyncStorage.setItem('lang', language);
        AsyncStorage.setItem('loc', locale);
    },[locale])
    useEffect(()=>{
        AsyncStorage.setItem('enter', JSON.stringify( enter));
    },[enter])
    useEffect(()=>{
        AsyncStorage.setItem('noti', JSON.stringify( showtNoti));
        const changeDbNoti = async()=>{
            try {
                await updateDoc(doc(db, 'users', user.id), {allowNoti:showtNoti});
                const res = await getDoc(doc(db, 'users', user.id));
                updateUser(res.data());
            } catch (error) {
                console.log(error);
                alert(i18n.t('dbError'));
            }
        }
        changeDbNoti();
    },[showtNoti])
    useEffect(()=>{
        AsyncStorage.setItem('convTone', JSON.stringify( convTone));
    },[convTone])
// console.log('Noti statuss ', showtNoti);
// console.log('user status ', user.allowNoti);
    // useEffect(()=>{
    //     AsyncStorage.getItem('lang').then(d=>{
    //         console.log(d)
    //     })
    //     .catch(err=>console.log(err))
        
    // },[language])
    const changeEnter=()=>{
        setEnter(!enter);
    }
    const changeNoti=()=>{
        setShowNoti(!showtNoti);
        // console.log('Noti changed ', showtNoti)
    }
 



    const handleSmallFont =()=>{
        setFont('Small');
        setFz(14);
    }
    const handleMediumFont =()=>{
        setFont('Medium');
        setFz(17);
    }
    const handleLargeFont =()=>{
        setFont('Large'); 
        setFz(20);
    }
   
    const handleDark=()=>{
       setDark(true);
       setThemeOption('Dark');
    }
    const handleLight=()=>{
       setDark(false);  
       setThemeOption('Light');
    }
  
    
    return (
        <SafeAreaView style={[styles.main, {backgroundColor: dark? '#181830':'#fff' }]} >
            <View style={styles.goback} >
                <Pressable style={styles.back} onPress={()=>navigation.navigate('More')} >
                    <Ionicons  name="chevron-back-circle" size={40} color={dark?"#b9b7b7":'#807d7d'} />
                </Pressable>
                <Text style={ [styles.setHeader, {color:dark ? 'antiquewhite' : '#f7ae4e'}]} >{i18n.t('set')}</Text>
            </View>
            <ScrollView>
                <View style={styles.container}>

                    <View style={styles.one} >
                        <View style={styles.headergroup} >
                            <Fontisto  name="mobile" size={24} color={dark?"#99999B":"#02b2f8c2"} />
                            <Text style={[styles.oneheader, {color: dark?'#fff':'#111'}]} >{i18n.t('app')}</Text>
                        </View>
                        <Pressable onPress={()=>setShowTheme(true)} style={styles.onecontainer} >
                            <View style={styles.onecontent}>
                                <Text style={[styles.title, {color:dark?'#f1f0f0':'#201e1e'}]}>{i18n.t('theme')}</Text>
                                <Text style={[styles.option, {color:dark?'#d1cfcf':'#201e1e'}]} >{themeOption}</Text>
                            </View>
                            {
                                showTheme &&
                                <Modal
                                animationType='fade'
                                transparent={true}
                                visible={showTheme}
                                onRequestClose={()=>setShowTheme(false)}
                                >

                                <Pressable onPress={()=>setShowTheme(false)} style={styles.mainmodal}>
                                    <View style={styles.modalView} >
                                        <Text style={styles.modalheader}>{i18n.t('chT')}</Text>
                                        
                                        <TouchableOpacity onPress={handleDark} style={styles.modaloption2} >
                                            <RadioButton 
                                            value='Dark'
                                            color='black'
                                            status={themeOption === 'Dark'?'checked':'unchecked'}
                                            onPress={handleDark}
                                            />
                                            <Text style={styles.optiontext} >{i18n.t('dark')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleLight} style={styles.modaloption2} >
                                            <RadioButton 
                                            onPress={handleLight}
                                            value='Light'
                                            color='black'
                                            status={themeOption === 'Light'?'checked':'unchecked'}
                                            
                                            />
                                            <Text style={styles.optiontext} >{i18n.t('light')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Pressable>
                            </Modal>
                            }
                        </Pressable>
                        <Pressable onPress={()=>setShowLang(true)} style={styles.onecontainer} >
                            <View style={styles.onecontent}>
                                <Text style={[styles.title, {color:dark?'#f1f0f0':'#201e1e'}]}>{i18n.t('lang')}</Text>
                                <Text style={[styles.option, {color:dark?'#d1cfcf':'#201e1e'}]} >{language}</Text>
                            </View>

                            {
                                showLang &&
                                <Modal
                                animationType='fade'
                                transparent={true}
                                visible={showLang}
                                onRequestClose={()=>setShowLang(false)}
                                >

                                <Pressable onPress={()=>setShowLang(false)} style={styles.mainmodal}>
                                    <View style={styles.modalView} >
                                        <Text style={styles.modalheader}>{i18n.t('chL')}</Text>
                                        
                                        <TouchableOpacity onPress={changeToEnglish} style={styles.modaloption2} >
                                            <RadioButton 
                                            value='English'
                                            color='black'
                                            status={language === 'English'?'checked':'unchecked'}
                                            onPress={changeToEnglish}
                                            />
                                            <Text style={styles.optiontext} >English</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={changeToFrench} style={styles.modaloption2} >
                                            <RadioButton 
                                            value='French'
                                            color='black'
                                            status={language === 'Français'?'checked':'unchecked'}
                                            onPress={changeToFrench}
                                            />
                                            <Text style={styles.optiontext} >Français</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={changeToSpanish} style={styles.modaloption2} >
                                            <RadioButton 
                                            onPress={changeToSpanish}
                                            value='Spanish'
                                            color='black'
                                            status={language === 'Español'?'checked':'unchecked'}
                                            
                                            />
                                            <Text style={styles.optiontext} >Español</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Pressable>
                            </Modal>
                            }
                        </Pressable>
                        
                    </View>

                    <View style={styles.one} >
                        <View style={styles.headergroup} >
                            <MaterialIcons  name="message" size={24} color={dark?"#99999B":"#02b2f8c2"} />
                            <Text style={[styles.oneheader, {color: dark?'#fff':'#111'}]} >{i18n.t('msg')}</Text>
                        </View>
                        <Pressable onPress={changeEnter} style={styles.onecontainer} >
                            <View style={styles.onecontent}>
                                <Text style={[styles.title, {color:dark?'#f1f0f0':'#201e1e'}]}>{i18n.t('enter')}</Text>
                                <Text style={[styles.option, {color:dark?'#d1cfcf':'#201e1e'}]} >{i18n.t('entMes')}</Text>
                            </View>
                            <Switch 
                                trackColor={{false: '#767577', true: '#81b0ff'}}
                                thumbColor={enter ? '#035CDA' : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={changeEnter}
                                value={enter}
                            />
                        </Pressable>
                        <Pressable onPress={()=>setShowFont(true)} style={styles.onecontainer} >
                            <View style={styles.onecontent}>
                                <Text style={[styles.title, {color:dark?'#f1f0f0':'#201e1e'}]}>{i18n.t('fz')}</Text>
                                <Text style={[styles.option, {color:dark?'#d1cfcf':'#201e1e'}]} >{font}</Text>
                            </View>
                            {
                                showFont &&
                                <Modal
                                animationType='fade'
                                transparent={true}
                                visible={showFont}
                                onRequestClose={()=>setShowFont(false)}
                                >

                                <Pressable onPress={()=>setShowFont(false)} style={styles.mainmodal}>
                                    <View style={styles.modalView} >
                                        <Text style={styles.modalheader}>{i18n.t('chFz')}</Text>
                                        <TouchableOpacity onPress={handleSmallFont} style={styles.modaloption2} >
                                            <RadioButton 
                                            value='Small'
                                            color='black'
                                            status={font === 'Small'?'checked':'unchecked'}
                                            onPress={handleSmallFont}
                                            />
                                            <Text style={styles.optiontext} >{i18n.t('small')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleMediumFont} style={styles.modaloption2} >
                                            <RadioButton 
                                            value='Medium'
                                            color='black'
                                            status={font === 'Medium'?'checked':'unchecked'}
                                            onPress={handleMediumFont}
                                            />
                                            <Text style={styles.optiontext} >{i18n.t('medium')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleLargeFont} style={styles.modaloption2} >
                                            <RadioButton 
                                            onPress={handleLargeFont}
                                            value='Large'
                                            color='black'
                                            status={font === 'Large'?'checked':'unchecked'}
                                            
                                            />
                                            <Text style={styles.optiontext} >{i18n.t('large')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </Pressable>
                            </Modal>
                            }
                        </Pressable>
                    </View>


                    <View style={styles.one} >
                        <View style={styles.headergroup} >
                            <Ionicons  name="notifications" size={24} color={dark?"#99999B":"#02b2f8c2"} />
                            <Text style={[styles.oneheader, {color: dark?'#fff':'#111'}]} >{i18n.t('notifi')}</Text>
                        </View>
                        <Pressable onPress={changeNoti} style={styles.onecontainer} >
                            <View style={styles.onecontent}>
                                <Text style={[styles.title, {color:dark?'#f1f0f0':'#201e1e'}]}>{i18n.t('shoNoti')}</Text>
                                <Text style={[styles.option, {color:dark?'#d1cfcf':'#201e1e'}]} >{i18n.t('notiMess')}</Text>
                            </View>

                            <Switch 
                                trackColor={{false: '#767577', true: '#81b0ff'}}
                                thumbColor={showtNoti ? '#035CDA' : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={changeNoti}
                                value={showtNoti}
                            />
                        </Pressable>
{/* 
                        <Pressable onPress={()=>setShowTone(true)} style={styles.onecontainer} >
                            <View style={styles.onecontent}>
                                <Text style={[styles.title, {color:dark?'#f1f0f0':'#201e1e'}]}>{i18n.t('notiTones')}</Text>
                                <Text style={[styles.option, {color:dark?'#d1cfcf':'#201e1e'}]} >{notiTone}</Text>
                            </View>

                            {
                                showTone &&
                                <Modal
                                animationType='fade'
                                transparent={true}
                                visible={showTone}
                                onRequestClose={()=>setShowTone(false)}
                                >

                                <Pressable onPress={()=>setShowTone(false)} style={styles.mainmodal}>
                                    <View style={styles.modalView} >
                                        <Text style={styles.modalheader}>{i18n.t('chTo')}</Text>

                                        {
                                            ToneSounds.map((item)=>(

                                                <TouchableOpacity key={item.id} onPress={()=>pressTone(item.name, item.path)} style={styles.modaloption} >
                                                    <View style={styles.insideModal} >
                                                        <RadioButton 
                                                        value={notiTone}
                                                        color='black'
                                                        status={notiTone === item.name?'checked':'unchecked'}
                                                        onPress={()=>pressTone(item.name, item.path)}
                                                        />
                                                        <Text style={styles.optiontext} >{item.name}</Text>

                                                    </View>
                                                    <Pressable onPress={()=>playTone(item.path)} >
                                                        {
                                                            notiTone === item.name &&
                                                            <AntDesign name="playcircleo" size={20} color="black" />
                                                        }
                                                    </Pressable>
                                                </TouchableOpacity>
                                            ))
                                        }
                                        
                                    
                                    </View>
                                </Pressable>
                            </Modal>
                            }
                        </Pressable>

                        <Pressable  onPress={changeConvTone}  style={styles.onecontainer} >
                            <View style={styles.onecontent}>
                                <Text style={[styles.title, {color:dark?'#f1f0f0':'#201e1e'}]}>{i18n.t('cvTones')}</Text>
                                <Text style={[styles.option, {color:dark?'#d1cfcf':'#201e1e'}]} >{i18n.t('cvMess')}</Text>
                            </View>
                            <Switch 
                                trackColor={{false: '#767577', true: '#81b0ff'}}
                                thumbColor={convTone ? '#035CDA' : '#f4f3f4'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={changeConvTone}
                                value={convTone}
                            />
                        </Pressable> */}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default Settings

const dark = StyleSheet.create({
    setHeader:{
        fontSize:23,
        color:'#f7ae4e',
        textAlign:'center',
        fontWeight:'bold',
    },
    
    mainmodal:{
        position:'absolute',
        width:'100%',
        height:'100%',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#000000aa'
    },
    
   
 
    option:{
        color:'#201e1e',
        fontSize:13,
        width:200
    },
    title:{
        color:'#201e1e',
        fontWeight:'700',
    },
    onecontent:{
        flexDirection:'column',
        // alignSelf:'flex-start',
        marginTop:10
    },
    onecontainer:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        marginLeft:43,
        position:'relative'
    },
    oneheader:{
        color:'#111',
        fontSize:19,
        fontWeight:'bold'
    },
    
    main:{
        flex:1,
        backgroundColor:'#fff',
        width:'100%',
        // alignItems:'center',
        justifyContent:'center',
        paddingTop: 10,
        flexDirection:'column',
        gap:20,
      }
})

const styles = StyleSheet.create({
    setHeader:{
        fontSize:23,
        textAlign:'center',
        fontWeight:'bold',
    },
    goback:{
        width:'100%',
        flexDirection:'row',
        marginLeft:10,
        position:'relative',
        alignItems:'center',
        justifyContent:'center',
        marginBottom:20
    },
    back:{
        position:'absolute',
        left:0,
        alignSelf:'flex-start'
    },
    mainmodal:{
        position:'absolute',
        width:'100%',
        height:'100%',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#000000aa'
    },
    insideModal:{
        flexDirection:'row',
        gap:5,
        alignItems:'center'
    },
    modaloption2:{
        flexDirection:'row',
        alignItems:'center',
        // justifyContent:'space-between',
        alignSelf:'flex-start',
        zIndex:999,
        width:'100%'
    },
    modaloption:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        alignSelf:'flex-start',
        zIndex:999,
        width:'100%'
    },
    modalheader:{
        fontWeight:'800',
        fontSize:18,
    },
    
    modalView: {
        backgroundColor:'#fff',
        alignItems:'center',
        justifyContent:'center',
        gap:10,
        paddingHorizontal:10,
        paddingVertical:8,
        borderRadius:8,
        width:'80%'
      },
    option:{
        color:'#d1cfcf',
        fontSize:13,
        width:200
    },
    title:{
        fontWeight:'700',
    },
    onecontent:{
        flexDirection:'column',
        // alignSelf:'flex-start',
        marginTop:10
    },
    onecontainer:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        marginLeft:43,
        position:'relative'
    },
    oneheader:{
        fontSize:19,
        fontWeight:'bold'
    },
    headergroup:{
        flexDirection:'row',
        gap:20,
        // justifyContent:'center'
        alignItems:'center'
    },
    one:{
        flexDirection:'column',
        width:'100%',
        gap:8,
        borderBottomWidth:0.5,
        borderBottomColor:'grey',
        paddingBottom:8
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
        gap:20,
      }
})
