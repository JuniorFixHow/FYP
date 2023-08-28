import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Share, A, TouchableOpacitylert } from 'react-native'
import React, { useContext,  } from 'react';
import { FontAwesome5, Ionicons, Entypo, FontAwesome, AntDesign } from '@expo/vector-icons';
import { SettingsContext } from '../components/context/settings/SettingsContext';
import { Colours } from '../../utils/MyColours';
import { AuthContext } from '../components/context/authContext/AuthContext';
import { FetchUsersContext } from '../components/context/fetch/fetchUsersContext';

// shareToWhatsApp = (text) => {
//   Linking.openURL(`whatsapp://send?text=${text}`);
//  }
const More = ({navigation}) => {
  const {sysAlerts} = useContext(FetchUsersContext);

  const {dark, i18n} = useContext(SettingsContext);
  const {user} = useContext(AuthContext);
  const shareOptions = {
    title: 'FindMe',
    message: 'Download FindMe from https://expo.dev/accounts/juniorfixhow/projects/FindMe/builds/b4142724-59f4-4aff-ab21-9eaf64b2fe70',
    // url: 'https://facebook.com',
    subject: 'Share'
  };
  const handleShare = async()=>{
    try {
      await Share.share(shareOptions);
    } catch (err) {
      alert(i18n.t('errFailed'));
    }
  }

  // console.log(sysAlerts)

  return (
    <SafeAreaView style={[styles.main, {backgroundColor: dark? Colours.bacDark:Colours.bacLight }]} >
      <View style={styles.container} >
        <TouchableOpacity onPress={()=>navigation.navigate('Profile', {currentUser:user})} style ={styles.one} >
          <FontAwesome5 name="user-cog" size={24} color={dark? Colours.iconDark : Colours.iconLight} />
          <Text style={[styles.onetext, {color: dark ? Colours.textDark:Colours.textLight}]} >{i18n.t('prof')}</Text>
          <AntDesign style={styles.right}  name="right" size={24} color={Colours.iconDark} />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>navigation.navigate('NewGroup')} style ={styles.one} >
          <FontAwesome name="group" size={24} color={dark? Colours.iconDark : Colours.iconLight} />
          <Text style={[styles.onetext, {color: dark ? Colours.textDark:Colours.textLight}]} >{i18n.t('newG')}</Text>
          <AntDesign style={styles.right}  name="right" size={24} color={Colours.iconDark} />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>navigation.navigate('Noti')} style ={styles.one} >
          <Ionicons name="notifications" size={24} color={dark? Colours.iconDark : Colours.iconLight} />
          <Text style={[styles.onetext, {color: dark ? Colours.textDark:Colours.textLight}]} >{i18n.t('sysAlerts')}</Text>
          <View style={{paddingVertical:2, paddingHorizontal:8, borderRadius:15, backgroundColor:dark? Colours.iconDark: Colours.mainBlue, alignItems:'center', justifyContent:'center'}} >
            <Text style={{color: dark? Colours.subTextLight : '#ecf021', fontWeight:'500'}} >{sysAlerts.filter((noti)=>noti.receiverId === user.id && !noti.read ).length}</Text>
          </View>
          <AntDesign style={styles.right}  name="right" size={24} color={Colours.iconDark} />
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={()=>navigation.navigate('NewGroup')} style ={styles.one} >
          <MaterialIcons name="note-add" size={24} color={dark? Colours.iconDark : Colours.iconLight} />
          <Text style={[styles.onetext, {color: dark ? Colours.textDark:Colours.textLight}]} >Notes</Text>
        </TouchableOpacity> */}
        <TouchableOpacity onPress={()=>navigation.navigate('Settings')} style ={styles.one} >
          <Ionicons name="settings" size={24} color={dark? Colours.iconDark : Colours.iconLight} />
          <Text style={[styles.onetext, {color: dark ? Colours.textDark:Colours.textLight}]} >{i18n.t('set')}</Text>
          <AntDesign style={styles.right}  name="right" size={24} color={Colours.iconDark} />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>navigation.navigate('Terms')} style ={styles.one} >
          <FontAwesome5 name="book-reader" size={24} color={dark? Colours.iconDark : Colours.iconLight} />
          <Text style={[styles.onetext, {color: dark ? Colours.textDark:Colours.textLight}]} >{i18n.t('terms')}</Text>
          <AntDesign style={styles.right}  name="right" size={24} color={Colours.iconDark} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleShare} style ={styles.one} >
          <Ionicons  name="share-social" size={24} color={dark? Colours.iconDark : Colours.iconLight} />
          <Text style={[styles.onetext, {color: dark ? Colours.textDark:Colours.textLight}]} >{i18n.t('share')}</Text>
          <AntDesign style={styles.right}  name="right" size={24} color={Colours.iconDark} />
        </TouchableOpacity>
        <TouchableOpacity onPress={()=>navigation.navigate('Support')} style ={styles.one} >
          <Entypo  name="help-with-circle" size={24} color={dark? Colours.iconDark : Colours.iconLight} />
          <Text style={[styles.onetext, {color: dark ? Colours.textDark:Colours.textLight}]} >{i18n.t('sup')}</Text>
          <AntDesign style={styles.right}  name="right" size={24} color={Colours.iconDark} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default More

const styles = StyleSheet.create({
  right:{
    position:'absolute',
    right:0,
  },
  onetext:{
    fontSize:18
  },
  one:{
    flexDirection:'row',
    gap: 10,
    alignItems:'center',
    width:'100%',
    paddingVertical:8,
    paddingHorizontal:10,
    borderBottomColor:'lightgrey',
    borderBottomWidth:1,
  },
  container:{
    width:'100%',
    paddingHorizontal:20,
    gap:12,
    justifyContent:'center',
    // alignItems:'center'
  },
  main:{
    flex:1,
    width:'100%',
    alignItems:'center',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    flexDirection:'column'
  }
})