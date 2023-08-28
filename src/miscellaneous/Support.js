import React from 'react'
import { Image, Linking, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons, FontAwesome, Ionicons, MaterialCommunityIcons  } from '@expo/vector-icons';
import { useContext } from 'react';
import { SettingsContext } from '../app/components/context/settings/SettingsContext';
import { Colours } from '../utils/MyColours';
// import CheckBox from 'react-native-check-box'

const Support = ({navigation}) => {
    const {dark, i18n} = useContext(SettingsContext);
    return (
        <SafeAreaView style={[styles.main, {backgroundColor: dark? Colours.bacDark : Colours.bacLight}]} >
            <View style={styles.header} >
                <Pressable onPress={()=>navigation.navigate('More')} style={styles.back} >
                    <Ionicons  name="chevron-back-circle" size={40} color="#b9b7b7" />
                </Pressable>
                <Text style={[styles.editHeader, {color: dark? Colours.titeleDark:Colours.titeleLight}]}>{i18n.t('hands')}</Text>
            </View>
            <ScrollView style={{width:'100%'}} >
                <View style={{width:'100%', alignItems:'center', justifyContent:'center', gap:30}} >

                    <View style={styles.content} >
                        <View style={styles.logoBox} >
                            <Text style={[styles.title, {color:dark? Colours.textDark:Colours.textLight}]} >FindMe</Text>
                            <Image style={styles.logo} source={require('../assets/logo.png')} />
                        </View>
                        <Text style={[styles.text, {color: dark? Colours.textDark:Colours.textLight}]} >{i18n.t('hello')} FindMe {i18n.t('hands')}</Text>
                        <Text style={[styles.text2, {color: dark? Colours.textDark:Colours.textLight}]}>{i18n.t('handsMess')}  </Text>     
                    </View>
                        <View style={styles.content2} >
                            
                            <View style={styles.socials} >
                                <TouchableOpacity onPress={()=>Linking.openURL('whatsapp://send?phone=+541097145')} >
                                    <FontAwesome name="whatsapp" size={40} color="green" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={()=>Platform.OS ==='android'? Linking.openURL('tel: +233257737537'):Linking.openURL('telprompt: +233257737537') }                                
                                >
                                    <FontAwesome name="phone" size={40} color="green" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=>Linking.openURL('mailto:juniorfixhow@gmail.com')} >
                                    <MaterialIcons name="email" size={35} color="#cf4444" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=> Linking.openURL('https://juniorfixhow.netlify.app') } >
                                    <MaterialCommunityIcons name="web" size={40} color="#2d7fe9" />
                                </TouchableOpacity>
                            </View>
                        </View>
                </View>
            </ScrollView>

        </SafeAreaView>
    )
}

export default Support

const styles = StyleSheet.create({
    socials:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        gap:45
    },
    or:{
        fontSize:18,
        color:'antiquewhite',
        marginVertical:10,
        fontWeight:'bold'
    },
    
    text2:{
        textAlign:'justify',
        lineHeight:30,
        fontSize:15,
    },
    text:{
        fontSize:16,
        fontWeight:'600',
        textAlign:'center'
    },
    logo:{
        height:30,
        width:30
    },
    title:{
        fontSize:20,
        fontWeight:'800',
    },
    logoBox:{
        flexDirection:'row',
        gap:10,
        alignItems:'center',
    },
    content2:{
        // paddingVertical:10,
        // paddingHorizontal:15,
        // borderWidth:1,
        // borderColor:'#4aacf3',
        flexDirection:'column',
        gap:10,
        width:'95%',
        alignItems:'center',
        borderRadius:20,
        marginBottom:20
    },
    content:{
        // paddingVertical:10,
        paddingHorizontal:15,
        // borderWidth:1,
        // borderColor:'#4aacf3',
        flexDirection:'column',
        gap:20,
        width:'95%',
        alignItems:'center',
        borderRadius:20,
        // height:'60%'
    },
    editHeader:{
        fontSize:23,
        fontWeight:'bold'
    },
    back:{
        position:'absolute',
        left:0
    },
    header:{
        flexDirection:'row',
        width:'100%',
        alignItems:'center',
        justifyContent:'center',
        position:'relative',
        marginTop:10,
        marginLeft:10
    },
    main:{
        flex:1,
        width:'100%',
        alignItems:'center',
        // justifyContent:'center',
        paddingTop: 10,
        flexDirection:'column',
        gap:50,
    }
})
