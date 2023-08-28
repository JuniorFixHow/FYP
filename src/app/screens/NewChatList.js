import React, { useContext, useEffect, useState } from 'react'
import { Pressable, SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { AntDesign, MaterialCommunityIcons, FontAwesome, Feather, Ionicons  } from '@expo/vector-icons';
import { UserList } from '../../miscellaneous/UserChatList';
import { SettingsContext } from '../components/context/settings/SettingsContext';
import { Colours } from '../../utils/MyColours';
import { AuthContext } from '../components/context/authContext/AuthContext';
import { FetchUsersContext } from '../components/context/fetch/fetchUsersContext';
import { Timestamp, collection, doc, getDoc, getDocs, or, query, setDoc, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useRoute } from '@react-navigation/native';



const NewChatList = ({navigation}) => {
    const {params} = useRoute();
    const {dark, i18n} = useContext(SettingsContext);
    const {user} = useContext(AuthContext);
    const {students, chats} = useContext(FetchUsersContext);
    const [loadRoom, setLoadRoom] = useState(false);
    const [currentChat, setCurrentChat] = useState(undefined);
    const [qquery, setQquery] = useState('');
    
   const takeMember = (id)=>{
       navigation.navigate('group')
   }

//    console.log(params?.fromGroup)

//    const handleMultiplePages = async(id, name, image, what)=>{
   const handleMultiplePages = async(frd)=>{
    const chatId = user.id + frd.id;
    const chatId2 =  frd.id + user.id;
    const users = [user, frd];
    const roomData = {
        createdAt: new Date(),
        members:[user.id, frd.id],
        // image,
        // name,
        lastMsg:'',
        id: chatId,
        roomType:'private',
        notRead:[],
        users
    }
   
    if(params?.fromGroup){
        navigation.navigate({
            name: 'Group',
            params: { membId: frd.id, curGroup: params.curGroup },
            merge: true,
          });

        navigation.setParams({fromChatList:false});
    }
    else{
        setCurrentChat(frd.id);
        
        try {
            setLoadRoom(true);
            
            // const q = query(
            //     collection(db, `chats`), 
            //     or(where('id', '==', chatId),
            //     where('id', '==', chatId2)
            //     ));
            // const chatQuery = await getDocs(q);
            // navigation.navigate('Chat', {chatNow: id, name, image, roomId:chatId, roomType:'private', members:[user.id, id], what, data:params?.fromChat ? params.mesData : null});
            const chat = chats?.filter(item=>item.id=== chatId || item.id === chatId2)[0];
            // console.log('my chats ',chat)
            if(!chat){
                await setDoc(doc(db, 'chats', chatId), roomData);
                navigation.navigate('Chat', {users, roomId:chatId, roomType:'private', members:[user.id, frd.id], data:params?.fromChat ? params.mesData : null});
                setLoadRoom(false);
                setCurrentChat(undefined);
                navigation.setParams({fromChat:false});
            }
            else{
                setLoadRoom(false);
                navigation.navigate('Chat', {users, roomId:chat.id, roomType:'private', members:chat.members,  data:params?.fromChat ? params.mesData : null});
                setCurrentChat(undefined);
                navigation.setParams({fromChat:false});
                // console.log(chatQuery.docs[0].data().members)
            }
        } catch (error) {
            setLoadRoom(false);
            setCurrentChat(undefined);
            console.log(error);
            alert(i18n.t('errFailed'));
        }
       }
    }

    // console.log(params?.fromChatList)
    // const fetchRoom = async(id, name, image)=>{
    //     const chatId = user.id + id;
    //     const chatId2 =  id + user.id;
    //     setCurrentChat(id);
        
    //     try {
    //         setLoadRoom(true);
    //         const roomData = {
    //             createdAt: new Date(),
    //             members:[user.id, id],
    //             image,
    //             name,
    //             lastMsg:'',
    //             id: chatId,
    //             roomType:'private'
    //         }
    //         const q = query(
    //             collection(db, `chats`), 
    //             or(where('id', '==', chatId),
    //             where('id', '==', chatId2)
    //             ));
    //         const chatQuery = await getDocs(q);
            
    //         if(chatQuery.empty){
    //             await setDoc(doc(db, 'chats', chatId), roomData);
    //             setLoadRoom(false);
    //             setCurrentChat(undefined);
    //             navigation.navigate('Chat', {chatNow: id, name, image, roomId:chatId});
    //         }
    //         else{
    //             setLoadRoom(false);
    //             navigation.navigate('Chat', {chatNow: id, name, image, roomId:chatQuery.docs[0].id});
    //             setCurrentChat(undefined);
    //         }
    //     } catch (error) {
    //         setLoadRoom(false);
    //         setCurrentChat(undefined);
    //         console.log(error)
    //     }

    // }

    return (
        <SafeAreaView style={[styles.main, {backgroundColor:dark?Colours.bacDark:Colours.bacLight}]} >
            <View style={styles.header} >
                {/* <Pressable onPress={()=>navigation.navigate('More')} style={styles.back} >
                    <Ionicons  name="chevron-back-circle" size={40} color="#b9b7b7" />
                </Pressable> */}
                <Text style={[styles.editHeader, {color:dark?Colours.titeleDark:Colours.titeleLight}]}>{i18n.t('frds')}</Text>
            </View>
            <View style={styles.container} >
                <TextInput style={[styles.search, {color:dark?Colours.subTextLight:Colours.subTextDark, backgroundColor:dark?Colours.iconDark:Colours.textDark}]}
                    placeholder={i18n.t('secfrd')}
                    placeholderTextColor='grey'
                    value={qquery}
                    onChangeText={(e)=>setQquery(e)}
                />
               
                <ScrollView style={{width:'100%'}} >
                    <View style={{width:'100%', marginBottom:50}} >

                        {
                            students &&
                            students.filter((us)=>user?.friends.includes(us.id)).filter(item=>{
                                return qquery === ''? item : Object.values(item)
                                .join(' ')
                                .toLowerCase()
                                .includes(qquery.toLowerCase())}).map((frd)=>(
                                <TouchableOpacity onLongPress={()=>navigation.navigate('Profile', {currentUser:frd})} onPress={()=>handleMultiplePages(frd)} style={styles.userContainer} key={frd.id} >
                                    {
                                        loadRoom && currentChat === frd.id ? <ActivityIndicator size={'large'} /> :
                                        <Image source={{uri:frd.image}} style={styles.img} />
                                    }
                                    <View style={styles.user} >
                                        <Text style={[styles.userName, {color:dark?Colours.bacLight:Colours.textLight}]} >{frd?.fullname || frd?.username}</Text>
                                        <Text style={[styles.useDep, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{frd.dep}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        }
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default NewChatList

const styles = StyleSheet.create({
    useDep:{
        fontSize:13,
    },
    userName:{
        fontSize:16,
        fontWeight:'700'
    },
    user:{
        flexDirection:'column',
        justifyContent:'center',
    },
    img:{
        width:50,
        height:50,
        borderRadius:25
    },
    userContainer:{
        width:'100%',
        flexDirection:'row',
        alignItems:'center',
        paddingHorizontal:10,
        gap:10,
        marginTop:15
    },
    search:{
        width:'95%',
        borderColor:'#4aacf3',
        borderWidth:1,
        paddingVertical:4,
        paddingHorizontal:20,
        borderRadius:10,
        marginVertical:10,
    },
    container:{
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        width:'100%',
    },
    back:{
        position:'absolute',
        left:0
    },
    editHeader:{
        fontSize:23,
        textAlign:'center',
        fontWeight:'bold',
    },
    header:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        width:'100%',
        marginLeft:10,
        // backgroundColor:'red',
        position:'relative',
        marginTop:10,
    },
   
    
    main:{
        flex:1,
        width:'100%',
        alignItems:'center',
        // justifyContent:'center',
        paddingTop: 10,
        flexDirection:'column',
        // gap:20,
        position:'relative',
        gap:20
      }
})
