import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react';
import LOGO from '../../assets/logo.png';

const Splash = () => {
  return (
    <View style={styles.main} >
      <Image style={styles.logo} source={LOGO} />
    </View>
  )
}

export default Splash

const styles = StyleSheet.create({
    main:{
        alignItems:'center',
        justifyContent:'center',
        flex:1,
        backgroundColor:'#fff',
    },
    logo:{
        width:60,
        height:60,
        resizeMode:'cover',
        borderRadius:10
    },
})