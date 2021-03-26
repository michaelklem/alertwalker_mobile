import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';

import Styles from '../../constant/Styles';
import Colors from '../../constant/Colors';
import AppJson from '../../../app.json';

const Layout3 = () =>
{
  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      colors={['#FFFFFF', '#FFFFFF']}
      style={[Styles.fullScreen]}
    >
      <View style={styles.centered}>
        <Image
          source={require('../../asset/logo4.png')}
          style={[styles.logo, {marginTop: 'auto'}]}
        />
        <Image
          source={require('../../asset/logo4text.png')}
          style={[styles.text]}
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  centered: {
    marginTop: 'auto',
    marginBottom: 'auto',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logo: {
    width: Math.round(Dimensions.get('window').width * 0.4),
    height: Math.round(Dimensions.get('window').height * 0.23),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  text: {
    width: Math.round(Dimensions.get('window').width * 0.4),
    height: Math.round(Dimensions.get('window').height * 0.04),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  companyTitle: {
    textAlign: 'center',
    fontSize: 76,
    fontWeight: 'bold',
    color: Colors.black,
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
    })
  },
});

export default Layout3;
