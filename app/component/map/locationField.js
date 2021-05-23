import React, {useEffect} from 'react';
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

import {MARKER_DEFAULT_COLOR} from '../../constant/App'
import {Button} from 'react-native-elements';
import {TouchableOpacity} from 'react-native-gesture-handler';


const LocationField = ({  location,
                          onPress,
                          isShowingLocation }) =>
{

  return (
  <TouchableHighlight
    style={styles.TouchableContainer}
    activeOpacity={0.6}
    onPress={onPress}
    underlayColor={Colors.transparent}
  >
    <View style={styles.viewContainer}>
      <Icon
        style={styles.icon}
        name={'place'}
        size={h16}
        color={MARKER_DEFAULT_COLOR}
      />

      <Text
        style={[styles.commentTextField, {textAlignVertical: 'center'}]}
        underlineColorAndroid='transparent'
      >
        {isShowingLocation ? 'Hide location' : (location ? 'Show location' : 'Show location')}      
      </Text>      

    </View>
  </TouchableHighlight>);
}

const h100 = Math.round(Dimensions.get('window').height * 0.1282);
const h50 = Math.round(Dimensions.get('window').height * 0.064);
const h22 = Math.round(Dimensions.get('window').height * 0.0282);
const h20 = Math.round(Dimensions.get('window').height * 0.0256);
const h16 = Math.round(Dimensions.get('window').height * 0.0205);

const styles = StyleSheet.create({
  TouchableContainer: {
    marginTop:4,
  },
  viewContainer: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    marginBottom: 0,
    justifyContent: 'flex-start',  
  },
  icon: {
    top:2
  },
  commentTextField: {
    height: '100%',
    color: Colors.black,
    fontSize: h16,
    fontFamily: 'Arial'
  },
});

export default LocationField;
