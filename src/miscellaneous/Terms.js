import React from 'react'
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import {Ionicons  } from '@expo/vector-icons';
import { useContext } from 'react';
import { SettingsContext } from '../app/components/context/settings/SettingsContext';
import { Colours } from '../utils/MyColours';

const Terms = ({navigation}) => {
    const {dark, i18n} = useContext(SettingsContext);
    return (
        <SafeAreaView style={[styles.main, {backgroundColor: dark? Colours.bacDark : Colours.bacLight}]} >
            <View style={styles.header} >
                <Pressable onPress={()=>navigation.navigate('More')} style={styles.back} >
                    <Ionicons  name="chevron-back-circle" size={40} color="#b9b7b7" />
                </Pressable>
                <Text style={[styles.editHeader, {color: dark? Colours.titeleDark:Colours.titeleLight}]}>{i18n.t('terms')}</Text>
            </View>
            <View style={[styles.content, {borderColor: dark? Colours.mainBlue:Colours.lineDark}]} >
                <View style={styles.logoBox} >
                    <Text style={[styles.title, {color: dark? Colours.textDark:Colours.textLight}]} >FindMe</Text>
                    <Image style={styles.logo} source={require('../assets/logo.png')} />
                </View>
                <ScrollView >
                <Text style={[styles.text, {color: dark?Colours.textDark:Colours.textLight}]} >1. {i18n.t('aot')}</Text>

                <Text style={[styles.text2, {color: dark?Colours.textDark:Colours.textLight}]}>{i18n.t('aotMess')}</Text>

                <Text style={[styles.text, {color: dark?Colours.textDark:Colours.textLight}]} >2. {i18n.t('license')}</Text>

                <Text style={[styles.text2, {color: dark?Colours.textDark:Colours.textLight}]} >{i18n.t('licMess')}</Text>

                <Text style={[styles.text, {color: dark?Colours.textDark:Colours.textLight}]} >3. {i18n.t('own')}</Text>

                <Text style={[styles.text2, {color: dark?Colours.textDark:Colours.textLight}]} >{i18n.t('ownMess')}</Text>

                <Text style={[styles.text, {color: dark?Colours.textDark:Colours.textLight}]}>4. {i18n.t('termination')}</Text>

                <Text style={[styles.text2, {color: dark?Colours.textDark:Colours.textLight}]} >{i18n.t('termMess')}</Text>

                <Text style={[styles.text, {color: dark?Colours.textDark:Colours.textLight}]}>5. {i18n.t('disc')}</Text>

                <Text style={[styles.text2, {color: dark?Colours.textDark:Colours.textLight}]} >{i18n.t('discMess')}</Text>

                <Text style={[styles.text, {color: dark?Colours.textDark:Colours.textLight}]} >6. {i18n.t('limited')}</Text>

                <Text style={[styles.text2, {color: dark?Colours.textDark:Colours.textLight}]} >{i18n.t('limMess')}</Text>

                <Text style={[styles.text, {color: dark?Colours.textDark:Colours.textLight}]} >7. {i18n.t('gov')}</Text>
                <Text style={[styles.text2, {color: dark?Colours.textDark:Colours.textLight}]} >{i18n.t('govMess')}</Text>

                <Text style={[styles.text, {color: dark?Colours.textDark:Colours.textLight}]} >8. {i18n.t('sever')} </Text>
                <Text style={[styles.text2, {color: dark?Colours.textDark:Colours.textLight}]} >{i18n.t('severMess')}</Text>

                <Text style={[styles.text, {color: dark?Colours.textDark:Colours.textLight}]}>9. {i18n.t('entAgree')} </Text>
                <Text style={[styles.text2, {color: dark?Colours.textDark:Colours.textLight}]} >{i18n.t('agreeMess')}</Text>
                    
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default Terms

const styles = StyleSheet.create({
    text2:{
        marginTop:10,
        textAlign:'justify',
        lineHeight:30,
        fontSize:15,
    },
    text:{
        marginTop:10,
        fontSize:16,
        fontWeight:'600',
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
    content:{
        paddingVertical:10,
        paddingHorizontal:15,
        borderWidth:1,
        flexDirection:'column',
        gap:20,
        width:'95%',
        alignItems:'center',
        borderRadius:20,
        height:'60%'
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
