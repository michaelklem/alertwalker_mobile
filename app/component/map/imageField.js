import React from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { TouchableHighlight } from 'react-native-gesture-handler';
import * as ImagePicker from 'react-native-image-picker';

import { MyButton } from '../myButton';
import { AppText, Colors, DateTime, Images, Styles } from '../../constant';

const ImageField = ({ updateMasterState,
                      showAlert,
                      onPress }) =>
{
  return (
    <View style={styles.container}>
      <MyButton
        buttonStyle={styles.actionBtn}
        titleStyle={styles.text}
        title={'Capture image'}
        icon={{
          name: 'photo-camera',
          size: h16,
          color: Colors.linkBlue
        }}
        onPress={() =>
        {
          onPress();
          ImagePicker.launchCamera(
            {
              mediaType: 'image',
              includeBase64: false,
              storageOptions:
              {
                skipBackup: true,
                path: 'images',
              },
            },
            (response) =>
            {
              if(response.didCancel)
              {
                return;
              }
              if(response.error)
              {
                showAlert('Error', response.error.toString());
                return;
              }
              else
              {
                console.log(response);
                updateMasterState(response);
              }
            },
          )
        }}
      />
      <MyButton
        buttonStyle={styles.actionBtn}
        titleStyle={styles.text}
        title={'Choose existing image'}
        icon={{
          name: 'photo-library',
          size: h22,
          color: Colors.linkBlue
        }}
        onPress={() =>
        {
          onPress();
          ImagePicker.launchImageLibrary(
            {
              mediaType: 'image',
              includeBase64: false,
              storageOptions:
              {
                skipBackup: true,
                path: 'images',
              },
            },
            (response) =>
            {
              if(response.didCancel)
              {
                return;
              }
              if(response.error)
              {
                showAlert('Error', response.error.toString());
                return;
              }
              else
              {
                console.log(response);
                updateMasterState(response);
              }
            },
          )
        }}
      />
    </View>);
}

const h100 = Math.round(Dimensions.get('window').height * 0.1282);
const h50 = Math.round(Dimensions.get('window').height * 0.064);
const h22 = Math.round(Dimensions.get('window').height * 0.0282);
const h20 = Math.round(Dimensions.get('window').height * 0.0256);
const h16 = Math.round(Dimensions.get('window').height * 0.0205);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 0,
    marginTop: h20,
    paddingLeft: 10,
    paddingRight: 10,
  },
  text: {
    height: '100%',
    color: Colors.linkBlue,
    fontSize: h16,
    fontFamily: 'Arial'
  },
  actionBtn: {
    height: h100,
    justifyContent: 'space-between',
    flexDirection: 'row',
  }
});

export default ImageField;
