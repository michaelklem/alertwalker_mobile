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
                      showAlert }) =>
{
  return (
    <View style={styles.container}>
      <MyButton
        buttonStyle={styles.actionBtn}
        titleStyle={styles.actionBtnText}
        title={'Capture image'}
        onPress={() =>
        {
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
                this.props.showAlert('Error', response.error.toString());
                return;
              }
              else
              {
                console.log(response);
                const tempReview = {...this.state.review};
                tempReview.file = response;
                this.setState({ review: tempReview });
              }
            },
          )
        }}
      />
      <MyButton
        buttonStyle={styles.actionBtn}
        titleStyle={styles.actionBtnText}
        title={'Choose existing image'}
        onPress={() =>
        {
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
                this.props.showAlert('Error', response.error.toString());
                return;
              }
              else
              {
                console.log(response);
                const tempReview = {...this.state.review};
                tempReview.file = response;
                this.setState({ review: tempReview });
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    marginBottom: 0,
    justifyContent: 'flex-start',
    marginTop: h20,
    paddingLeft: 10,
  },
  commentTextField: {
    height: '100%',
    paddingLeft: 10,
    color: Colors.linkBlue,
    fontSize: h20,
    fontFamily: 'Arial'
  },
  text: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: h22,
  },
});

export default ImageField;
