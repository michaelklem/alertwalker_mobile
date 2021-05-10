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
import { TouchableOpacity } from 'react-native-gesture-handler';

import Icon from "react-native-vector-icons/MaterialIcons";
import { AppText, Colors, DateTime, Images, Styles } from '../../constant';

const SubmitField = ({  note,
                        submit,
                        updateMasterState,
                        showAlert }) =>
{
  //console.log('SubmitField');
  return (
  <View
    style={styles.container}
  >
    <TextInput
      value={note}
      style={[styles.commentTextField, {textAlignVertical: 'center'}]}
      underlineColorAndroid='transparent'
      onChangeText={(val) => updateMasterState('note', val)}
      placeholder={'Note...'}
      multiline={true}
      numberOfLines={3}
      autoCorrect={true}
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
    height: h100,
    width: '100%',
  },
  commentIcon: {
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  commentTextField: {
    flex: 1,
    height: '100%',
    paddingLeft: 10,
    color: Colors.black,
    fontSize: h20,
    fontFamily: 'Arial'
  },
  text: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: h22,
  },
});

export default SubmitField;
