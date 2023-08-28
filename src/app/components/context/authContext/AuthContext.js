import { createContext, useEffect,  useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../../../../firebase";
import { GoogleSignin } from "@react-native-google-signin/google-signin";



export const AuthContext = createContext();

export const AuthContextProvider = ({children})=>{
    const [isLoading, setIsLoading] = useState(false);
    const [phoneLogin, setPhoneLogin] = useState(false);
    const [user, setUser] = useState(null);
    const [isNewUser, setIsNewUser] = useState(true);
    const [hasSetImage, setHasSetImage] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [verifiedId, setVerfiedId] = useState(false);
    const [boarded, setBoarded] = useState(false);

    const login = (data)=>{
        setIsLoading(true);
        setUser(data);
        AsyncStorage.setItem('userInfo', JSON.stringify(data) )
        setIsLoading(false);
    }
    const updateUser = (data)=>{
        setUser(data);
        AsyncStorage.mergeItem('userInfo', JSON.stringify(data) )
    }

    const onAuthStateChanged = (user)=>{
        setUser(user);
        if(initializing) setInitializing(false);
    }

    const logout = async()=>{
        try {
            // await signOutUser();
            AsyncStorage.removeItem('userInfo');
            setUser(null);
            GoogleSignin.configure({});
            await GoogleSignin.revokeAccess();
            await signOut(auth);
        } catch (error) {
         console.log(error)   
        }
    }

  const getAuthSettings = async()=>{
    const newuse = await AsyncStorage.getItem('newuser');
    // console.log('new set '+JSON.parse(newuse))
    if(newuse){
        setIsNewUser(JSON.parse(newuse))
    }
    const isimage = await AsyncStorage.getItem('imageset');
    // console.log('image set '+JSON.parse(isimage))
    if(isimage){
        setHasSetImage(JSON.parse(isimage))
    }
    const phone = await AsyncStorage.getItem('phone');
    if(phone){
        setPhoneLogin(JSON.parse(phone));
    }
    const vId = await AsyncStorage.getItem('verified');
    if(vId){
        setVerfiedId(JSON.parse(vId));
    }
    const bdd = await AsyncStorage.getItem('bdd');
    if(bdd){
        setBoarded(JSON.parse(bdd));
    }
  }
    
    useEffect(()=>{
        getAuthSettings();
    }, [])

    // AsyncStorage.removeItem('imageset')

    const isAuth = async()=>{
        try {
            setIsLoading(true);
            let userInfo = await AsyncStorage.getItem('userInfo');
            setUser(JSON.parse(userInfo));
            
            setIsLoading(false);
            // if(initializing) return null;
            
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(()=>{
        isAuth();
    }, [])
    // useEffect(()=>{
    //     AsyncStorage.removeItem('userInfo')
    //     setUser(null)
    // }, [])
//    console.log(isNewUser)

const checkStudent = (bool)=>{
    setVerfiedId(true);
    AsyncStorage.setItem('verified', JSON.stringify(bool));
}
const checkBoarded = (bool)=>{
    setBoarded(true);
    AsyncStorage.setItem('bdd', JSON.stringify(bool));
}

const signOutUser = async()=>{
    try {
        const subscriber = auth.onAuthStateChanged(onAuthStateChanged);
        return(subscriber)
    } catch (error) {
        console.log(error)
    }
}


    return(
        <AuthContext.Provider value={{
            login, 
            logout, 
            isLoading, 
            user, 
            isAuth, 
            setIsLoading, 
            phoneLogin, 
            setPhoneLogin,
            setIsNewUser,
            isNewUser,
            setHasSetImage,
            hasSetImage,
            updateUser,
            verifiedId,
            checkStudent,
            checkBoarded,
            boarded
            }} >
            {children}
        </AuthContext.Provider>
    )
}