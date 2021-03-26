import React from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from "react-native-vector-icons/MaterialIcons";
import { AppText, Colors, DateTime, Images, Styles } from '../../constant';

const RadiusField = ({  radius,
                        updateMasterState }) =>
{
  return (
  <View
    style={styles.container}
  >
    <View style={{flex: 0.1}} />

    <View style={{flex: 0.25}}>
      <TouchableOpacity
        onPress={() =>
        {
          console.log('Radius field');
          updateMasterState('radius', (radius - 100));
        }}
        style={styles.commentIcon}
      >
        <Icon
          name={'remove'}
          size={Math.round(Dimensions.get('window').height * 0.07)}
          color={Colors.descriptionGray}
        />
      </TouchableOpacity>
    </View>

    <View style={{flex: 0.3, alignItems: 'center', justifyContent: 'center'}}>
      <Text
        style={styles.labelText}
        adjustsFontSizeToFit={true}
      >{'Radius'}</Text>
    </View>

    <View style={{flex: 0.25}}>
      <TouchableOpacity
        onPress={() =>
        {
          updateMasterState('radius', (radius + 100));
        }}
        style={styles.commentIcon}
      >
        <Icon
          name={'add'}
          size={Math.round(Dimensions.get('window').height * 0.07)}
          color={Colors.descriptionGray}
        />
      </TouchableOpacity>
    </View>

    <View style={{flex: 0.1}} />
  </View>);
}

const font18 = Math.round(Dimensions.get('window').height * 0.02307);
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    marginBottom: 0,
    height: Math.round(Dimensions.get('window').height * 0.1),
    borderColor: Colors.plainGray5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentIcon: {
    height: '100%',
    justifyContent: 'center',
    resizeMode: 'contain',
    alignSelf: 'center'
  },
  commentTextField: {
    flex: 0.85,
    paddingLeft: 10,
    color: Colors.cAccordionArrowInactive,
    fontSize: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
  },
  labelText: {
    fontFamily: 'Arial',
    fontSize: font18,
    textAlign: 'center',
    color: Colors.plainGray5,
  },
});

export default RadiusField;
