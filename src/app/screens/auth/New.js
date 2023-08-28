import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native'
import React, { useContext, useEffect } from 'react'
import { AuthContext } from '../../components/context/authContext/AuthContext';
import Group from '../../../assets/images/groupA.png';
import { Colours } from '../../../utils/MyColours';
import AsyncStorage from '@react-native-async-storage/async-storage';

const New = ({navigation}) => {
    const {phoneLogin, isNewUser, hasSetImage, setIsNewUser, user} = useContext(AuthContext);

    useEffect(()=>{
        if(!isNewUser && hasSetImage){
            navigation.replace('Tab');
            // console.log('news ', !isNewUser && hasSetImage)
        }
        else if(!hasSetImage){
            navigation.navigate('SignupTwo');
            // console.log('image ', !hasSetImage)
        }
    },[])
    //The person is not a new user so he'll definitely login. Check these two useEffects
    // useEffect(()=>{
    //     if(!hasSetImage){
    //         navigation.navigate('SignupTwo');
    //     }
    // },[])
    // console.log(phoneLogin);

    const handleLater = () =>{
        setIsNewUser(false);
        AsyncStorage.setItem('newuser', JSON.stringify(false));
        navigation.replace('Tab');
    }
    const handleProfile = () =>{
        setIsNewUser(false);
        AsyncStorage.setItem('newuser', JSON.stringify(false));
        navigation.replace('Profile', {currentUser:user, newProfile:true});
    }

  return (
    <ScrollView contentContainerStyle={{width:'100%', backgroundColor:'#fff', flex:1}} >
        <SafeAreaView style={styles.container} >
        <View style={styles.top}>
            <Text style={styles.header} >Configure Profile</Text>
        </View>
        <View style={styles.down} >
            <Text style={styles.greet} >Wow! You appear to be a new student here</Text>
            <Text style={styles.inform} >Share more with us</Text>
            <View style={styles.downtop} >
                <View style={styles.content} >
                    <Image style={styles.img} source={Group} />
                    <Text style={styles.msg} >Sharing more with us helps us locate appropriate studymates for you. The more open you are, the more people recognize you.</Text>
                    <TouchableOpacity onPress={handleProfile} style={styles.prof} >
                        <Text style={styles.visit} >Visit Profile</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={handleLater} style={styles.later} >
                    <Text style={styles.laterText} >Do this later</Text>
                </TouchableOpacity>
                
            </View>
        </View>
        </SafeAreaView>
    </ScrollView>
  )
}

export default New

const styles = StyleSheet.create({
    laterText:{
        fontSize:16,
        color:Colours.mainBlue,
        fontWeight:'600',
    },
    later:{
        paddingVertical:2,
        paddingHorizontal:20,
        alignSelf:'flex-end',
        // marginTop:20,
        // backgroundColor:'yellow'
    },
    visit:{
        fontWeight:'700',
        color:'#fff',
        fontSize:16,
    },
    prof:{
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        paddingVertical:8,
        backgroundColor:Colours.mainBlue,
        borderRadius:5,
    },
    msg:{
        fontSize:15,
        textAlign:'justify',
        color:'#747272',
    },
    img:{
        height:250,
        // width:200,
        width:'100%',
        resizeMode:'cover'
    },
    content:{

        gap: 10,
        width:'100%',
        alignItems:'center'
    },
    downtop:{
        gap: 60,
        width:'100%',
        alignItems:'center'
    },
    inform:{
        fontSize:18,
        fontWeight:'600',
        color:'#747272',
    },
    greet:{
        fontSize:20,
        fontWeight:'800',
        // color:'#0f0f69',
        color:Colours.titeleLight,
        alignSelf:'flex-start'
        // textAlign:'center'
    },
    down:{
        flexDirection:'column',
        width:'90%',
        alignItems:'center',
        gap:15
    },
    header:{
        fontWeight:'bold',
        fontSize:22,
        color:Colours.subTextDark
    },
    top:{
        marginTop:20,
        alignItems:'flex-start',
        width:'90%',
        // height:'90%'
    },
    container:{
        flex:1,
        backgroundColor:'#fff',
        flexDirection:'column',
        alignItems:'center',
        width:'100%',
        // height:height,
        gap:20
    }
})