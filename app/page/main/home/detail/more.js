import React from 'react';
import {
  Animated,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  ScrollView,
} from 'react-native';

import Icon from "react-native-vector-icons/MaterialIcons";

import Colors from '../../../../constant/Colors';
import Styles from '../../../../constant/Styles';
import AppText from '../../../../constant/Text';


const More = ({ detail }) =>
{
  return (
  <View style={[{backgroundColor: Colors.cAccordionRowInactive}, Styles.fullScreen, Styles.contentContainer]}>
    <ScrollView style={Styles.sideMarginsFivePercent}>
      <Text style={[Styles.subjectText, {fontSize: 42}, {height: Math.round(Dimensions.get('window').height * 0.09)}]} adjustsFontSizeToFit={true} numberOfLines={2}>{detail.subject}</Text>
      <Text style={styles.body}>{detail.body}</Text>
    </ScrollView>
  </View>
  );
};

const styles = StyleSheet.create({
  body: {
    marginTop: 20,
    fontSize: 27,
    fontFamily: 'Times New Roman',
    color: Colors.white,
    textAlign: 'left',
  }
});

export default More;
