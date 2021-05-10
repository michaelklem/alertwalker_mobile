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

import Icon from "react-native-vector-icons/MaterialIcons";
import { AppText, Colors, DateTime, Images, Styles } from '../../constant';

const LocationField = ({  location,
                          onPress,
                          showAlert,
                          isShowingLocation }) =>
{
  //console.log(location);
  return (
  <TouchableHighlight
    style={styles.container}
    activeOpacity={0.6}
    onPress={onPress}
    underlayColor={Colors.transparent}
  >
    <View style={styles.container}>
      <Text
        style={[styles.commentTextField, {textAlignVertical: 'center'}]}
        underlineColorAndroid='transparent'
      >{isShowingLocation ? 'Save location' : (location ? 'Change location' : 'Add location')}</Text>
      <Icon
        name={isShowingLocation ? 'save' : 'add-location'}
        size={h16}
        color={Colors.linkBlue}
      />
    </View>
  </TouchableHighlight>);
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
    marginBottom: 0,
    justifyContent: 'flex-start',
  },
  commentTextField: {
    height: '100%',
    paddingLeft: 10,
    color: Colors.linkBlue,
    fontSize: h16,
    fontFamily: 'Arial'
  },
});

export default LocationField;
