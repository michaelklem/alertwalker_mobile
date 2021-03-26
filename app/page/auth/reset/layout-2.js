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
          <Text
            style={styles.instructionText}
            adjustsFontSizeToFit={true}
          >{AppText.resetPage.layout2.instructionText}</Text>
        </View>
        <View style={[{flex: 0.5}, {justifyContent: 'flex-end'}]}>
          {displayFormInputs()}
        </View>

      </KeyboardAwareScrollView>
    </LinearGradient>
  );
};

const font18 = Math.round(Dimensions.get('window').height * 0.02307);
const font16 = Math.round(Dimensions.get('window').height * 0.02051);
const height30 = Math.round(Dimensions.get('window').height * 0.03846);
const width30 = Math.round(Dimensions.get('window').width * 0.08);
const width40 = Math.round(Dimensions.get('window').width * 0.106);

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
    fontSize: font16,
    marginTop: height30,
    textAlign: 'left',
    opacity: 0.5,
    marginHorizontal: width40,
    lineHeight: font18,
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
    marginLeft: width30,
    marginTop: height30,
  },
});
export default Layout2;
