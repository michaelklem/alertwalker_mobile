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
        <Text style={styles.title}>Delete Your Account</Text>
        <View style={styles.divider}></View>
      </View>
  )

  const modalBody=(
    <View style={styles.modalBody}>
      <Text style={styles.bodyText}>Are you sure you want to delete your account ?</Text>
    </View>
  )

  const modalFooter=(
    <View style={styles.modalFooter}>
      <View style={styles.divider}></View>
      <View style={{flexDirection:"row-reverse",margin:10}}>
        <TouchableOpacity style={{...styles.actions,backgroundColor:"#db2828"}} 
          onPress={() => {
            setModalVisible(!modalVisible);
          }}>
          <Text style={styles.actionText}>No</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{...styles.actions,backgroundColor:"#21ba45"}}>
          <Text style={styles.actionText}>Yes</Text>
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
  return (
    <Modal
      animationType={'slide'}
      transparent={true}
      presentationStyle={"overFullScreen"}
      visible={true}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.contentContainer}>
          <View style={[styles.titleRow]}>
            <ImageButton
              titleStyle={styles.closeBtn}
              imgSrc={Images.close}
              onPress={onClose}
            />
          </View>
          <View style={styles.bottomBorder} />
          <Image
            style={styles.image}
            source={{uri: imageSrc, cache: 'force-cache'}}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const height18 = Math.round(Dimensions.get('window').height * 0.0230769);
const height14 = Math.round(Dimensions.get('window').height * 0.01794);

const sideMargins = Math.round(Dimensions.get('window').width * 0.044);
const styles = StyleSheet.create({
  container: {
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
  closeBtn: {
    width: Math.round(Dimensions.get('window').width * 0.1),
    height: Math.round(Dimensions.get('window').width * 0.1),
    marginRight: sideMargins,
    resizeMode: 'contain',
    alignSelf: 'baseline',
  },
  row: {
    flexDirection: 'row',
    width: '100%'
  },
  titleRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: Math.round(Dimensions.get('window').height * 0.098),
  },
  entry: {
    height: Math.round(Dimensions.get('window').height * 0.098),
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  title: {
    fontFamily: 'Arial',
    fontSize: height14,
    textAlign: 'left',
    color: Colors.white,
    marginLeft: sideMargins,
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.white,
    width: '100%',
    opacity: 0.2,
  },
  image: {
    width: Math.round(Dimensions.get('window').width * 0.8),
    height: Math.round(Dimensions.get('window').height * 0.5),
    overflow: 'visible',
    resizeMode: 'cover',
    marginLeft: '10%',
    backgroundColor: Colors.white,
  },
});

export default FilterModal;
