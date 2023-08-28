import React, { useContext, useRef, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import ChatList from "../screens/ChatList";
import NewChatList from "../screens/NewChatList";
import { Ionicons, AntDesign, Entypo, Octicons} from '@expo/vector-icons'; 
import Request from "../screens/Request";
import More from "../screens/More";
import People from "../screens/People";
import { SettingsContext } from "./context/settings/SettingsContext";
import { Colours } from "../../utils/MyColours";
import { useEffect } from "react";
import { AuthContext } from "./context/authContext/AuthContext";
import * as Notifications from 'expo-notifications';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import { registerForPushNotificationsAsync } from "../../utils/useNotifications";

export const TabScreens = ()=>{
    const {dark, i18n} = useContext(SettingsContext);
    const {user, updateUser} = useContext(AuthContext);
    const Tab = createBottomTabNavigator();

    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    const saveUserTokens = async(token)=>{
        return await updateDoc(doc(db, 'users', user.id),{
            tokens: token
        })
    }
    useEffect(()=>{
        const unsub = onSnapshot(doc(db, "users", user.id), (doc) => {
            // console.log("Current data: ", doc.data());
            updateUser(doc.data());
        });
        return ()=>{
            unsub();
        }
    })
    // console.log(user)
    useEffect(()=>{
        registerForPushNotificationsAsync().then(token=>{
            saveUserTokens(token).then(async()=>{
              const res = await getDoc(doc(db, 'users', user.id));
              // updateUser(res.data());
            })
            console.log('ready for notis')
        }).catch(e=>console.log(e))
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
            }),
        });
    },[])


useEffect(() => {
    registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);


    return(
    

          <Tab.Navigator
            initialRouteName="ChatList"
            screenOptions={{
              tabBarStyle: { 
                backgroundColor:dark? Colours.tabBac:'#07076e',
                height:75,
                paddingBottom:10,
            },
            lazy:true,
            }}
            backBehavior='initialRoute'
          >
            <Tab.Screen
            options={{
                headerShown:false,
                tabBarIcon:({focused})=>(
                <Ionicons name="chatbubble-ellipses-outline" size={35} color={focused?"#fff": "#99999B"} /> ),
                tabBarActiveTintColor:'#fff',  
                tabBarLabel:i18n.t('chat'),
                tabBarLabelStyle:{fontWeight:'bold'},
                tabBarHideOnKeyboard:true,
            }} name="ChatList" component={ChatList}
            />

            <Tab.Screen
            options={{
                headerShown:false,
                tabBarIcon:({focused})=>(
                <Octicons name="people" size={35} color={focused?"#fff": "#99999B"} />),
                tabBarActiveTintColor:'#fff',  
                tabBarLabel:i18n.t('ppl'),
                tabBarLabelStyle:{fontWeight:'bold'},
                tabBarHideOnKeyboard:true
            }} name="CallList" component={People}
            />
            <Tab.Screen
            options={{
                headerShown:false,
                tabBarIcon:({focused})=>(
                    <AntDesign name="pluscircle" size={55} color={focused?"#fff": "#fff"} /> ),
                tabBarLabelStyle:{display:'none'},
                tabBarLabel:'',
                tabBarHideOnKeyboard:true
            }} name="Home" component={NewChatList}
            />

            <Tab.Screen
            options={{
                headerShown:false,
                tabBarIcon:({focused})=>(
                <Entypo name="notification" size={25} color={focused?"#fff": "#99999B"} /> ),
                tabBarActiveTintColor:'#fff',  
                tabBarLabel:i18n.t('req1'),
                tabBarLabelStyle:{fontWeight:'bold'},
                tabBarHideOnKeyboard:true
            }} name="Requests" component={Request}
            />

            <Tab.Screen
            options={{
                headerShown:false,
                tabBarIcon:({focused})=>(
                <Ionicons  name="ios-ellipsis-horizontal-circle" size={35} color={focused?"#fff": "#99999B"} /> ),
                tabBarActiveTintColor:'#fff',  
                tabBarLabel:i18n.t('more'),
                tabBarLabelStyle:{fontWeight:'bold'},
                tabBarHideOnKeyboard:true,
            }} name="More" component={More}
            />
          </Tab.Navigator>
      
      )
    }