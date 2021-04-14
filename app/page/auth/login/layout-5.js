import React, { useState } from 'react';
import {
  Linking,
  StyleSheet,
  View,
  Text,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Image
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/MaterialIcons";

import { AppManager } from '../../../manager';
import { MyButton } from '../../../component/myButton';
import { ImageButton } from '../../../component/imageButton';
import {AppText, Colors, Styles} from '../../../constant';

const Layout5 = ({isLoading,
                  displayFormInputs,
                  guestAccessAllowed,
                  segue,
                  components,
                  getLoginContainerPropValue,
                  updateFormInput }) =>
{
  const isEmailMethodActive = (getLoginContainerPropValue('source') === 'email');
  console.log('Email method is active: ' + isEmailMethodActive);

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      colors={[Colors.white, Colors.white]}
      style={[Styles.fullScreen]}
    >

      {isLoading &&
      <ActivityIndicator
        size="large"
        color={Colors.burnoutGreen}
        animating={isLoading}
      />}

      <KeyboardAwareScrollView contentContainerStyle={Styles.pinnableScrollViewContent}
        extraScrollHeight={50}
      >
        {isEmailMethodActive &&
        <SafeAreaView>
          <View style={{justifyContent: 'flex-start'}}>
            <ImageButton
              imgSrc={require('../../../asset/backArrow.png')}
              imageStyle={styles.backBtn}
              onPress={() => segue('register')}
            />
          </View>
        </SafeAreaView>}

        <View style={{flex: 1, justifyContent: 'center'}}>
          <Image
            source={require('../../../asset/alertwalkerlogo-circle.png')}
            style={styles.userPhotoImg}
          />
        </View>
        <View style={[{flex: 1}, {justifyContent: 'flex-end'}]}>
          {displayFormInputs()}
        </View>

      </KeyboardAwareScrollView>

    </LinearGradient>
  );
};


const font9 = Math.round(Dimensions.get('window').height * 0.01153);
const h20 = Math.round(Dimensions.get('window').height * 0.0256);

const styles = StyleSheet.create({
  text: {
    width: Math.round(Dimensions.get('window').width * 0.4),
    height: Math.round(Dimensions.get('window').height * 0.04),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  logoText: {
    fontFamily: 'Arial',
    textAlign: 'center',
    color: Colors.lightBlue2,
    fontSize: h20,
  },
  userPhotoImg: {
    width: Math.round(Dimensions.get('window').width * 0.43),
    height: Math.round(Dimensions.get('window').height * 0.2),
    borderRadius: Math.round(Dimensions.get('window').width * 0.43) / 2,
    alignSelf: 'center',
    justifyContent: 'center',
    resizeMode: 'contain',
  },
  backBtn: {
    width: Math.round(Dimensions.get('window').width * 0.05),
    height: Math.round(Dimensions.get('window').height * 0.02),
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: 30,
    marginTop: 30,
    tintColor: Colors.black,
  },
  headerContainer: {
    backgroundColor: Colors.header.layout4.background,
    flexDirection: 'column',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#979797',
  },
});
export default Layout5;
