import { StyleSheet, Text, View, ActivityIndicator, Modal } from "react-native";
import React from "react";

const Waiting = () => {
  return (
    < >
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
         <ActivityIndicator size={'large'} />
     </View>

      {/* <Modal
        animationType="fade"
        transparent={true}
        visible={true}
        onRequestClose={false}
        style={styles.modal}
      >
        <View style={styles.mainmodal} >
            <ActivityIndicator size={'large'} />
        </View>
      </Modal> */}
    </>
  );
};

export default Waiting;

const styles = StyleSheet.create({
    mainmodal:{
        position:'absolute',
        width:'80%',
        height:'15%',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#8b8888aa',
        top:'30%',
        alignSelf:'center',
        borderRadius:10
    },

  
});
