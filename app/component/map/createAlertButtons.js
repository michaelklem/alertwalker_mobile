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
import {MARKER_DEFAULT_COLOR} from '../../constant/App'

/*
  Component used to merge all 3 buttons into a single row.
  Should split these out to individual components.
*/
const CreateAlertButtons = ({ updateMasterState,
                      showAlert,
                      onPress1, onPress2 }) =>
{
  return (
    <View style={styles.masterViewContainer}>

        {/* Hidden as map will be displayed by default */}
        {false &&
        <View style={styles.container}>
          <TouchableHighlight onPress={onPress1}>
            <View style={styles.button}>
              <Icon
                style={styles.icon}
                name={'place'}
                size={h20}
                color={Colors.black}
              />
              <Text
                style={{fontSize:h10}}
                >
                {'Show Location'}
              </Text>
            </View>
          </TouchableHighlight>
        </View>}



        <View style={styles.container}>
          <TouchableHighlight
            onPress={() =>
            {
              onPress2();
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
                size={h20}
                color={Colors.black}
              />
              <Text
                style={{fontSize:h10}}
                >
                {'Camera'}
              </Text>
            </View>
          </TouchableHighlight>
        </View>




        <View style={styles.container}>
          <TouchableHighlight
            onPress={() =>
            {
              onPress2();
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
                size={h20}
                color={Colors.black}
              />
              <Text
                style={{fontSize:h10}}
                >
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
const h60 = Math.round(Dimensions.get('window').height * 0.070);
const h50 = Math.round(Dimensions.get('window').height * 0.064);
const h22 = Math.round(Dimensions.get('window').height * 0.0282);
const h20 = Math.round(Dimensions.get('window').height * 0.0256);
const h16 = Math.round(Dimensions.get('window').height * 0.0205);
const h10 = Math.round(Dimensions.get('window').height * 0.013);
const h101 = Math.round(Dimensions.get('window').height * 0.01);

const styles = StyleSheet.create({

  masterViewContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft:4,
    paddingRight:4,
    marginBottom:10
  },


  container: {
    height:h60,
    width:'30%',
  },
  button: {
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    padding: 10,
    borderWidth: 1,
    borderColor: '#aaa',

  },
})


export default CreateAlertButtons;
