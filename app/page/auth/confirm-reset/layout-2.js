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
import { AppText, Colors, Styles } from '../../../constant';
import { ImageButton } from '../../../component/imageButton';


const Layout2 = ({isLoading,
                  displayFormInputs,
                  guestAccessAllowed,
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
            source={require('../../../asset/logo4textwhite.png')}
            style={styles.text}
          />
          <ActivityIndicator
            size="large"
            color={Colors.burnoutGreen}
            animating={isLoading}
          />
        </SafeAreaView>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={Styles.pinnableScrollViewContent}
        extraScrollHeight={150}
      >
        <View style={{justifyContent: 'flex-start'}}>
          <ImageButton
            imgSrc={require('../../../asset/backArrow.png')}
            imageStyle={styles.backBtn}
            onPress={() => segue('login')}
          />
        </View>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Image
            source={require('../../../asset/white-circle-logo.png')}
            style={styles.userPhotoImg}
          />
          <Text style={styles.instructionText}>{AppText.confirmResetPage.layout2.instructionText}</Text>
        </View>
        <View style={[{flex: 0.5}, {justifyContent: 'flex-end'}]}>
          {displayFormInputs()}
        </View>

      </KeyboardAwareScrollView>
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
  container: {
    flex: 1
  },
  inner: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  instructionText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Regular'
      },
      android: {
        fontFamily: 'Roboto-Regular'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: 16,
    marginTop: 30,
    textAlign: 'left',
    opacity: 0.5,
    marginHorizontal: 40,
    lineHeight: 18,
    color: Colors.white,
  },
  headerContainer: {
    backgroundColor: Colors.header.background,
    flexDirection: 'column',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#979797',
  },
  userPhotoImg: {
    width: Math.round(Dimensions.get('window').width * 0.43),
    height: Math.round(Dimensions.get('window').height * 0.2),
    alignSelf: 'center',
    resizeMode: 'contain',
    justifyContent: 'center',
  },
  backBtn: {
    width: Math.round(Dimensions.get('window').width * 0.05),
    height: Math.round(Dimensions.get('window').height * 0.02),
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: 30,
    marginTop: 30,
  },
});
export default Layout2;
