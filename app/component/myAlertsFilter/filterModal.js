import React from 'react';
import {
  Dimensions,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  View,
  Image
} from 'react-native';

import { Colors, Images } from '../../constant';
import { ImageButton } from '../imageButton';

const FilterModal = ({ imageSrc,
                      onClose,
                    }) =>
{

  const modalHeader=(
      <View style={styles.modalHeader}>
        <TouchableOpacity
          onPress={onClose}>
          <Text style={styles.title}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Filters</Text>
  
        <TouchableOpacity 
          onPress={onClose}>
          <Text style={styles.title}>Reset</Text>
        </TouchableOpacity>
      </View>
  )

  const modalBody=(
    <ScrollView style={styles.modalBody}>
      <Text style={styles.bodyText}>Are you sure you want to delete your account ?</Text>
    </ScrollView>
  )

  const modalFooter=(
    <View style={styles.modalFooter}>
      <View style={styles.modalFooterContainer}>
        <TouchableOpacity style={styles.applyButton} 
          onPress={onClose}>
          <Text style={styles.actionText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const modalContainer=(
    <View style={styles.modalContainer}>
      {modalHeader}
      {modalBody}
      {modalFooter}
    </View>
  )

 const modal = (
    <Modal
      animationType={'slide'}
      transparent={false}
      visible={true}
      onRequestClose={() => {
      }}>
      <View style={styles.modal}>
        {modalContainer}
      </View>
    </Modal>
  )

  return (
    <View style={styles.container}>
      
      {modal}

    </View>  )
};

const sideMargins = Math.round(Dimensions.get('window').width * 0.044);

const styles = StyleSheet.create({
  safeAreaContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: '#ccc',
    opacity: 0.98,
  },
  contentContainer: {
    marginTop: sideMargins,
    flexDirection: 'column',
    flex: 1,
  },


  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal:{
    backgroundColor:"#ccc",
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer:{
    backgroundColor:'#ccc',
    width:"100%",
    height: '100%',
    borderRadius:5
  },
  modalHeader:{
    flexDirection:'row',
    justifyContent:'space-around',
    borderColor:'#333',
    borderBottomWidth:1
  },
  title:{
    fontSize:20,
    padding:10,
    color:"#000",
  },  
  headerTitle:{
    fontWeight:"bold",
    fontSize:20,
    padding:10,
    color:"#000",
  },
  divider:{
    width:"100%",
    height:1,
    backgroundColor:"#333"
  },
  modalBody:{
    width:"100%",
    backgroundColor:"#fff",
    paddingVertical:20,
    paddingHorizontal:10
  },
  modalFooter:{
    borderColor:'#333',
    borderTopWidth:1,
  },
  modalFooterContainer: {
    width:'100%',
    marginTop:4,
    marginBottom:4,
    marginLeft:0,
    marginRight:0,
  },

  applyButton: {
    backgroundColor: Colors.alertWalkerOrange,
    marginLeft:10,
    marginRight:10,
    borderRadius:4,
 },

  actions:{
    borderRadius:5,
    marginHorizontal:10,
    paddingVertical:10,
    paddingHorizontal:20
  },
  actionText:{
    color:"#fff",
    fontWeight:'bold',
    fontSize:20,
    alignSelf:'center',
    textAlignVertical:'center',
    height:50,

  }
});

export default FilterModal;
