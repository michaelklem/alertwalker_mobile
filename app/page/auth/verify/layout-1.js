import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/MaterialIcons";

import { MyButton } from '../../../component/myButton';
import { AppText, Colors, Images, Styles } from '../../../constant';
import { ImageButton } from '../../../component/imageButton';
import { VerifySms } from '../../../component/verifySms';


const Layout1 = ({ isLoading,
                  displayComponents,
                  guestAccessAllowed,
                  updateMasterState,
                  segue }) =>
{
  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      colors={['#01173E', '#01173E']}
      style={[Styles.fullScreen]}
    >
      <View style={[styles.headerContainer]}>
        <SafeAreaView>
          <Image
            source={Images.logo4textwhite}
            style={styles.text}
          />
          <ActivityIndicator
            size="large"
            color={Colors.burnoutGreen}
            animating={isLoading}
          />
        </SafeAreaView>
      </View>


      <View style={[{flex: 1}, {justifyContent: 'flex-end'}]}>
        {displayComponents()}
      </View>

    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  text: {
    width: Math.round(Dimensions.get('window').width * 0.4),
    height: Math.round(Dimensions.get('window').height * 0.04),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  headerContainer: {
    backgroundColor: Colors.header.background,
    flexDirection: 'column',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#979797',
  },
});
export default Layout1;
