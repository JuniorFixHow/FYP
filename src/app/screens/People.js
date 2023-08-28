import React, {useState, useEffect, useContext} from 'react'
import { ActivityIndicator, StyleSheet, Text, View, SafeAreaView, TextInput, Pressable, Modal, TouchableOpacity, Image, ScrollView, Dimensions, FlatList } from 'react-native';
import { Ionicons, Feather, AntDesign, Entypo, FontAwesome  } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { UserList } from '../../miscellaneous/UserChatList';
import { SettingsContext } from '../components/context/settings/SettingsContext';
import { Colours } from '../../utils/MyColours';
import { arrayUnion, collection, doc, getDoc, onSnapshot, orderBy, updateDoc } from 'firebase/firestore';
import { AuthContext } from '../components/context/authContext/AuthContext';
import { db } from '../../../firebase';
import { FetchUsersContext } from '../components/context/fetch/fetchUsersContext';
import { createGroupNotification, fetchUnique } from '../../utils/functions';

const People = ({navigation}) => {
    const {dark, i18n} = useContext(SettingsContext);
    const {user} = useContext(AuthContext);
    const {allGroups, setAllGroups, students, setStudents} = useContext(FetchUsersContext);

    const [depMode, setDepMode] = useState(false);
    const [filterTypeMode, setFilterTypeMode] = useState(false);
    const [filterDepMode, setFilterDepMode] = useState(false);
    const [filterCcMode, setFilterCcMode] = useState(false);

    // set group categories such as popular, department
    const [isGroupCat, setIsGroupCatOpen] = useState(false);
    const [isStudentCat, setIsStudentCatOpen] = useState(true);
    const [filterLevelMode, setFilterLevelMode] = useState(false);
    const [query, setQuery] = useState('');
    const [requestUser, setRequestUser] = useState(undefined);
    const [frdReqLoading, setFrdReqLoading] = useState(false);
    const [groupReqLoading, setGroupReqLoading] = useState(false);
    
    const [uniqueCc, setUniqueCc] = useState([]);
    const [uniqueDeps, setUniqueDeps] = useState([]);
   

    const levelData = [{id:1, name: '100'}, {id:2, name: '200'}, {id:3, name: '300'}, {id:4, name: '400'},];


const depts = ['COM Science', 'Poly Science', 'Education'];
const [searchDep, setSearchDep] = useState(depts[0]);
// console.log(searchDep);
useEffect(()=>{
    if(searchDep === ''){
        setDepMode(false);
    }
    //Add the course code dependency
},[searchDep])

useEffect(()=>{
    let sub = true;
    let deps = [];
    if(sub){
        students.filter(st=>st.dep !== '').forEach(item=>{
            deps.push(item.dep);
        });
        setUniqueDeps(deps);
    }
    return ()=>{
        sub = false;
    }
},[students])

useEffect(()=>{
    let sub =true
    let ccs = [];
    if(sub){
        allGroups.filter(item=> !item.hidden).filter(gp=>gp.cc !== '').forEach(item=>{
            ccs.push(item.cc);
        });
        setUniqueCc(ccs);
    }
    return ()=>{
        sub = false;
    }
},[allGroups])

const handleGroupOpen = ()=>{
    setFilterTypeMode(false);
    setIsGroupCatOpen(true);
    setIsStudentCatOpen(false);
}
const handleStudentOpen = ()=>{
    setFilterTypeMode(false);
    setIsGroupCatOpen(false);
    setIsStudentCatOpen(true);
}

const handleMainFilter = ()=>{
    setFilterTypeMode(prev=>!prev)
    setIsGroupCatOpen(false);
    setIsStudentCatOpen(false);
    setFilterDepMode(false);
    setFilterCcMode(false);
    setFilterLevelMode(false);

}

const handleFilterLevel  = ()=>{
    // setIsGroupCatOpen(false);
    // setIsStudentCatOpen(false);
    setFilterLevelMode(true);
    setFilterDepMode(false);
    setFilterCcMode(false);
}
const handleFilterDepart  = ()=>{
    // setIsGroupCatOpen(false);
    // setIsStudentCatOpen(false);
    setFilterLevelMode(false);
    setFilterDepMode(true);
    setFilterCcMode(false);
}
const handleFilterCourses  = ()=>{
    
    setFilterDepMode(false);
    setFilterCcMode(false);
    setFilterLevelMode(false);
    setFilterDepMode(false);
    setFilterCcMode(true);
}


    const manageNewStudents = ()=>{
        if(isStudentCat){
            const sort  = [...students].sort((a, b)=>a.createdAt<b.createdAt ? 1:-1);
            setStudents(prev=>sort);
        }
        else if(isGroupCat){
            const sort  = [...allGroups].sort((a, b)=>a.createdAt<b.createdAt ? 1:-1);
            setAllGroups(prev=>sort);
        }
    }
    const manageOldStudents = ()=>{
        if(isStudentCat){
            const sort = [...students].sort((a, b)=>a.createdAt>b.createdAt ? 1:-1);
            setStudents(prev=> sort)
        }
        else if(isGroupCat){
            const sort = [...allGroups].sort((a, b)=>a.createdAt>b.createdAt ? 1:-1);
            setAllGroups(prev=>sort)

        }
    }
    const managePopularStudents = ()=>{
        if(isStudentCat){
            const sort = [...students].sort((a, b)=>a.friends.length < b.friends.length ? 1:-1);
            setStudents(prev=>sort)
        }
        else if(isGroupCat){
            const sort = [...allGroups].sort((a, b)=>a.members.length < b.members ? 1:-1);
            setAllGroups(prev=>sort)

        }
    }
 
   
    const manageAllStudents = ()=>{
        if(isStudentCat){
            setQuery('')
        }
        else if(isGroupCat){
            setQuery('');
        }
    }
    

    
    const createFriendRequest = async(friendId)=>{
        setRequestUser(friendId)
        setFrdReqLoading(true);
        let mes = `${user.username || user.fullname} has sent you a friend request.`;
        let title = `Friend Request`;
        try {
            const student =  await getDoc(doc(db, "users", friendId))
            const isFA = student.data()?.friends?.filter(friend=>friend === user.id);
            const isFO = student.data()?.folls?.filter(friend=>friend === user.id);
            if(isFA.length){
                alert(i18n.t('frdAlready'));
                setRequestUser(undefined);
                setFrdReqLoading(false);
            }
            else if(isFO.length){
                alert(i18n.t('reqAlready'));
                setRequestUser(undefined);
                setFrdReqLoading(false);
            }
            else{

                alert(`${i18n.t('reqSend')} ✅`);
                await updateDoc(doc(db, 'users', friendId), {
                    folls:arrayUnion(user.id)
                });
                setRequestUser(undefined);
                setFrdReqLoading(false);
                createGroupNotification(user.id, user?.image, title, mes, friendId);
            }
        } 
        catch (error) {
            console.log(error);
            setFrdReqLoading(false);
        }
    }
    const createGroupRequest = async(friendId)=>{
        setRequestUser(friendId);
        setGroupReqLoading(true);
        try {
            const student =  await getDoc(doc(db, "groups", friendId))
            const isFA = student.data()?.members?.filter(friend=>friend === user.id);
            const isFO = student.data()?.folls?.filter(friend=>friend === user.id);
            if(isFA.length){
                alert(i18n.t('gpMem'));
                // setRequestUser(undefined);
                setGroupReqLoading(false);
            }
            else if(isFO.length){
                alert(i18n.t('gpReqAlready'));
                // setRequestUser(undefined);
                setGroupReqLoading(false);
            }
            else{

                alert(`${i18n.t('gpReq')} ✅`);
                await updateDoc(doc(db, 'groups', friendId), {
                    folls:arrayUnion(user.id)
                });
                // setRequestUser(undefined);
                setGroupReqLoading(false);
            }
        } 
        catch (error) {
            console.log(error);
            setGroupReqLoading(false);
            alert(i18n.t('prcFailed'));
        }
    }
    return (
        <SafeAreaView style={[styles.main, {backgroundColor:dark?Colours.bacDark:Colours.bacLight}]} >
            <View onPress={()=>setFilterTypeMode(false)} style={styles.container} >
                <View style={styles.headHead} >
                    <Text style={[styles.topheader, {color:dark?Colours.titeleDark:Colours.titeleLight}]} >{i18n.t('ppl')}</Text>
                    
                </View>
                

                {/* this can also be a Pressable that will close the filter mode */}
                <View style={styles.filter} >
                    <TextInput
                        placeholder={i18n.t('sechppl')}
                        placeholderTextColor='#b6b6b6'
                        returnKeyType='search'
                        value={query}
                        onChangeText={(e)=>setQuery(e)}
                        style={[styles.typeFilter, {color:dark?Colours.bacLight:Colours.subTextDark}]}
                    />
                    <Pressable onPress={handleMainFilter} >
                        <Feather name="filter" size={24} color={dark?Colours.iconDark:Colours.iconLight} />
                    </Pressable>
                </View>
                <ScrollView style={{width:'100%'}} >
                    <View style={{width:'100%', justifyContent:'center', alignItems:'center', marginBottom:150}} >
                        <View style={styles.down} >
                        {
                            filterTypeMode &&
                            <View style={styles.depFilter} >
                                <TouchableOpacity onPress={handleGroupOpen} >
                                    <Text style={styles.filterType} >{i18n.t('gps')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleStudentOpen} >
                                    <Text style={styles.filterType} >{i18n.t('sts')}</Text>
                                </TouchableOpacity>
                                
                            </View>
                        }

                                {
                                    (isGroupCat || isStudentCat) &&
                                    <View style={styles.allCat} >
                                            <View style={styles.catBox} >
                                                <Pressable onPress={manageAllStudents} style={styles.pressFilters} >
                                                    <Text style={styles.all} >{i18n.t('all')}</Text>
                                                </Pressable>
                                                {
                                                    isGroupCat &&
                                                    <Pressable onPress={handleFilterCourses} style={styles.pressFilters} >
                                                        <Text style={styles.all} >{i18n.t('courses')}</Text>
                                                    </Pressable>
                                                }
                                                <Pressable onPress={handleFilterLevel}  style={styles.pressFilters} >
                                                    <Text style={styles.all} >{i18n.t('level')}</Text>
                                                </Pressable>
                                            </View>
                                            <View style={styles.catBox} >
                                                <Pressable onPress={managePopularStudents} style={styles.pressFilters} >
                                                    <Text style={styles.all} >{i18n.t('pp')}</Text>
                                                </Pressable>
                                                <Pressable onPress={manageNewStudents} style={styles.pressFilters} >
                                                    <Text style={styles.all} >{i18n.t('new')}</Text>
                                                </Pressable>
                                            </View>
                                            <View style={styles.catBox} >
                                                <Pressable onPress={handleFilterDepart} style={styles.pressFilters} >
                                                    <Text style={styles.all} >{i18n.t('deps')}</Text>
                                                </Pressable>
                                                <Pressable onPress={manageOldStudents}  style={styles.pressFilters} >
                                                    <Text style={styles.all} >{i18n.t('old')}</Text>
                                                </Pressable>
                                            </View>
                                    </View>
                                }
                                        
                            <View style={styles.scroll} >
                                {
                                    filterLevelMode &&
                                    <View style={styles.allDep} >
                                        {
                                            levelData.map(item=>(
                                                <Pressable onPress={()=>setQuery(item.name)} key={item.id} style={styles.pressFilter} >
                                                    <Text style={styles.all} >{item.name}</Text>
                                                </Pressable>
                                            ))
                                        }
                                        
                                    </View>
                                }
                                {
                                    filterDepMode &&
                                    students &&
                                    <View style={styles.allDepart} >
                                        {
                                            isStudentCat ?
                                            fetchUnique(uniqueDeps).map(item=>(
                                                <Pressable onPress={()=>setQuery(item)} key={item} style={styles.presDep} >
                                                    <Text style={styles.all} >{item}</Text>
                                                </Pressable>
                                            ))
                                            :
                                            fetchUnique(uniqueCc).map(item=>(
                                                <Pressable onPress={()=>setQuery(item)} key={item} style={styles.presDep} >
                                                    <Text style={styles.all} >{item}</Text>
                                                </Pressable>
                                            ))
                                        }
                                       
                                        
                                    </View>
                                }
                                
                                {
                                    filterCcMode && isGroupCat &&
                                    <View style={styles.allCode} >

                                        <View style={styles.codes} >
                                            {
                                                allGroups &&
                                                fetchUnique(uniqueCc).slice(0, (0.5 * allGroups.length)).map((item)=>(

                                                    <Pressable onPress={()=>setQuery(item)} key={item} style={styles.pressCode} >
                                                        <Text style={styles.all} >{item}</Text>
                                                    </Pressable>
                                                ))
                                            }

                                        </View>
                                        <View style={styles.codes} >
                                            {
                                                allGroups &&
                                                fetchUnique(uniqueCc).slice((0.5 * allGroups.length), allGroups.length).map((item)=>(

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
                        
                        {
                            isStudentCat &&
                            <View style={styles.downDown} >
                                {
                                    students &&
                                    students.filter(u=>(u.id !== user.id)).filter(u=> !u.hidden).filter(item=>{
                                        return query === ''? item : Object.values(item)
                                        .join(' ')
                                        .toLowerCase() 
                                        .includes(query.toLowerCase())}).map(student=>(

                                        <View key={student.id} style={styles.oneDown} >
                                            <View style={styles.imgContainer} >
                                                <Image style={styles.img} source={{uri:student.image}} />
                                                <View style={styles.dwonRight} >
                                                    <Text style={[styles.downNam, {color:dark?Colours.titeleDark:Colours.textLight}]} >{student?.fullname || student.username } </Text>
                                                    {
                                                        student.level &&
                                                        <Text style={[styles.downName, {color:dark?Colours.titeleDark:Colours.textLight}]} > {i18n.t('level')} {student.level}</Text>
                                                    }
                                                    {
                                                        student.dep &&
                                                        <Text style={[styles.downName, {color:dark?Colours.titeleDark:Colours.textLight}]} >@{student.dep}</Text>
                                                    }
                                                    <View style={styles.delete} >
                                                        <TouchableOpacity onPress={()=>navigation.navigate('Profile', {currentUser:student})} style={styles.viewBut} >
                                                            <Text style={styles.viewText} >{i18n.t('vp')}</Text>
                                                        </TouchableOpacity>
                                                        {
                                                            frdReqLoading && requestUser === student.id ?
                                                            <ActivityIndicator size={'small'} /> :
                                                            <TouchableOpacity onPress={()=>createFriendRequest(student.id)} style={styles.deleteBut} >
                                                                <Text style={styles.viewText} >{i18n.t('reqs')}</Text>
                                                            </TouchableOpacity>
                                                        }
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    ))
                                }
                                
                            </View>
                        }
                        {
                            isGroupCat &&
                            <View style={styles.downDown} >
                            {
                                allGroups &&
                                allGroups.filter(u=>!u.hidden).filter(item=>{
                                    return query === ''? item : Object.values(item)
                                    .join(' ')
                                    .toLowerCase() 
                                    .includes(query.toLowerCase())}).map(item=>(
                                    <View key={item.id} style={styles.oneDown} >
                                    <View style={styles.imgContainer} >
                                        <Image style={styles.img} source={{uri:item.image}} />
                                        <View style={styles.dwonRight} >
                                            <Text style={[styles.downNam, {color:dark?Colours.titeleDark:Colours.textLight}]} >{item?.gname}</Text>
                                            <Text style={[styles.downName, {color:dark?Colours.titeleDark:Colours.textLight}]} >({item?.cc}) {item?.course}</Text>
                                            {
                                                item.lev &&
                                                <Text style={[styles.downDesc, {color:dark?Colours.bacLight:Colours.iconDark}]} >Level {item?.lev}</Text>
                                            }
                                            <Text style={[styles.downDesc, {color:dark?Colours.bacLight:Colours.iconDark}]} >@{item?.dep}</Text>
                                            <View style={styles.delete} >
                                                <TouchableOpacity onPress={()=>navigation.navigate('Group', {curGroup:item})} style={styles.viewBut} >
                                                    <Text style={styles.viewText} >{i18n.t('view')}</Text>
                                                </TouchableOpacity>
                                                {
                                                    groupReqLoading && requestUser === item.id ?
                                                    <ActivityIndicator size={'small'} /> :
                                                    <TouchableOpacity onPress={()=>createGroupRequest(item.id)} style={styles.deleteBut} >
                                                        <Text style={styles.viewText} >{i18n.t('RTJ')}</Text>
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                ))
                                
                            }  
                            </View>
                        }
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default People

const styles = StyleSheet.create({
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
    codes:{
        flexDirection:'column',
        // width:'100%',
        // alignItems:'center'
    },
    allCode:{
        width:'100%',
        flexDirection:'row',
        gap:10
    },
    catBox:{
        gap:8,
        // backgroundColor:'yellow',
        flex:1
    },
    allCat:{
        width:'100%',
        flexDirection:'row',
        justifyContent:'center',
        gap:5
        // backgroundColor:'red'
    },
    delete:{
        flexDirection:'row',
        alignSelf:'flex-start',
        gap:10
    },
    deleteBut:{
        backgroundColor:'#6ae2e2',
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
        // width:'95%',
        // backgroundColor:'yellow'
    },
    downName:{
        fontSize:15,
        width:'90%',
    },
    downNam:{
        fontSize:15,
        width:'90%',
        fontWeight:'800'
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
        textAlign:'center',
        color:'antiquewhite',
    },
    pressFilters:{
        backgroundColor:'#4fd6e7',
        borderRadius:5,
        paddingHorizontal:10,
        paddingVertical:5,
        // marginVertical:8,
        // marginRight:5,
        // flex:1,
        alignItems:'center',
        justifyContent:'center',
        maxWidth:120,
    },
    presDep:{
        backgroundColor:'#4343c5',
        borderRadius:5,
        paddingHorizontal:10,
        paddingVertical:5,
        marginVertical:8,
        marginRight:5,
        alignItems:'flex-start',
        justifyContent:'center',
        maxWidth:'90%'
    },
    pressFilter:{
        backgroundColor:'#4343c5',
        borderRadius:5,
        paddingHorizontal:10,
        paddingVertical:5,
        marginVertical:8,
        marginRight:5,
        flex:1,
        alignItems:'center',
        justifyContent:'center',
        maxWidth:120,
    },
    scroll:{
        width:'100%',
        // paddingHorizontal:10,
        // alignItems:'center'
    },
    allDepart:{
        flexDirection:'column',
    },
    allDep:{
        flexDirection:'row',
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
        color:'#cfcfcf',
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
        color:'#fff',
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
        color:'#eeebe7'
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
