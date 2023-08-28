import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useEffect, useState } from "react";
import { Audio } from 'expo-av';
import * as Localization from 'expo-localization';
import { I18n  } from "i18n-js";
import en from '../../../../utils/lang/en';
import es from '../../../../utils/lang/es';
import fr from '../../../../utils/lang/fr';

export const SettingsContext = createContext()


// export const ToneSounds = [
//     {
//         id:1,
//         name:'Access',
//         path: require('../../../../assets/sounds/Access.wav')
//     },
//     {
//         id:2,
//         name:'Bubble',
//         path: require('../../../../assets/sounds/Bubble.wav')
//     },
//     {
//         id:3,
//         name:'Confirm',
//         path: require('../../../../assets/sounds/Confirm.wav')
//     },
//     {
//         id:4,
//         name:'Correct',
//         path: require('../../../../assets/sounds/Correct.wav')
//     },
//     {
//         id:5,
//         name:'Digital',
//         path: require('../../../../assets/sounds/Digital.wav')
//     },
//     {
//         id:6,
//         name:'Double',
//         path: require('../../../../assets/sounds/Double.wav')
//     },
//     {
//         id:7,
//         name:'Elevator',
//         path: require('../../../../assets/sounds/Elevator.wav')
//     },
//     {
//         id:8,
//         name:'Gaming',
//         path: require('../../../../assets/sounds/Gaming.wav')
//     },
//     {
//         id:9,
//         name:'Musical',
//         path: require('../../../../assets/sounds/Musical.wav')
//     },
//     {
//         id:10,
//         name:'Positive',
//         path: require('../../../../assets/sounds/Positive.wav')
//     },
// ]

export const SettingsContextProvider = ({children})=>{
    
    const [locale, setLocale] = useState('');
    const [dark, setDark]= useState(false);
    const [language, setLanguage]= useState('English');
    const [enter, setEnter] = useState(false);
    const [font, setFont] = useState('Medium');
    const [showtNoti, setShowNoti] = useState(true);
    const [notiTone, setNotiTone] = useState('Access');
    const [tonePath, setTonePath] = useState('');
    const [convTone, setConvTone] = useState(false);
    const [appSettings, setAppSettings] = useState([]);
    const [themeOption, setThemeOption] = useState('Light');
    const [fz, setFz] = useState(16);
    const [sound, setSound] = useState(null);

    
   
    const fetchSeetings = async()=>{
        // const settings  = await AsyncStorage.multiGet(['dark', 'lang', 'enter', 'font', 'noti', 'tone', 'convTone']);
        // setAppSettings(settings);
        // console.log(settings);
        const theme = await AsyncStorage.getItem('theme');
        if(theme){
            setThemeOption(theme);
        }
        const dk = await AsyncStorage.getItem('dark');
        if(dk){
            setDark(JSON.parse(dk));
        }
        const ln = await AsyncStorage.getItem('lang');
        if(ln){
            setLanguage(ln);
        }
        const ent = await AsyncStorage.getItem('enter');
        if(ent){
            setEnter(JSON.parse(ent));
        }
        const ft = await AsyncStorage.getItem('font');
        if(ft){
            setFont(ft);
        }
        const noti = await AsyncStorage.getItem('noti');
        if(noti){
            setShowNoti(JSON.parse(noti));
        }
        const tone = await AsyncStorage.getItem('tone');
        if(tone){
            setNotiTone(tone);
        }
        const tp = await AsyncStorage.getItem('tp');
        if(tp){
            setTonePath(JSON.parse(tp));
        }
        const conv = await AsyncStorage.getItem('convTone');
        if(conv){
            setConvTone(JSON.parse(conv));
        }
        const fontsize = await AsyncStorage.getItem('fz');
        if(fontsize){
            setFz(parseInt(fontsize));
        }
        const loc = await AsyncStorage.getItem('loc');
        if(loc){
            setLocale(loc);
        }
    }
    
    useEffect(()=>{
        fetchSeetings();
        // AsyncStorage.removeItem('user')
    },[])

    const i18n = new I18n({  en, es, fr});
    i18n.enableFallback = true;
    i18n.locale = locale;
    i18n.defaultLocale = locale;
    // console.log(locale);
    // console.log(es.set);
    // console.log(Localization.getLocales()[0].languageCode);

    const playTone = async(t) => {
        // console.log('Loading Sound');
        const { sound } = await Audio.Sound.createAsync( t);
        setSound(sound);

        // console.log('Playing Sound');
        await sound.playAsync();
    }

    useEffect(() => {
        return sound
          ? () => {
            //   console.log('Unloading Sound');
              sound.unloadAsync();
            }
          : undefined;
      }, [sound]);

    
      
    return (
        <SettingsContext.Provider value={{
          setEnter,
          setShowNoti,
          appSettings, 
          setDark, 
          setFont, 
          setNotiTone, 
          setLanguage,
          convTone,
          dark,
          language,
          font,
          enter,
          notiTone,
          showtNoti,
          setConvTone,
          themeOption, 
          setThemeOption,
          fz,
          setFz,
          tonePath,
          setTonePath,
          playTone,
          sound,
          setLocale,
          locale,
          setLocale,
          i18n
          }} >
            {children}
        </SettingsContext.Provider>
    )
}