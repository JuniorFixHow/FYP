import { View, Text, ActivityIndicator } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { AuthContext } from '../../components/context/authContext/AuthContext';
import { createStackNavigator } from '@react-navigation/stack';
import Phone from './phone';
import SignUpTwo from './signUpTwo';
import { TabScreens } from '../../components/TabScreens';
import Chat from '../Chat';
import Settings from '../../../miscellaneous/Settings';
import Profile from '../userScreen/Profile';
import Terms from '../../../miscellaneous/Terms';
import Support from '../../../miscellaneous/Support';
import NewGroup from '../userScreen/NewGroup';
import Group from '../userScreen/Group';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import New from './New';
import { db, firebase } from '../../../../firebase';
import Splash from '../../../utils/loadings/Splash';
import Waiting from '../../../utils/loadings/Waiting';
import Notifications from '../userScreen/Notifications';
import Verfied from './Verified';
import Board from './Board';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { registerForPushNotificationsAsync } from '../../../utils/useNotifications';
// import * as Notification from 'expo-notifications';



const AuthScreens = () => {
const Stack = createStackNavigator();

// })
const {isLoading, user, phoneLogin, isNewUser} = useContext(AuthContext);

// const [expoPushToken, setExpoPushToken] = useState('');
// const [notification, setNotification] = useState(false);
// const notificationListener = useRef();
// const responseListener = useRef();


// const saveUserTokens = async(token)=>{
//     return await updateDoc(doc(db, 'users', user?.id),{
//         tokens: token
//     })
// }

// useEffect(()=>{
//   if(user){
//     registerForPushNotificationsAsync().then(token=>{
//         saveUserTokens(token).then(async()=>{
//           const res = await getDoc(doc(db, 'users', user.id));
//           // updateUser(res.data());
//         })
//         console.log('ready for notis')
//     }).catch(e=>console.log(e))
//     Notification.setNotificationHandler({
//         handleNotification: async () => ({
//           shouldShowAlert: true,
//           shouldPlaySound: true,
//           shouldSetBadge: true,
//         }),
//     });
//   }
// },[])


// useEffect(() => {
//     registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

//     notificationListener.current = Notification.addNotificationReceivedListener(notification => {
//       setNotification(notification);
//     });

//     responseListener.current = Notification.addNotificationResponseReceivedListener(response => {
//       console.log(response);
//     });

//     return () => {
//       Notification.removeNotificationSubscription(notificationListener.current);
//       Notification.removeNotificationSubscription(responseListener.current);
//     };
//   }, []);

// console.log(user?.id)



if(isLoading){
    return(
        <Splash />
    )
}
// console.log(isNewUser)
  return (
    <NavigationContainer>
        
        <Stack.Navigator
        // initialRouteName={phoneLogin ? 'SignupTwo':'Tab'}
        initialRouteName={ isNewUser ? 'New' : 'Tab'}
        
        >
            {/* <Stack.Screen options={{headerShown:false}} name='Login' component={SignIn} />
            <Stack.Screen options={{headerShown:false}} name='signup' component={SignUp} />
        <Stack.Screen name='SignupOne' options={{title:'Account', headerShown:false}} component={SignUpOne} /> */}
            
            <Stack.Screen name='Wait' options={{ headerShown:false}} component={user? Waiting : Verfied} />
            <Stack.Screen name='New' options={{ headerShown:false}} component={user? New : Verfied} />
            <Stack.Screen name='Tab' options={{ headerShown:false}} component={user? TabScreens : Verfied} />
            <Stack.Screen name='Verified' options={{title:'Account', headerShown:false}} component={Verfied} />
            <Stack.Screen name='Board' options={{title:'Account', headerShown:false}} component={Board} />
            <Stack.Screen name='Phone' options={{title:'Account', headerShown:false}} component={Phone} />
            <Stack.Screen name='Noti' options={{title:'Account', headerShown:false}} component={user? Notifications: Verfied} />
            <Stack.Screen name='SignupTwo' options={{title:'Account', headerShown:false}} component={user? SignUpTwo: Verfied} />
            <Stack.Screen name='Chat' options={{ headerShown:false}} component={user?  Chat : Verfied} />
            <Stack.Screen  name='Settings' options={{ headerShown:false}} component={user?  Settings: Verfied} />
            <Stack.Screen  name='Profile' options={{ headerShown:false}} component={user? Profile : Verfied} />
            <Stack.Screen  name='Terms' options={{ headerShown:false}} component={user? Terms : Verfied} />
            <Stack.Screen  name='Support' options={{ headerShown:false}} component={user? Support: Verfied} />
            <Stack.Screen  name='NewGroup' options={{ headerShown:false}} component={user?  NewGroup: Verfied} />
            <Stack.Screen  name='Group' options={{ headerShown:false}} component={user? Group : Verfied} />
        </Stack.Navigator>
    
    </NavigationContainer>
  )
}

export default AuthScreens