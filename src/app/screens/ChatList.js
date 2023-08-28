import React, { useContext, useEffect, useState } from 'react'
import { ActivityIndicator, TouchableOpacity, Image, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, Pressable, TouchableWithoutFeedback, View, Alert } from 'react-native'
import { AntDesign, Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons'; 
import { SettingsContext } from '../components/context/settings/SettingsContext';
import { Colours } from '../../utils/MyColours';
import { AuthContext } from '../components/context/authContext/AuthContext';
import { FetchUsersContext } from '../components/context/fetch/fetchUsersContext';
import { Timestamp, addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { useRoute } from '@react-navigation/native';
// install expo-web-browser and import openBrowserAsync('webpage.com')

const ChatList = ({navigation}) => {
    const {params} = useRoute();
    const {dark, i18n} = useContext(SettingsContext);
    const {user, updateUser, } = useContext(AuthContext);
    const {students, allGroups} = useContext(FetchUsersContext);
    
    const [deleteUserId, setDeleteUserId] = useState({});
    const [currentGroup, setCurrentGroup] = useState('All');
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    
    const [favLoading, setFavLoading] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [qquery, setQquery] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [favMode, setFavMode] = useState(false);

    const [chats, setChats] = useState([]);
    const [privateChats, setPrivateChats] = useState([]);
    const [groupChats, setGroupChats] = useState([]);
    const [favChats, setFavChats] = useState([]);

// setFavMode(true);
    useEffect(()=>{
        const reference = collection(db, 'chats');
              const q = query(reference, where('members', 'array-contains', user.id))
              const unsub = onSnapshot(
                  q,  (snapshot)=>{
                      let list = [];
                      console.log(list)
                      snapshot.docs.forEach((doc)=>{
                          list.push({id:doc.id, ...doc.data()});
                          
                        });
                        // console.log(list.length>0)
                        if(list.length){
                            setChats(list.filter(item=>item.members.filter(it=>it===user?.id)).sort((a, b)=>a.lastMsg.time<b.lastMsg.time ? 1:-1))
                            setPrivateChats(list.filter(item=>item.members.filter(it=>it===user?.id)).sort((a, b)=>a.lastMsg.time<b.lastMsg.time ? 1:-1).filter(chat=>chat.roomType ==='private'))
                            setGroupChats(list.filter(item=>item.members.filter(it=>it===user?.id)).sort((a, b)=>a.lastMsg.time<b.lastMsg.time ? 1:-1).filter(chat=>chat.roomType ==='group'))
                            
                        }
                  },
                  (error)=>{
                      console.log(error)
                  },
                  orderBy('createdAt', 'asc')
              )
              return ()=>{
                unsub();
              }
    },[])
    useEffect(()=>{
        const reference = collection(db, 'favourites');
              const q = query(reference, where('user', '==', user?.id))
              const unsub = onSnapshot(
                  q,  (snapshot)=>{
                      let list = [];
                      console.log(list)
                      snapshot.docs.forEach((doc)=>{
                          list.push({_id:doc.id, ...doc.data()});
                          
                        });
                        // console.log(list.length>0)
                        if(list.length){
                            setFavChats(list.filter(item=>item.members.filter(it=>it===user?.id)).sort((a, b)=>a.lastMsg.time<b.lastMsg.time ? 1:-1))
                        }
                  },
                  (error)=>{
                      console.log(error)
                  },
                  orderBy('createdAt', 'asc')
              )
              return ()=>{
                unsub();
              }
    },[])

    // useEffect(()=>{

    //     updateUser(students.slice(-1)[0])
    //     updateUser(students[0])
    //     updateUser(students[1])
    // },[])
    // console.log(students)
    //TODO CREATE FAVOURITE CHATS
    const createFavouriteChat = async({
        members, lastMsg, id, roomType,
        notRead, users, name, image 
    })=>{
        setCurrentGroup('All');
        setFavLoading(true);
        setFavMode(false);
        let favData;
        if(roomType === 'group'){
            favData = {
                name,
                lastMsg,
                notRead,
                id,
                roomType,
                members,
                user: user.id,
                image,
            }
        }
        else{
            favData = {
                lastMsg,
                notRead,
                id,
                roomType,
                members,
                users,
                user: user.id,
            }
        }
        try {
            await addDoc(collection(db, 'favourites'), favData) ;
            setFavLoading(false);
        } catch (error) {
            console.log(error);
            alert(i18n.t('prcFailed'));
            setFavLoading(false);
        }
    }

    // console.log(params.favId)

    const deleteSubCollections = async()=>{
        setDeleteLoading(true);
        try {
            const colRef = collection(db, 'chats', deleteUserId.id, 'messages');
            const data = await getDocs(colRef);
            data.forEach(async (item)=>{
                await deleteDoc(doc(db, 'chats', deleteUserId.id, 'messages', item.id));
            })
            await updateDoc(doc(db, 'chats', deleteUserId.id), {lastMsg:''});
            await deleteDoc(doc(db, 'favourites', deleteUserId.id));
            setDeleteLoading(false);
        } catch (error) {
            setDeleteLoading(false);
            alert(i18n.t('errDelMes'));
            console.log(error);
        }
    }

    const confirmDelete=()=>{
        Alert.alert(i18n.t('delChat'), `${i18n.t('yAboutToDel')} ${deleteUserId.name} ${i18n.t('frmchatL')}`,
        [
            {text:i18n.t('hdstd'), onPress:async()=>{
                setDeleteLoading(true);
                await updateDoc(doc(db, 'chats', deleteUserId.id), {lastMsg:''})
                setDeleteLoading(false);
                // alert('Chat Deleted Successfully');
                setIsDeleteMode(false);
            }},
            {text:i18n.t('yes'), onPress:()=>{
                // setDeleteLoading(true);
                deleteSubCollections();
                // alert('Chat Deleted Successfully');
                // setIsDeleteMode(false);
            }},
            {text:i18n.t('no'), onPress:()=>{
                // alert('canceled');
                setIsDeleteMode(false);
            }, style:'cancel'},
        ],
        {cancelable:true}
        )
    }
    
    const handleChatPage = ()=>{
        if(deleteUserId.roomType === 'private'){
            navigation.navigate('Profile', {
                // userNow: deleteUserId.members.filter(id=>id !== user.id)[0]
                currentUser: students.find(st=>st.id === deleteUserId.members.filter(id=>id !== user.id)[0])
            })
        }
        else{
            navigation.navigate('Group', {
                // userNow: deleteUserId.members.filter(id=>id !== user.id)[0]
                curGroup: allGroups.filter(st=>st.id === deleteUserId.id)[0]
            })
        }
    }

    const handleDeleteChat=(chat)=>{
        setIsDeleteMode(true);
        setDeleteUserId(chat)
    }

    // console.log(allGroups.filter(st=>st.id === deleteUserId.id)[0])
    // const handlePressChat=async(id, name, image, roomType, members)=>{
    const handlePressChat=async(room)=>{
        if(isDeleteMode){
            setIsDeleteMode(false);
            setDeleteUserId({});
        }
        else{
            if(room.roomType === 'private'){
                navigation.navigate('Chat', { 
                    roomId:room.id,  roomType:room.roomType, members:room.members,
                    users:room.users,
                });
            }
            else{
                navigation.navigate('Chat', { 
                    roomId:room.id,  roomType:room.roomType, members:room.members,
                    name:allGroups?.filter(item=> room.id.includes(item.id) )[0]?.gname, 
                    image: allGroups?.filter(item=> room.id.includes(item.id) )[0]?.image
                });
            }
            // clear notifications
            updateDoc(doc(db, 'chats', room.id), {
                notRead: arrayRemove(user.id)
            })
          
        }
    }
   
    
//    console.log(deleteUserId.members.filter(id=>id !== user.id)[0])
    
    const handleRemoveFav = async(id)=>{
        setFavLoading(true);
        try {
            await deleteDoc(doc(db, 'favourites', id));
            setFavLoading(false);
        } catch (error) {
            console.log(error)
        }
        setFavLoading(false);
        // console.log(up);
    }



  
    // console.log()
  
    return (
        <View style={[styles.main1, {backgroundColor:dark?Colours.bacDark:Colours.bacLight}]}>
            {/* <StatusBar style='auto' /> */}
        <StatusBar backgroundColor="#2EBD6B" barStyle="light-content" />
        <SafeAreaView style={[styles.main, {backgroundColor:dark?Colours.bacDark:Colours.bacLight}]}>
            <View style={styles.top}>
                <View style={[styles.searchbar, {backgroundColor:dark?Colours.serachBar:Colours.textDark, borderColor:dark?Colours.serachBar:Colours.mainBlue, borderWidth:dark?0:1}]}>
                    <AntDesign style={styles.searchicon} name="search1" size={24} color="#BABCBE" />
                    <TextInput
                        style={[styles.search, {color:dark?Colours.textDark:Colours.subTextDark}]}
                        placeholder={i18n.t('secchat')}
                        placeholderTextColor={dark?Colours.subTextLight:Colours.subTextDark}
                        returnKeyType='search'
                        blurOnSubmit={false}
                        focusable={false}
                        value={qquery}
                        onChangeText={(e)=>setQquery(e)}
                    />
                </View>
                
                <Text style={[styles.favtext1, {color:dark?Colours.bacLight:Colours.textLight}]} >{i18n.t(`fav`)}</Text>
                <ScrollView horizontal >

                    <View style={styles.fav}>
                    {
                        user &&                         
                        <TouchableOpacity onPress={()=>setFavMode(true)} style={styles.fav1}>
                            <Image style={styles.favpic1} source={{uri:user.image}}  />
                            {
                                favLoading ? <ActivityIndicator style={styles.fav1icon} size={'small'} /> :
                                <AntDesign style={styles.fav1icon} name="pluscircle" size={24} />
                            }
                            { !favLoading && <Text style={[styles.favtext, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{i18n.t('ne')}</Text>}
                        </TouchableOpacity>
                    }

                    {
                        favChats &&
                        favChats.map((us)=>(
                            <TouchableOpacity onPress={()=>handlePressChat(us)} onLongPress={()=>handleRemoveFav(us._id)} key={us._id} style={styles.favs}>
                                {
                                    us.roomType === 'private' ?
                                    <Image style={styles.favpic} source={{uri:us?.users.filter(item => item.id !== user.id)[0].image}}  />
                                    :
                                    <Image style={styles.favpic} source={{uri:allGroups?.filter(item=> us.id.includes(item.id) )[0]?.image}}  />
                                }
                                {
                                    us.roomType === 'private' ?
                                    <Text style={[styles.favtext, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{us?.users.filter(item => item.id !== user.id)[0].username.substring(0, 15)}</Text>
                                    :
                                    <Text style={[styles.favtext, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{allGroups?.filter(item=> us.id.includes(item.id) )[0]?.gname.substring(0, 15)}</Text>
                                }
                            </TouchableOpacity>
                        ))
                    }
                    
                    </View>
                    
                </ScrollView>
            </View>

                    {/* Middle */}
            {
                favMode ?
                <View style={[styles.select, {backgroundColor:dark?'#fff':'#f7ae4e'}]} >
                    <AntDesign onPress={()=>setFavMode(false)} style={styles.selectIcon} name="closecircleo" size={20} color={dark?Colours.iconLight:Colours.iconDark} />
                    <Text style={styles.selectText} >{i18n.t('favChat')}</Text>
                </View>
                :
                <View style={[styles.middle, {backgroundColor:dark?Colours.middle:Colours.mainBlue}]}>
                    <Pressable onPress={()=>setCurrentGroup('All')} style={currentGroup === 'All' ? styles.group : styles.group2}>
                        <Text style={currentGroup==='All'? styles.grouptext : [styles.grouptext2, {color:dark?Colours.groupText:Colours.textLight}]} >{i18n.t('all')}</Text>
                        <View style={styles.noti}>
                            <Text style={styles.notitext} >{chats && chats.filter(item=>item.lastMsg !=='').length}</Text>
                        </View>
                    </Pressable>

                    <Pressable onPress={()=>setCurrentGroup('Group')} style={currentGroup === 'Group' ? styles.group : styles.group2}>
                        <Text style={currentGroup==='Group'? styles.grouptext : [styles.grouptext2, {color:dark?Colours.groupText:Colours.textLight}]} >{i18n.t('gps')}</Text>
                        <View style={styles.noti}>
                            <Text style={styles.notitext} >{groupChats&& groupChats.filter(item=>item.lastMsg !=='').length}</Text>
                        </View>
                    </Pressable>

                    <Pressable onPress={()=>setCurrentGroup('Chat')} style={currentGroup === 'Chat' ? styles.group : styles.group2}>
                        <Text style={currentGroup==='Chat'? styles.grouptext : [styles.grouptext2, {color:dark?Colours.groupText:Colours.textLight}]} >{i18n.t('chat')}</Text>
                        <View style={styles.noti}>
                            <Text style={styles.notitext} >{privateChats && privateChats.filter(item=>item.lastMsg !=='').length}</Text>
                        </View>
                    </Pressable>
                </View>
            }

            {/* Down */}
            <ScrollView style={{width:'100%'}} >
                <View style={styles.chats}>
                    {
                        chats.length > 0  && currentGroup === 'All' &&
                        chats.filter(item=>{
                            return qquery === ''? item : Object.values(item)
                            .join(' ')
                            .toLowerCase()
                            .includes(qquery.toLowerCase())}).map((us)=>(
                            us.lastMsg &&
                            <TouchableOpacity onLongPress={()=>handleDeleteChat(us)} onPress={favMode ? ()=>createFavouriteChat(us) : ()=>handlePressChat(us)} key={us.id} style={styles.oneuser}>
                                <View style={styles.left} >
                                    <View style={styles.chatimage}>
                                        {
                                            us.roomType === 'private' ?
                                            <TouchableWithoutFeedback onPress={()=>setCurrentImage(us?.users.filter(item => item.id !== user.id)[0].image)} >
                                                <Image style={styles.chatpic} source={{uri:us?.users.filter(item => item.id !== user.id)[0].image}} />
                                            </TouchableWithoutFeedback>
                                            :
                                            <TouchableWithoutFeedback onPress={()=>setCurrentImage(allGroups?.filter(item=> us.id.includes(item.id) )[0]?.image)} >
                                                <Image style={styles.chatpic} source={{uri:allGroups?.filter(item=> us.id.includes(item.id) )[0]?.image}} />
                                            </TouchableWithoutFeedback>
                                        }
                                        {/* <View style={styles.dot} /> */}
                                    </View>
                                   
                                    <View  style={styles.left_right}>
                                        <Text style={[styles.chat_name, {color:dark?Colours.bacLight:Colours.textLight}]} >{
                                          us.roomType === 'private' ? us?.users.filter(item => item.id !== user.id)[0].username : allGroups?.filter(item=> us.id.includes(item.id) )[0]?.gname
                                        }</Text>
                                        <View style={styles.lstmsg} >
                                            {
                                                us?.notRead.filter(item=> item !== user.id).length === 0 && us.lastMsg.senderId === user.id &&
                                                <Ionicons name="checkmark-done" size={24} color="blue" /> 
                                            }
                                            {
                                                us.lastMsg.senderId === user.id && us?.notRead.filter(item=> item !== user.id).length > 0 &&
                                                <Ionicons name="checkmark-done" size={24} color="grey" />
                                            }
                                            {
                                                us.roomType === 'private' ?
                                                <Text  style={styles.chat_last} >{us?.lastMsg.msg.substring(0, 25)}</Text>
                                                :
                                                <Text  style={styles.chat_last} >{us.lastMsg.senderId === user.id ? 'You':us?.lastMsg.sender.substring(0, 10)}: {us?.lastMsg.msg.substring(0, 15)}</Text>
                                             }
                                            
                                        </View>
                                    </View>
                                </View>

                                {
                                    !isDeleteMode ?
                                    <View style={styles.right}>
                                        {
                                            us?.notRead.filter(item=> item === user.id).length !== 0 &&
                                            <View style={styles.chatnoti}>
                                                <Text style={styles.notitext} >{us?.notRead.filter(item=> item === user.id).length}</Text>
                                            </View>
                                        }
                                        <Text style={[styles.chattime, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{new Timestamp( us?.lastMsg.time.seconds, us?.lastMsg.time.nanoseconds).toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                                        <Text style={[styles.chattime, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{new Timestamp( us?.lastMsg.time.seconds, us?.lastMsg.time.nanoseconds).toDate().toLocaleDateString([], {year: 'numeric', month: 'numeric', day: 'numeric'})}</Text>
                                    </View>
                                :
                                <>
                                    {
                                        us.id === deleteUserId.id &&
                                        <View style={styles.rightSide}>
                                        <Pressable onPress={handleChatPage} >
                                            {
                                                us.roomType === 'private' ?
                                                <FontAwesome name="user" size={24} color="teal" />
                                                :
                                                <FontAwesome name="group" size={24} color='teal' />
                                            }
                                        </Pressable>
                                        {
                                            deleteLoading && deleteUserId.id === us.id ?
                                            <ActivityIndicator size={'small'} />:
                                            <>
                                            {
                                                us.roomType === 'private' &&
                                                <Pressable onPress={confirmDelete} >
                                                    <Ionicons name="ios-trash-bin" size={24} color="#dc1482" />
                                                </Pressable>
                                            }
                                            </>
                                        }
                                    </View>
                                    }
                                </>
                                }
                            </TouchableOpacity>
                         ))
                       
                    }

                    {
                         privateChats.length>0 && currentGroup === 'Chat' &&
                         privateChats.filter(item=>{
                            return qquery === ''? item : Object.values(item?.users?.filter((s)=>s.id !== user.id)[0])
                            .join(' ')
                            .toLowerCase()
                            .includes(qquery.toLowerCase())}).map((us)=>(
                             us.lastMsg &&
                             <TouchableOpacity onLongPress={()=>handleDeleteChat(us)} onPress={()=>handlePressChat(us)} key={us.id} style={styles.oneuser}>
                                 <View style={styles.left} >
                                     <View style={styles.chatimage}>
                                        {
                                            us.roomType === 'private' ?
                                            <TouchableWithoutFeedback onPress={()=>setCurrentImage(us?.users.filter(item => item.id !== user.id)[0].image)} >
                                                <Image style={styles.chatpic} source={{uri:us?.users.filter(item => item.id !== user.id)[0].image}} />
                                            </TouchableWithoutFeedback>
                                            :
                                            <TouchableWithoutFeedback onPress={()=>setCurrentImage(allGroups?.filter(item=> us.id.includes(item.id) )[0]?.image)} >
                                                <Image style={styles.chatpic} source={{uri:allGroups?.filter(item=> us.id.includes(item.id) )[0]?.image}} />
                                            </TouchableWithoutFeedback>
                                        }
                                         {/* <View style={styles.dot} /> */}
                                     </View>
                                     
                                     <View  style={styles.left_right}>
                                         <Text style={[styles.chat_name, {color:dark?Colours.bacLight:Colours.textLight}]} >{
                                            us.roomType === 'private' ? us?.users.filter(item => item.id !== user.id)[0].username : us?.allGroups?.filter(item=> us.id.includes(item.id) )[0]?.gname
                                        }</Text>
                                         <View style={styles.lstmsg} >
                                            {
                                                us?.notRead.filter(item=> item !== user.id).length === 0 && us.lastMsg.senderId === user.id &&
                                                <Ionicons name="checkmark-done" size={24} color="blue" /> 
                                            }
                                            {
                                                us.lastMsg.senderId === user.id && us?.notRead.filter(item=> item !== user.id).length > 0 &&
                                                <Ionicons name="checkmark-done" size={24} color="grey" />
                                            }
                                             {
                                                us.roomType === 'private' ?
                                                <Text  style={styles.chat_last} >{us?.lastMsg.msg.substring(0, 25)}</Text>
                                                :
                                                <Text  style={styles.chat_last} >{us.lastMsg.senderId === user.id ? 'You':us?.lastMsg.sender.substring(0, 10)}: {us?.lastMsg.msg.substring(0, 15)}</Text>
                                             }
                                             
                                         </View>
                                     </View>
                                 </View>
 
                                 {
                                     !isDeleteMode ?
                                     <View style={styles.right}>
                                          {
                                            us?.notRead.filter(item=> item === user.id).length !== 0 &&
                                            <View style={styles.chatnoti}>
                                                <Text style={styles.notitext} >{us?.notRead.filter(item=> item === user.id).length}</Text>
                                            </View>
                                        }
                                         <Text style={[styles.chattime, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{new Timestamp( us?.lastMsg.time.seconds, us?.lastMsg.time.nanoseconds).toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                                         <Text style={[styles.chattime, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{new Timestamp( us?.lastMsg.time.seconds, us?.lastMsg.time.nanoseconds).toDate().toLocaleDateString([], {year: 'numeric', month: 'numeric', day: 'numeric'})}</Text>
                                     </View>
                                 :
                                 <>
                                     {
                                         us.id === deleteUserId.id &&
                                         <View style={styles.rightSide}>
                                         <Pressable onPress={handleChatPage} >
                                            {
                                                us.roomType === 'private' ?
                                                <FontAwesome name="user" size={24} color="teal" />
                                                :
                                                <FontAwesome name="group" size={24} color='teal' />
                                            }
                                         </Pressable>
                                         {
                                            deleteLoading && deleteUserId.id === us.id ?
                                            <ActivityIndicator size={'small'} />:
                                           <>
                                            {
                                                us.roomType === 'private' &&
                                                <Pressable onPress={confirmDelete} >
                                                    <Ionicons name="ios-trash-bin" size={24} color="#dc1482" />
                                                </Pressable>
                                            }
                                            </>
                                        }
                                     </View>
                                     }
                                 </>
                                 }
                             </TouchableOpacity>
                          ))
                    }


                    {
                         groupChats.length>0  && currentGroup === 'Group' &&
                         groupChats.filter(item=>{
                            return qquery === ''? item : Object.values(item)
                            .join(' ')
                            .toLowerCase()
                            .includes(qquery.toLowerCase())}).map((us)=>(
                             us.lastMsg &&
                             <TouchableOpacity onLongPress={()=>handleDeleteChat(us)} onPress={()=>handlePressChat(us)} key={us.id} style={styles.oneuser}>
                                 <View style={styles.left} >
                                     <View style={styles.chatimage}>
                                        {
                                            us.roomType === 'private' ?
                                            <TouchableWithoutFeedback onPress={()=>setCurrentImage(us?.users.filter(item => item.id !== user.id)[0].image)} >
                                                <Image style={styles.chatpic} source={{uri:us?.users.filter(item => item.id !== user.id)[0].image}} />
                                            </TouchableWithoutFeedback>
                                            :
                                            <TouchableWithoutFeedback onPress={()=>setCurrentImage(allGroups?.filter(item=> us.id.includes(item.id) )[0]?.image)} >
                                                <Image style={styles.chatpic} source={{uri:allGroups?.filter(item=> us.id.includes(item.id) )[0]?.image}} />
                                            </TouchableWithoutFeedback>
                                        }
                                         {/* <View style={styles.dot} /> */}
                                     </View>
                                     
                                     <View  style={styles.left_right}>
                                         <Text style={[styles.chat_name, {color:dark?Colours.bacLight:Colours.textLight}]} >{
                                          us.roomType === 'private' ? us?.users.filter(item => item.id !== user.id)[0].username : allGroups?.filter(item=> us.id.includes(item.id) )[0]?.gname
                                        }</Text>
                                         <View style={styles.lstmsg} >
                                            {
                                                us?.notRead.filter(item=> item !== user.id).length === 0 && us.lastMsg.senderId === user.id &&
                                                <Ionicons name="checkmark-done" size={24} color="blue" /> 
                                            }
                                            {
                                                us.lastMsg.senderId === user.id && us?.notRead.filter(item=> item !== user.id).length > 0 &&
                                                <Ionicons name="checkmark-done" size={24} color="grey" />
                                            }
                                             {
                                                us.roomType === 'private' ?
                                                <Text  style={styles.chat_last} >{us?.lastMsg.msg.substring(0, 25)}</Text>
                                                :
                                                <Text  style={styles.chat_last} >{us.lastMsg.senderId === user.id ? 'You':us?.lastMsg.sender.substring(0, 10)}: {us?.lastMsg.msg.substring(0, 15)}</Text>
                                             }
                                             
                                         </View>
                                     </View>
                                 </View>
 
                                 {
                                     !isDeleteMode ?
                                     <View style={styles.right}>
                                          {
                                            us?.notRead.filter(item=> item === user.id).length !== 0 &&
                                            <View style={styles.chatnoti}>
                                                <Text style={styles.notitext} >{us?.notRead.filter(item=> item === user.id).length}</Text>
                                            </View>
                                        }
                                         <Text style={[styles.chattime, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{new Timestamp( us?.lastMsg.time.seconds, us?.lastMsg.time.nanoseconds).toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                                         <Text style={[styles.chattime, {color:dark?Colours.bacLight:Colours.subTextDark}]} >{new Timestamp( us?.lastMsg.time.seconds, us?.lastMsg.time.nanoseconds).toDate().toLocaleDateString([], {year: 'numeric', month: 'numeric', day: 'numeric'})}</Text>
                                     </View>
                                 :
                                 <>
                                     {
                                         us.id === deleteUserId.id &&
                                         <View style={styles.rightSide}>
                                            <Pressable onPress={handleChatPage} >
                                                {
                                                    us.roomType === 'private' ?
                                                    <FontAwesome name="user" size={24} color="teal" />
                                                    :
                                                    <FontAwesome name="group" size={24} color='teal' />
                                                }
                                            </Pressable>
                                         {
                                            deleteLoading && deleteUserId.id === us.id ?
                                            <ActivityIndicator size={'small'} />:
                                            <>
                                            {
                                                us.roomType === 'private' &&
                                                <Pressable onPress={confirmDelete} >
                                                    <Ionicons name="ios-trash-bin" size={24} color="#dc1482" />
                                                </Pressable>
                                            }
                                            </>
                                        }
                                     </View>
                                     }
                                 </>
                                 }
                             </TouchableOpacity>
                          ))
                    }
                </View>
            </ScrollView>
                {
                    chats.filter(chat=>chat?.lastMsg !== '').length === 0 &&
                    <TouchableOpacity onPress={()=>navigation.navigate('Home')} style={{elevation:5, borderRadius:27, marginRight:20, marginBottom:50, backgroundColor:'blue', padding:15, alignSelf:'flex-end'}} >
                        <MaterialIcons name='messenger' size={25} color='#fff' />
                    </TouchableOpacity>
                }
                {
                    currentImage &&
                    <View style={{width:'70%', padding:3, backgroundColor:'#5151c2', alignItems:'center', flexDirection:'column', alignSelf:'center', position:'absolute', top:'50%'}} >
                        <Pressable onPress={()=>setCurrentImage(null)} style={{alignSelf:'flex-end'}} >
                            <Entypo name="circle-with-cross" size={24} color="crimson" />
                        </Pressable>
                        <Image style={{ width:'100%', height:250, borderRadius:10, resizeMode:'contain', flex:1}} source={{uri:currentImage}} />
                    </View>
                }
        </SafeAreaView>
        </View>
    )
}

export default ChatList

const styles = StyleSheet.create({
    selectIcon:{
        alignSelf:'flex-end'
    },
    selectText:{
        fontSize:16,
        fontWeight:'500'
    },
    select:{
        width:'70%',
        gap:5,
        elevation:5,
        paddingVertical:5,
        paddingHorizontal:8,
        flexDirection:'row-reverse',
        justifyContent:'space-between',
        // backgroundColor:'#fff',
        marginTop:15,
        borderRadius:5,
    },
    rightSide:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        gap:10
    },
    chatnoti:{
        backgroundColor:'#0065FA',
        paddingVertical:2,
        paddingHorizontal:5,
        borderRadius:50,
        alignItems:'center',
        justifyContent:'center',
        alignSelf:'flex-end'
    },
    chattime:{
        fontSize:12
    },
    right:{
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        // marginRight:10
    },
    chat_last:{
        color:'#858282',
        width:'70%',
    },
    lstmsg:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'flex-start',
    },
    chat_name:{
        fontWeight:'800',
    },
    left_right:{
        flexDirection:'column',
        // alignItems:'center',
        justifyContent:'center',
        gap:3,
        marginLeft:3
    },
    chatimage:{
        alignItems:'center',
        justifyContent:'center',
        position:'relative',
        // alignSelf:'',
    },
    dot:{
        width:10,
        height:10,
        position:'absolute',
        backgroundColor:'teal',
        borderRadius:5,
        bottom:0,
        right:0
    },
    chatpic:{
        height:50,
        width:50,
        borderRadius:25,
    },
    left:{
        flexDirection:'row',
        alignItems:'center',
        // justifyContent:'center',
        gap:5,
        // backgroundColor:'yellow',
        width:'80%',
        maxWidth:'80%',
        // alignSelf:'left'
    },
    oneuser:{
        flexDirection:'row',
        alignItems:'center',
        // justifyContent:'center',
        maxWidth:'95%',
        width:'95%',
        // backgroundColor:'green',
        alignSelf:'center',
        // paddingHorizontal:18,
    },
    chats:{
        maxWidth:'100%',
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        gap:20,
        flexDirection:'column',
        marginTop:30,
        paddingBottom:20,
        // backgroundColor:'red',
        
    },
    notitext:{
        color:'#fff',
        fontSize:12
    },
    noti:{
        backgroundColor:'#0065FA',
        paddingVertical:2,
        paddingHorizontal:5,
        borderRadius:50,
        alignItems:'center',
        justifyContent:'center',
    },
    grouptext2:{
        fontWeight:'bold',
    },
    grouptext:{
        fontWeight:'bold',
        color:'#fff'
    },
    middle:{
        flexDirection:'row',
        width:'95%',
        marginTop:20,
        paddingVertical:4,
        borderRadius:30,
        paddingHorizontal:20,
        justifyContent:'space-evenly',
        gap:10
    },
    group2:{
        flex:1,
        borderRadius:30,
        paddingHorizontal:10,
        flexDirection:'row',
        paddingVertical:10,
        gap:5,
        alignItems:'center',
        justifyContent:'center'
    },
    group:{
        backgroundColor:'#00001999',
        flex:1,
        borderRadius:30,
        paddingHorizontal:10,
        flexDirection:'row',
        paddingVertical:10,
        gap:5,
        alignItems:'center',
        justifyContent:'center'
    },
    main1:{
        flex:1,
        width:'100%',
        alignItems:'center',
        justifyContent:'center'
  },
    main:{
        flex:1,
        backgroundColor:'#181830',
        width:'100%',
        alignItems:'center',
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
        flexDirection:'column'
  },
    
    top:{
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        marginTop:5
    },

    searchbar:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        position:'relative',
        width:'95%',
        borderRadius:10,
        paddingHorizontal:10
    },
    search:{
        fontSize:16,
        width:'90%',
        paddingHorizontal:10,
        paddingVertical:6,
    },
    // searchicon:{
    //     position:'absolute',
    //     left:0
    // },

    favtext1:{
        marginTop:20,
        textAlign:'center',
        fontSize:16,
        alignSelf:'center',
        marginBottom:10,
        marginLeft:10,
        fontWeight:'bold'
    },
    fav:{
        flexDirection:'row',
        gap:10,
        alignItems:'center',
        justifyContent:'space-around',
        width:'100%',
        // marginLeft:50,
    },
    fav1:{
        alignItems:'center',
        justifyContent:'center',
        position:'relative',
        alignSelf:'flex-start',
        marginLeft:10
        // padding:60
    },

    favpic1:{
        height:60,
        width:60,
        borderRadius:30,
        // position:'absolute'
    },
    fav1icon:{
        color:'orange',
        position:'absolute'
    },
    favs:{
        flexDirection:'column',
        alignItems:'center',
        justifyContent:'center',
        gap:2,
    },
    favpic:{
        height:60,
        width:60,
        borderRadius:30,
    },
    favtext:{
        textAlign:'center',
        fontSize:12
    }
})
