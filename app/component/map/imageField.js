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
import Icon from "react-native-vector-icons/MaterialIcons";

import { MyButton } from '../myButton';
import { AppText, Colors, DateTime, Images, Styles } from '../../constant';

const ImageField = ({ updateMasterState,
                      showAlert,
                      onPress }) =>
{
  return (
    <View style={styles.masterViewContainer}>

    <View style={styles.container}>
      <TouchableHighlight onPress={onPress}>
        <View style={styles.button}>
          <Icon
            style={styles.icon}
            name={'place'}
            size={h16}
            color={Colors.black}
          />
          <Text>
            {'Show Location'}      
          </Text>
        </View>
      </TouchableHighlight>
    </View>



        <View style={styles.container}>
          <TouchableHighlight 
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
            >
            <View style={styles.button}>
              <Icon
                style={styles.icon}
                name={'photo-camera'}
                size={h16}
                color={Colors.black}
              />
              <Text>
                {'Camera'}      
              </Text>
            </View>
          </TouchableHighlight>
        </View>




        <View style={styles.container}>
          <TouchableHighlight 
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

            >
            <View style={styles.button}>
              <Icon
                style={styles.icon}
                name={'photo-library'}
                size={h16}
                color={Colors.black}
              />
              <Text>
                {'Photo Library'}      
              </Text>
            </View>
          </TouchableHighlight>
        </View>




    </View>

  )

}


const h100 = Math.round(Dimensions.get('window').height * 0.1282);
const h64 = Math.round(Dimensions.get('window').height * 0.075);
const h50 = Math.round(Dimensions.get('window').height * 0.064);
const h22 = Math.round(Dimensions.get('window').height * 0.0282);
const h20 = Math.round(Dimensions.get('window').height * 0.0256);
const h16 = Math.round(Dimensions.get('window').height * 0.0205);

const styles = StyleSheet.create({

  masterViewContainer: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 0,
    marginTop: h20,
    paddingLeft:4,
    paddingRight:4
  },


  container: {
    height:h64,
    width:'30%',
    padding:2
  },
  button: {
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 10,

  },
})


export default ImageField;
