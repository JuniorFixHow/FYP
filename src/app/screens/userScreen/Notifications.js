import React, { useContext, useEffect, useState } from 'react'
import { Pressable, SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, TextInput, ScrollView } from 'react-native';
import { AntDesign, Ionicons  } from '@expo/vector-icons';
import { Colours } from '../../../utils/MyColours';
import { FetchUsersContext } from '../../components/context/fetch/fetchUsersContext';
import { SettingsContext } from '../../components/context/settings/SettingsContext';
import { AuthContext } from '../../components/context/authContext/AuthContext';
import { checkTimeSince } from '../../../utils/functions';
import { Timestamp, collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../../../firebase';



const Notifications = ({navigation}) => {
    const {sysAlerts, setSysAlerts} = useContext(FetchUsersContext);
    const {dark} = useContext(SettingsContext);
    const {user} = useContext(AuthContext);
   const [currentNoti, setCurrentNoti] = useState(undefined);
   const [isDeleteMode, setIsDeleteMode] = useState(false);
   const [showFull, setShowFull] = useState(false);
   const [qquery, setQquery] = useState('');
   const [deleteLoading, setDeleteLoading] = useState(false);

   const handleLongPress =(notiId)=>{
        setCurrentNoti(notiId);
        setIsDeleteMode(true);
   }

   useEffect(()=>{
    const reference = collection(db, 'noti');
    const unsub = onSnapshot(
        reference, {includeMetadataChanges:true}, (snapshot)=>{
            let list = [];
            snapshot.docs.forEach((doc)=>{
                list.push({id:doc.id, ...doc.data()});
            });
            
            // playTone(tonePath)
            setSysAlerts(list.sort((a, b)=>a.createdAt<b.createdAt ? 1:-1))
        },
        (error)=>{
            console.log(error)
        },
        orderBy('createdAt', 'desc')
    )
    return ()=>{
        unsub();
    }
},[])
    // console.log(sysAlerts.length)
   const handleMessagePress = async(notiId)=>{

        if(isDeleteMode){
            setIsDeleteMode(false);
            setCurrentNoti(undefined);
        }
        else{
            setCurrentNoti(notiId);
            setShowFull(prev => !prev);
            
            const noti  = await getDoc(doc(db, 'noti', notiId));
            if(!noti.read){
                await updateDoc(doc(db, 'noti', notiId), {
                    read: true
                })            
            }

        }
   }

   const deleteNotification = async()=>{
        setDeleteLoading(true)
        await deleteDoc(doc(db, 'noti', currentNoti));
        setCurrentNoti(undefined);
        setDeleteLoading(false);
   }

    return (
        <SafeAreaView style={[styles.main, {backgroundColor:dark?Colours.bacDark:Colours.bacLight}]} >
            <View style={styles.header} >
                <Pressable onPress={()=>navigation.navigate('More')} style={styles.back} >
                    <Ionicons  name="chevron-back-circle" size={40} color="#b9b7b7" />
                </Pressable>
                <Text style={[styles.editHeader, {color:dark?Colours.titeleDark:Colours.titeleLight}]}>System Alerts</Text>
            </View>
            <View style={styles.container} >
                <TextInput style={[styles.search, {color:dark?Colours.subTextLight:Colours.subTextDark, backgroundColor:dark?Colours.iconDark:Colours.textDark}]}
                    placeholder='search notification'
                    placeholderTextColor={dark?'#d1d0d0':'grey'}
                    value={qquery}
                    onChangeText={(e)=>setQquery(e)}
                />
                <ScrollView style={{width:'100%'}} >
                    <View style={{width:'100%', justifyContent:'center', alignContent:'center', marginBottom:120}} >
                    {
                        sysAlerts &&
                        sysAlerts.filter((us)=>us.receiverId === user.id).filter(item=>{
                            return qquery === ''? item : Object.values(item)
                            .join(' ')
                            .toLowerCase()
                            .includes(qquery.toLowerCase())}).map((frd)=>(
                            <TouchableOpacity onLongPress={()=>handleLongPress(frd.id)} onPress={()=>handleMessagePress(frd.id)} style={[styles.userContainer, {backgroundColor:dark? '#0a0ae0a8':'#a5a5a5'}]} key={frd.id} >
                                <Image source={{uri:frd.image}} style={styles.img} />
                                <View style={styles.user} >
                                    <Text style={[styles.userName, {color:dark?Colours.bacLight:Colours.textLight, fontWeight:frd.read? '400': '700'}]} >{frd.title}</Text>
                                    {
                                        showFull && currentNoti === frd.id ?
                                        <Text style={[styles.useDep, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{frd.message}</Text>
                                        :
                                        <Text style={[styles.useDep, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{frd.message.substring(0, 35)}...</Text>
                                    }
                                    <Text style={[styles.useTime, {color:dark?Colours.titeleDark:Colours.subTextDark}]} >{checkTimeSince(new Timestamp( frd?.createdAt.seconds, frd?.createdAt.nanoseconds).toDate())}</Text>
                                </View>
                                {
                                    isDeleteMode && currentNoti === frd.id &&
                                    <>
                                    {
                                        deleteLoading && currentNoti === frd.id ? 
                                        <AntDesign name="clockcircleo" size={16} color="green" />:
                                        <Pressable onPress={deleteNotification} >
                                            <Ionicons name="trash-bin-outline" size={24} color="crimson" />
                                        </Pressable>
                                    }
                                    </>
                                }
                            </TouchableOpacity>
                        ))
                    }
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default Notifications

const styles = StyleSheet.create({
    useTime:{
        fontSize:11
    },
    useDep:{
        fontSize:13,
    },
    userName:{
        fontSize:16,
    },
    user:{
        flexDirection:'column',
        justifyContent:'center',
        width:'80%',
    },
    img:{
        width:50,
        height:50,
        borderRadius:25
    },
    userContainer:{
        width:'95%',
        flexDirection:'row',
        // alignItems:'center',
        justifyContent:'center',
        paddingHorizontal:10,
        gap:10,
        marginTop:15,
        // backgroundColor:'blue',
        alignSelf:'center',
        backgroundColor:'gainsboro',
        paddingVertical:2,
        elevation:2
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
