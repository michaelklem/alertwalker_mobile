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

import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/MaterialIcons";

import { MyButton } from '../../../component/myButton';
import { AppText, Colors, Images, Styles } from '../../../constant';
import { ImageButton } from '../../../component/imageButton';
import { VerifySms } from '../../../component/verifySms';
import { FormInput } from '../../../component/formInput';

const Layout1 = ({ isLoading,
                  updateGlobalState,
                  user,
                  segue,
                  inviteCodeRequired,
                  updateMasterState,
                  inviteCode,
                  verifyInviteCode }) =>
{
  let welcomeName = '';
  if(user && user.firstName && user.firstName !== '')
  {
    welcomeName = user.firstName;
  }
  else if(welcomeName === '' && user && user.username && user.username !== '')
  {
    welcomeName = user.username;
  }
  else if(welcomeName === '' && user && user.email && user.email !== '')
  {
    welcomeName = user.email;
  }


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

      <KeyboardAwareScrollView contentContainerStyle={Styles.pinnableScrollViewContent}
        extraScrollHeight={25}
      >
        <View style={{justifyContent: 'flex-start'}}>
          <ImageButton
            imgSrc={require('../../../asset/backArrow.png')}
            imageStyle={styles.backBtn}
            onPress={async() =>
            {
              updateGlobalState('user', null);
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              segue('login')
            }}
          />
        </View>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <ImageButton
            imgSrc={user && user.photo ? {uri: user.photo} : Images.noPhoto}
            imageStyle={styles.userPhotoImg}
          />
          <View style={styles.welcomeText}>
            <Text style={styles.instructionText}>{`Welcome `}</Text>
            <Text style={styles.usernameText}>{`${welcomeName}`}</Text>
            <Text style={styles.instructionText}>{`,`}</Text>
          </View>
          <Text style={[styles.instructionText, {marginTop: 10}]}>{`login successful!`}</Text>

          {inviteCodeRequired && <Text style={styles.betaText}>{AppText.welcomePage.beta.text}</Text>}
        </View>

        {inviteCodeRequired &&
        <View style={[{flex: 1}, {justifyContent: 'flex-end'}]}>
          <FormInput
            id={'inviteCode'}
            updateMasterState={(id,val) => updateMasterState({ [id]: val })}
            value={inviteCode}
            textInputStyle={1}
            containerStyle={1}
            label={'Invite code'}
            type={'text'}
            showHelperText={false}
            showLabel={false}
            placeholder={'Invite code'}
          />
          <MyButton
            key={'submitBtn'}
            buttonStyle={styles.buttonStyle1}
            titleStyle={styles.buttonTextStyle1}
            title={'Submit'}
            onPress={verifyInviteCode}
          />
        </View>}
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
};


const styles = StyleSheet.create({
  welcomeText: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    marginHorizontal: 40,
  },
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
  buttonTextStyle1: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: 18,
    textAlign: 'center',
    color: Colors.white,
  },
  instructionText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 18,
    color: Colors.white,
  },
  betaText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 20,
    color: Colors.white,
  },
  usernameText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 18,
    color: Colors.welcomePage.usernameText,
  },
  userPhotoImg: {
    alignSelf: 'center',
    //resizeMode: 'contain',
    justifyContent: 'center',
    width: Math.round(Dimensions.get('window').width * 0.43),
    height: Math.round(Dimensions.get('window').width * 0.43),
    borderRadius: Math.round(Dimensions.get('window').width * 0.43) / 2,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  buttonStyle1: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.loginContainer.emailLoginBtn,
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
export default Layout1;
