import { Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import ALONE from '../../../assets/images/alone.png';
import { Colours } from '../../../utils/MyColours';
import { useContext } from 'react';
import { AuthContext } from '../../components/context/authContext/AuthContext';

const Board = ({navigation}) => {
    const {checkBoarded, boarded} = useContext(AuthContext);
    const handleBoard = ()=>{
        checkBoarded(true);
        navigation.navigate('Verified');
    }

    useEffect(()=>{
        if(boarded){
            navigation.navigate('Verified');
        }
    },[])

  return (
    <SafeAreaView style={styles.main} >
        <StatusBar style='auto' />
        <View style={styles.pretop} >
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />
        </View>
        <ScrollView style={{width:'90%', }}  >

            <View style={styles.container} >
                <View style={styles.top} >
                    <Text style={styles.title} >Feeling lonely in studies?</Text>
                    <Text style={styles.bigtitle} >FindMe is here</Text>
                </View>
                <Image 
                    source={ALONE}
                    style={styles.alonepic}
                />
                <View style={styles.down} >
                    <Text style={styles.explore} >Explore the app</Text>
                    <Text style={styles.text} >
                        FindMe exists to create connections between students across departments in the university. 
                        Students no longer have to feel lonely in studies. The platform will suggest relevant study rooms for you according to 
                        your profile.
                    </Text>
                </View>
                <TouchableOpacity onPress={handleBoard} style={styles.butt} >
                    <Text style={{fontWeight:'600', fontSize:18, color:'#fff'}} >Proceed</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </SafeAreaView>
  )
}

export default Board

const styles = StyleSheet.create({
    butt:{
        backgroundColor:Colours.mainBlue,
        alignItems:'center',
        justifyContent:'center',
        width:'100%',
        paddingVertical:8,
        borderRadius:10,
        marginTop:80,
    },
    text:{
        fontSize:15,
        textAlign:'justify',
        fontWeight:'500',
        color:'#000000b2',
    },
    explore:{
        fontSize:19,
        fontWeight:'600',
        color:Colours.mainBlue
    },
    down:{
        alignItems:'center',
        marginTop:25,
        gap:10,
    },
    bigtitle:{
        fontWeight:700,
        fontSize:20,
        color:Colours.textLight,
    },
    title:{
        fontWeight:'600',
        fontSize:24,
        color:Colours.subTextDark,
        zIndex:324,
    },
    top:{
        // marginTop:-20,
        gap:5,
    },
    alonepic:{
        width:200,
        height:200,
        resizeMode:'cover'
    },
    container:{
        width:'100%',
        alignItems:'center',
        // gap:15,
        // marginTop:10,
    },
    circle3:{
        position:'absolute',
        height:'120%',
        width:'70%',
        backgroundColor:'#d1fcfcce',
        borderBottomLeftRadius:200,
        borderBottomRightRadius:200,
        right:-30,
    },
    circle2:{
        position:'absolute',
        height:'100%',
        width:'70%',
        backgroundColor:'#c7f2f7b4',
        borderBottomLeftRadius:200,
        borderBottomRightRadius:200,
        left:70,
    },
    circle1:{
        position:'absolute',
        height:'100%',
        width:'70%',
        backgroundColor:'#ccf2f398',
        borderBottomLeftRadius:200,
        borderBottomRightRadius:200,
        left:-20,
    },
    pretop:{
        width:'100%',
        flexDirection:'row',
        height:'20%',
    },
    main:{
        alignItems:'center',
        width:'100%',
        flex:1,
        backgroundColor:'#fff',
    },
})