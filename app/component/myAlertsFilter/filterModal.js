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
  console.log('FilterModal: ' + imageSrc);
  // console.log('xxxxxxx ' + Math.round(Dimensions.get('window').width * 0.8))
  // console.log('xxxxxxx ' + Math.round(Dimensions.get('window').width * 0.5))
  return (
    <Modal
      animationType={'slide'}
      transparent={true}
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
    backgroundColor: Colors.black,
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
