import React, {useState} from 'react';
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
import { DataManager, NotificationManager } from '../../manager';
// import { RadioButton } from '../radioButton';
import RadioButtonRN from 'radio-buttons-react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'

const FilterModal = ({ imageSrc,
                      onClose,
                    }) =>
{

  const [alertTypeFilter, setAlertTypeFilter] = useState(-1);

  const geofenceAreaTypes = NotificationManager.GetInstance().getGeofenceAreaTypes();

  let alertTypeOptions = [{label: 'All Alerts'}]
  geofenceAreaTypes.map( (alertType, i) =>
    alertTypeOptions.push({label: alertType.label})
  )
  // this._renderRadioBtn = this._renderRadioBtn.bind(this);

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

  const renderRadioButtons = (
      <RadioButtonRN
        data={alertTypeOptions}
        selectedBtn={(e) => setAlertTypeFilter(e)}  //this.setState({ res: e })}
        activeColor={Colors.alertWalkerOrange}
        icon={
          <FontAwesomeIcon
            icon={ faCheckCircle }
            size={25}
            color={Colors.alertWalkerOrange}
          />
        }
      />
  )
  
  const alertTypes = (
    <View>
      <Text style={styles.filterSectionTitle}>Event Types</Text>
      <Text style={styles.filterSectionTitle}>{alertTypeFilter.label}</Text>


      {/* <RadioButton PROP={alertTypeOptions} /> */}
      {renderRadioButtons}
    </View>
  )

  const modalBody=(
    <ScrollView style={styles.modalBody}>

      <View style={styles.buttonContainer}>
        {alertTypes}
      </View>

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
  buttonContainer: {
  },
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

  },

  filterSectionTitle: {
    fontSize:24,
    fontWeight:'bold',
  },

  filterSelectionName: {
    fontSize:18,
    lineHeight:40,  
  },

});

export default FilterModal;
