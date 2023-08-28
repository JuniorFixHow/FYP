import React, {useState, useEffect, useMemo} from 'react'
import { Alert, ActivityIndicator, StyleSheet, Text, View, SafeAreaView, TextInput, Pressable, Modal, TouchableOpacity, Image, ScrollView, Dimensions, FlatList } from 'react-native';
import { Ionicons, Feather, AntDesign, Entypo, FontAwesome  } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { UserList } from '../../miscellaneous/UserChatList';
import { useContext } from 'react';
import { Colours } from '../../utils/MyColours';
import { SettingsContext } from '../components/context/settings/SettingsContext';
import { addData, deleteData, fetchData } from '../../miscellaneous/endpoints';
import {AuthContext} from '../components/context/authContext/AuthContext';
import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where, addDoc, Timestamp, deleteDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { checkTimeSince, fetchUnique, sendUniversalNotification } from '../../utils/functions';
import { db } from '../../../firebase';
import { FetchUsersContext } from '../components/context/fetch/fetchUsersContext';

const Request = ({navigation}) => {
    const {dark, i18n} = useContext(SettingsContext);
    const {user} = useContext(AuthContext);
    const {requests, setRequests, students, allReqs} = useContext(FetchUsersContext);
    
    const [depMode, setDepMode] = useState(false);
    const [codeMode, setCodeMode] = useState(false);
    const [newMode, setNewMode] = useState(false);
    const [filterTypeMode, setFilterTypeMode] = useState(false);
    const [filterDepMode, setFilterDepMode] = useState(false);
    const [filterCcMode, setFilterCcMode] = useState(false);
    const [reqLoading, setReqLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [currentDelete, setCurrentDelete] = useState(null);

    const [searchDep, setSearchDep] = useState('');
    const [searchCourse, setSearchCourse] = useState('');
    const [depName, setDepName] = useState('');
    const [uniqueDeps, setUniqueDeps] = useState([]);
    const [uniqueCc, setUniqueCc] = useState([]);
    const [query, setQuery] = useState('');
    const [tokens, setTokens] = useState([]);
    
    // const allReqs = requests;
   

    useEffect(()=>{
        let list = [];
        students
            .filter(s=> s.id !== user.id)
            .filter(st=> st.allowNoti)
            .filter(student=> student.dep.toLowerCase() === depName.toLowerCase() )
            .forEach(item=>{
            list.push(item.tokens)
        });
        setTokens(list);
    },[depName])

    // console.log('tokens', tokens)
    // console.log('depa', 'cs' === searchDep.toLowerCase());
    // use Filters here
//    console.log(depName.toLowerCase()==='cs')

useEffect(()=>{
    setDepName(searchDep);
},[searchDep])
console.log(searchDep, depName)
    useEffect(()=>{
        let sub = true;
        let deps = [];
        let ccs = [];
        if(sub){
            requests.forEach(item=>{
                deps.push(item.dep);
                ccs.push(item.course);
            });
            setUniqueDeps(deps);
            setUniqueCc(ccs);
        }
        return ()=>{
            sub = false;
        }
    },[requests])

    // console.log(uniqueDeps);

    const manageNew = ()=>{
        const sort  = [...requests].sort((a, b)=>a.createdAt<b.createdAt ? 1:-1);
        setRequests(sort);
    }
    const manageOld = ()=>{
        const sort = [...requests].sort((a, b)=>a.createdAt>b.createdAt ? 1:-1);
        setRequests(sort)
    }
    const manageYours = ()=>{
        setRequests(requests.filter(item=>item.creatorId === user.id));
    }
    const manageAll = ()=>{
        setRequests(allReqs);
    }

useEffect(()=>{
    if(searchDep === ''){
        setDepMode(false);
    }
    if(searchCourse === ''){
        setDepMode(false);
    }
    //Add the course code dependency
},[searchDep, searchCourse])

const handleMainFilter = ()=>{
    setFilterDepMode(false);
    setFilterCcMode(false);
    setFilterTypeMode(!filterTypeMode)
}
const handleFilterDep = ()=>{
    setFilterDepMode(true);
    setFilterCcMode(false);
    setFilterTypeMode(false);
}
const handleFilterCc = ()=>{
    setFilterDepMode(false);
    setFilterCcMode(true);
    setFilterTypeMode(false);
}
const deleteRequest = async(id)=>{
    try {
        // Alert.alert('Deleted','Request deleted ✅');
        setDeleteLoading(true);
        setCurrentDelete(id);
        await deleteDoc(doc(db,'requests', id));
        setDeleteLoading(false);
        setCurrentDelete(null);
    } catch (error) {
        console.log(error);
        alert(i18n.t('errFailed'))
    }
}
const deletePopup = (id)=>{
    Alert.alert(i18n.t('delReq'), i18n.t('aboutDel'),
    [
        {text:i18n.t('yes'), onPress:async()=>{
            deleteRequest(id)
        }},
        {text:i18n.t('no'), onPress:()=>{
            console.log('canceled');
        }, style:'cancel'},
    ],
    {cancelable:true}
    )
}

const handleChangeDep = (e)=>{
    setSearchDep(e);
    setDepName(e);
}
const addRequest =async()=>{
    setReqLoading(true);
    const requestData = {
        creatorId: user.id,
        creator: user?.fullname || user?.username,
        dep: searchDep,
        course: searchCourse,
        userDep: user?.dep || null,
        userLevel: user?.level || null,
        userImage: user?.image || null,
        createdAt:Timestamp.fromDate(new Date())
    }

    if(searchCourse !== '' && searchDep !==''){
       const title = i18n.t('gpReq');
       const content = `${user.fullname || user.username} ${i18n.t('wgp')} ${searchCourse} ${i18n.t('indpt')}`;
       try {
           alert(`${i18n.t('reqAdd')} ✅`);
            await addData('requests', requestData);
            sendUniversalNotification(title, content, tokens);
            setSearchCourse('');
            setSearchDep('');
            setReqLoading(false);
        } catch (error) {
            console.log(error)
            setReqLoading(false);
       } 
        
    }
    else{
        alert(i18n.t('spcDpt'));
        setReqLoading(false);
    }
}


const handleChatPage = (id)=>{
    navigation.navigate('Profile', {
        currentUser: students.filter(st=>st.id === id)[0]
    })
}


    return (
        <SafeAreaView style={[styles.main, {backgroundColor: dark?Colours.bacDark:Colours.bacLight}]} >
            <View onPress={()=>setFilterTypeMode(false)} style={styles.container} >
                <View style={styles.headHead} >
                    <Text style={[styles.topheader, {color:dark?Colours.titeleDark:Colours.titeleLight}]} >{i18n.t('req1')}</Text>
                    {
                        newMode ?
                        <Pressable onPress={()=>setNewMode(false)} style={styles.plus} >
                            <Entypo name="squared-cross" size={24} color="crimson" />
                        </Pressable>
                        :
                        <Pressable onPress={()=>setNewMode(true)} style={styles.plus} >
                            <AntDesign name="plussquare" size={24} color={dark?Colours.titeleDark:Colours.titeleLight} />
                        </Pressable>
                    }
                </View>
                {
                    newMode &&
                    <View style={styles.top} >
                        <Text style={[styles.header, {color:dark?Colours.bacLight:Colours.textLight}]} >{i18n.t('whatG')}</Text>
            
                        <View style={styles.depart} >
                            <View style={styles.inputSearch} >
                                <Text style={styles.label} > {i18n.t('addDep')} </Text>
                                <View style={styles.inputBox} >
                                    <TextInput
                                        style={[styles.seachBox, {color:dark?Colours.bacLight:Colours.subTextDark}]}
                                        placeholder='search or add department'
                                        placeholderTextColor='#969494'
                                        onChangeText={handleChangeDep}
                                        value={searchDep}
                                    />
                                    {
                                        depMode ?
                                        <Pressable onPress={()=>setDepMode(false)} style={styles.downArrow} >
                                            <Entypo name="chevron-small-up" size={24} color={dark?Colours.titeleDark:Colours.textLight} />
                                        </Pressable>
                                        :
                                        <Pressable onPress={()=>setDepMode(true)} style={styles.downArrow} >
                                            <Entypo name="chevron-small-down" size={24} color={dark?Colours.titeleDark:Colours.textLight} />
                                        </Pressable>
                                    }
                                </View>

                                {
                                depMode &&
                                <ScrollView style={styles.searchItems} >
                                    {
                                        requests &&
                                        fetchUnique(uniqueDeps).filter((item)=>{
                                            return searchDep === '' ? item :
                                            item.includes(searchDep)
                                        }).map(i=>(
                                            <Pressable style={{with:'100%'}} onPress={()=>{setSearchDep(i); setDepMode(false)}} key={i} >
                                                <Text style={[styles.oneSearch, {color:dark?Colours.subTextLight:Colours.subTextDark}]} >{i}</Text>
                                            </Pressable>
                                        ))
                                    }
                                </ScrollView>
                            }

                            </View>
                            <View style={styles.inputSearch} >
                                <Text style={styles.label} > {i18n.t('selectCc')} </Text>
                                <View style={styles.inputBox} > 
                                    <TextInput
                                        style={[styles.seachBox, {color:dark?Colours.bacLight:Colours.subTextDark}]}
                                        placeholder='search or add cousre code'
                                        placeholderTextColor='#969494'
                                        onChangeText={(e)=>setSearchCourse(e)}
                                        value={searchCourse}
                                    />
                                    {
                                        codeMode ?
                                        <Pressable onPress={()=>setCodeMode(false)} style={styles.downArrow} >
                                            <Entypo name="chevron-small-up" size={24} color={dark?Colours.titeleDark:Colours.textLight} />
                                        </Pressable>
                                        :
                                        <Pressable onPress={()=>setCodeMode(true)} style={styles.downArrow} >
                                            <Entypo name="chevron-small-down" size={24} color={dark?Colours.titeleDark:Colours.textLight} />
                                        </Pressable>
                                    }
                                </View>

                                {
                                    codeMode &&
                                    <ScrollView style={styles.searchItems} >
                                        {
                                            requests &&
                                            fetchUnique(uniqueCc).filter((item)=>{
                                                return searchCourse === '' ? item :
                                                item.includes(searchCourse)
                                            }).map(i=>(
                                                <Pressable style={{with:'100%'}} onPress={()=>{setSearchCourse(i); setCodeMode(false)}} key={i} >
                                                    <Text style={[styles.oneSearch, {color:dark?Colours.subTextLight:Colours.subTextDark}]} >{i}</Text>
                                                </Pressable>
                                            ))
                                        }
                                    </ScrollView>
                                }
                            </View>
                       
                            <TouchableOpacity onPress={addRequest} style={styles.submit} >
                                <Text style={styles.submitText} >{i18n.t('submit')}</Text>
                            </TouchableOpacity>
                        
                        </View>
                    </View>
                }

                {/* this can also be a Pressable that will close the filter mode */}
                   <View style={styles.filter} >
                        <TextInput
                            value={query}
                            onChangeText={(e)=>setQuery(e)}
                            placeholder={i18n.t('secrqs')}
                            placeholderTextColor='#b6b6b6'
                            returnKeyType='search'
                            style={[styles.typeFilter, {color:dark?Colours.bacLight:Colours.subTextDark}]}
                        />
                        <Pressable onPress={handleMainFilter} >
                            <Feather name="filter" size={24} color={dark?Colours.iconDark:Colours.iconLight} />
                        </Pressable>
                   </View>
                   <ScrollView style={{width:'100%'}}  >
                    <View style={{width:'100%', alignItems:'center', justifyContent:'center', marginBottom:150}} >

                    
                        <View style={styles.down} >
                        {
                            filterTypeMode &&
                            <View style={styles.depFilter} >
                                <TouchableOpacity onPress={manageAll} >
                                    <Text style={styles.filterType} >{i18n.t('all')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={manageYours} >
                                    <Text style={styles.filterType} >{i18n.t('yrs')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleFilterDep} >
                                    <Text style={styles.filterType} >{i18n.t('deps')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleFilterCc} >
                                    <Text style={styles.filterType} >{i18n.t('cc')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={manageNew} >
                                    <Text style={styles.filterType} >{i18n.t('new')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={manageOld} >
                                    <Text style={styles.filterType} >{i18n.t('old')}</Text>
                                </TouchableOpacity>
                            </View>
                        }
                            <View style={styles.scroll} >
                                {
                                    filterDepMode &&
                                    <View style={styles.allDep} >
                                        {
                                            requests &&
                                            fetchUnique(uniqueDeps).map((item)=>(
                                                <Pressable onPress={()=>setQuery(item)} key={item} style={styles.pressFilter} >
                                                    <Text style={styles.all} >{item}</Text>
                                                </Pressable>
                                            ))
                                        }
                                    </View>
                                }
                                {
                                    filterCcMode &&
                                    <View style={styles.allCode} >

                                        <View style={styles.codes} >
                                            {
                                                requests &&
                                                fetchUnique(uniqueCc).slice(0, (0.5 * requests.length)).map((item)=>(

                                                    <Pressable onPress={()=>setQuery(item)} key={item} style={styles.pressCode} >
                                                        <Text style={styles.all} >{item}</Text>
                                                    </Pressable>
                                                ))
                                            }

                                        </View>
                                        <View style={styles.codes} >
                                            {
                                                requests &&
                                                fetchUnique(uniqueCc).slice((0.5 * requests.length), requests.length).map((item)=>(

                                                    <Pressable onPress={()=>setQuery(item)} key={item} style={styles.pressCode} >
                                                        <Text style={styles.all} >{item}</Text>
                                                    </Pressable>
                                                ))
                                            }

                                        </View>
                                    </View>
                                }
                            </View>
                        </View>
                    
                    {/* <ScrollView scrollEnabled > */}
                        <View style={styles.downDown} >
                            {
                                requests &&
                               requests.filter(item=>{
                                return query === ''? item : Object.values(item)
                                .join(' ')
                                .toLowerCase()
                                .includes(query.toLowerCase())}).map((item)=>(

                                    <View key={item.id} style={styles.oneDown} >
                                        <View style={styles.imgContainer} >
                                            <Image style={styles.img} source={{uri:students.filter(st=>st.id===item.creatorId)[0].image}} />
                                            <View style={styles.dwonRight} >
                                                {
                                                    item.userLevel &&
                                                    <Text style={[styles.downName, {color:dark?Colours.titeleDark:Colours.textLight}]} >{students.filter(st=>st.id===item.creatorId)[0].fullname || students.filter(st=>st.id===item.creatorId)[0].username || item.creator}, { i18n.t('lvl')} {item.userLevel} {i18n.t('st')}</Text>
                                                }
                                                {
                                                    item.userDep &&
                                                    <Text style={[styles.downName, {color:dark?Colours.titeleDark:Colours.textLight}]} >@{students.filter(st=>st.id===item.creatorId)[0]?.dep || item.userDep}</Text>
                                                }
                                                <Text style={[styles.downDesc, {color:dark? Colours.bacLight:Colours.subTextDark}]} >{i18n.t('want')} {item.course} {i18n.t('from')} {item.dep}</Text>
                                                <Text style={[styles.downName, {color:dark?Colours.titeleDark:Colours.iconDark}]} >{checkTimeSince(new Timestamp( item?.createdAt.seconds, item?.createdAt.nanoseconds).toDate()) }</Text>
                                                <View style={styles.delete} >
                                                    {
                                                        item.creatorId !== user.id &&
                                                        <TouchableOpacity onPress={()=>handleChatPage(item.creatorId)} style={styles.viewBut} >
                                                            <Text style={styles.viewText} >{i18n.t('vp')}</Text>
                                                        </TouchableOpacity>
                                                    }
                                                    {
                                                        item.creatorId === user.id &&
                                                        <>
                                                        {
                                                            deleteLoading && currentDelete === item.id ?
                                                            <ActivityIndicator size={'small'} /> :
                                                            <TouchableOpacity onPress={()=>deletePopup(item.id)} style={styles.deleteBut} >
                                                                <Text style={styles.viewText} >{i18n.t('del')}</Text>
                                                            </TouchableOpacity>
                                                        }
                                                        </>
                                                    }
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                ))
                            }
                            
                            
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default Request

const styles = StyleSheet.create({
    allCode:{
        width:'100%',
        flexDirection:'row',
        gap:10
    },
    delete:{
        flexDirection:'row',
        alignSelf:'flex-start',
        gap:10
    },
    deleteBut:{
        backgroundColor:'crimson',
        width:100,
        alignItems:'center',
        justifyContent:'center',
        paddingVertical:5,
        borderBottomRightRadius:5,
        borderTopLeftRadius:5
    },
    viewBut:{
        backgroundColor:'#4aacf3',
        width:100,
        alignItems:'center',
        justifyContent:'center',
        paddingVertical:5,
        borderBottomRightRadius:5,
        borderTopLeftRadius:5
    },
    downDesc:{
        fontSize:15,
        fontWeight:'600',
        width:'95%',
        // backgroundColor:'yellow'
    },
    downName:{
        fontSize:15,
        width:'90%'
    },
    dwonRight:{
        flexDirection:'column',
        gap:2,
        justifyContent:'flex-start',
        width:'90%'
    },
    img:{
        width:50,
        height:50,
        borderRadius:25
    },
    imgContainer:{
        // backgroundColor:'yellow',
        width:'100%',
        gap:5,
        flexDirection:'row',
        // alignItems:'center',
        // justifyContent:'center',
        alignSelf:'flex-start',
    },
    oneDown:{
        width:'100%',
        justifyContent:'center',
        flexDirection:'column',
        gap:5,
        borderColor:'#adadad',
        borderBottomWidth:0.5,
        paddingBottom:8
    },
    downDown:{
        width:'95%',
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'column',
        gap:25,
        marginLeft:10,
        // marginBottom:50,
        // backgroundColor:'red',
        // maxHeight:'100%',
        marginTop:15,
        paddingBottom:20
    },
    all:{
        fontWeight:'600',
        textAlign:'left',
        color:'antiquewhite',
    },
    pressFilter:{
        backgroundColor:'#4343c5',
        borderRadius:5,
        paddingHorizontal:10,
        paddingVertical:5,
        marginVertical:8,
        marginRight:5,
        alignItems:'flex-start',
        justifyContent:'center',
        // width:'60%',
        maxWidth:'90%',
    },
    pressCode:{
        backgroundColor:'#4343c5',
        borderRadius:5,
        paddingHorizontal:10,
        paddingVertical:5,
        marginVertical:8,
        marginRight:5,
        alignItems:'center',
        justifyContent:'center',
        // width:'50%',
        // maxWidth:'90%',
    },
    scroll:{
        width:'100%',
        // paddingHorizontal:10,
        // alignItems:'center'
    },
    codes:{
        flexDirection:'column',
        // width:'100%',
        // alignItems:'center'
    },
    allDep:{
        flexDirection:'column',
        width:'100%',
        // alignItems:'center'
    },
    filterType:{
        color:'antiquewhite',
        fontSize:13,
        fontWeight:'600'
    },
    depFilter:{
        alignSelf:'flex-end',
        gap:8,
        backgroundColor:'#4343c5',
        paddingHorizontal:10,
        paddingVertical:5,
        borderRadius:5
    },
    typeFilter:{
        fontSize:14,
        paddingVertical:2,
        paddingHorizontal:6,
        borderWidth:1,
        borderColor:'#4aacf3',
        width:'90%',
        borderRadius:5
    },
    filter:{
        width:'90%',
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row',
        gap:10,
    },
    down:{
        width:'90%',
        flexDirection:'column',
        alignItems:'center',
        gap:10
    },
    oneSearch:{
        fontSize:13,
    },
    searchItems:{
        width:'90%',
        borderWidth:1,
        borderColor:'#969494',
        paddingVertical:5,
        paddingHorizontal:5,
        borderRadius:5,
        alignSelf:'center',
        maxHeight:100,
    },
    downArrow:{
        position:'absolute',
        right:0
    },
    seachBox:{
        fontSize:14,
        paddingVertical:2,
        paddingHorizontal:6,
        borderWidth:1,
        borderColor:'#4aacf3',
        width:'100%',
        borderRadius:5
    },
    inputBox:{
        flexDirection:'row',
        position:'relative',
        justifyContent:'center',
        alignItems:'center',
        width:'100%'
    },
    label:{
        fontSize:16,
        color:'white',
        fontWeight:'700'
    },
    inputSearch:{
        flexDirection:'column',
        gap:5,
        width:'90%',
        alignItems:'flex-start'
    },
    depart:{
        flexDirection:'column',
        gap:10,
        marginTop:10,
        width:'90%',
        // paddingHorizontal:10,
        // alignItems:'center',
        alignSelf:'flex-start',
        marginLeft:10
    },
    submit:{
        alignSelf:'flex-start',
        backgroundColor:'#4aacf3',
        paddingVertical:8,
        paddingHorizontal:25,
        borderRadius:8
    },
    plus:{
        position:'absolute',
        right:0,
        bottom:0,
    },
   headHead:{
        width:'90%',
        alignItems:'center',
        flexDirection:'column',
        gap:10,
        position:'relative',
        // backgroundColor:'red'
   },
    header:{
        fontSize:20,
        fontWeight:'bold',
        textAlign:'center',
        width:'80%',
    },
    topheader:{
        fontSize:23,
        fontWeight:'bold',
        textAlign:'center',
        width:'80%',
        marginBottom:15,
    },
    top:{
        width: '100%',
        alignItems:'center',
        gap:5,
        flexDirection:'column'
    },
    container:{
        width: '100%',
        alignItems:'center',
        gap:20,
        flexDirection:'column',
        marginBottom:15
    },
    main:{
        flexDirection:'column',
        width:'100%',
        alignItems:'center',
        flex:1,
        paddingTop:10,
        // height:height
    },
})
