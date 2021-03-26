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
import { TosModal } from '../../../component/tos';
import {AppText, Colors, Styles} from '../../../constant';

const Layout4 = ({isLoading,
                  displayFormInputs,
                  guestAccessAllowed,
                  segue,
                  components,
                  getLoginContainerPropValue,
                  updateFormInput }) =>
{
  const [tosModalVisible, setTosModalVisible] = useState(false);
  const isEmailMethodActive = (getLoginContainerPropValue('source') === 'email');
  console.log('Email method is active: ' + isEmailMethodActive);

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
        extraScrollHeight={50}
      >
        {isEmailMethodActive &&
        <View style={{justifyContent: 'flex-start'}}>
          <ImageButton
            imgSrc={require('../../../asset/backArrow.png')}
            imageStyle={styles.backBtn}
            onPress={() => updateFormInput('source', '')}
          />
        </View>}
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Image
            source={require('../../../asset/white-circle-logo.png')}
            style={styles.userPhotoImg}
          />
        </View>
        <SafeAreaView style={[{flex: 1}, {justifyContent: 'flex-end'}]}>
          {displayFormInputs()}
        </SafeAreaView>
        <View style={[Styles.pinToBottom]}>
          <MyButton
            buttonStyle={styles.termsBtn}
            titleStyle={styles.termsBtnText}
            title={AppText.loginPage.layout4.termsText}
            onPress={async() =>
            {
              setTosModalVisible(true);
            }}
          />
        </View>

        <TosModal
          bottomBtnText={AppText.tosModal.bottomBtn.text}
          close={() =>
          {
            setTosModalVisible(false);
          }}
          visible={tosModalVisible}
        />

      </KeyboardAwareScrollView>

    </LinearGradient>
  );
};


const font9 = Math.round(Dimensions.get('window').height * 0.01153);

const styles = StyleSheet.create({
  text: {
    width: Math.round(Dimensions.get('window').width * 0.4),
    height: Math.round(Dimensions.get('window').height * 0.04),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  termsBtn: {
    height: Math.round(Dimensions.get('window').height * 0.04),
    backgroundColor: Colors.terms.background,
    justifyContent: 'center',
  },
  termsBtnText: {
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
    fontSize: font9,
    textAlign: 'center',
    color: Colors.white,
  },
  userPhotoImg: {
    width: Math.round(Dimensions.get('window').width * 0.43),
    height: Math.round(Dimensions.get('window').height * 0.2),
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
  },
  headerContainer: {
    backgroundColor: Colors.header.background,
    flexDirection: 'column',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#979797',
  },
});
export default Layout4;
