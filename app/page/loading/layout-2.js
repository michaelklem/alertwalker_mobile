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

const Layout2 = ({ showText }) =>
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
          style={[Styles.loadingLogo, {marginTop: 'auto'}]}
        />
        {showText &&
        <Text
          adjustsFontSizeToFit={true}
          numberOfLines={1}
          style={styles.companyTitle}
        >{AppJson.displayName.toUpperCase()}</Text>}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  centered: {
    marginTop: 'auto',
    marginBottom: 'auto'
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

export default Layout2;
