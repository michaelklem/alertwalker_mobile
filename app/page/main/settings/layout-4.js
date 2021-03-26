import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  Text,
  StatusBar,
  Alert,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Circle } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient'
import Icon from "react-native-vector-icons/MaterialIcons";
import { WebView } from 'react-native-webview';

import { MyButton } from '../../../component/myButton';
import { ImageButton } from '../../../component/imageButton';
import { GoogleCalendarButton, MicrosoftCalendarButton, MobileCalendarButton } from '../../../component/calendarButton';
import { FormInput } from '../../../component/formInput';
import { SubscriptionPayModal } from '../../../component/pay';
import { AppText, Colors, Images, Styles } from '../../../constant';

const Layout4 = ({  isLoading,
                    displayFormInputs,
                    user,
                    customDetails,
                    isEditing,
                    editModeOnChange,
                    openImagePicker,
                    saveDetails,
                    logout,
                    showAlert,
                    updateMasterState,
                    isPaying,
                    isUpgraded,
                    iapSubscription,
                  }) =>
{
  return (
  <KeyboardAwareScrollView
    style={[styles.container]}
  >
    <ActivityIndicator
      size="large"
      color={Colors.burnoutGreen}
      animating={isLoading}
      style={Styles.loading}
    />

    {isPaying &&
    <SubscriptionPayModal
      close={() => updateMasterState({ isPaying: false })}
      isOpen={true}
      iapSubscription={iapSubscription}
    />}

    <TouchableOpacity
      onPress={() => saveDetails()}
      style={{justifyContent: 'flex-start'}}
    >
      <ImageButton
        imgSrc={Images.backArrow}
        imageStyle={styles.backBtn}
        onPress={() => saveDetails()}
      />
      <Text
        adjustsFontSizeToFit={true}
        style={styles.backText}>{AppText.settingsPage.layout4.backText}</Text>
    </TouchableOpacity>

    <View style={styles.userPhotoOutline}>
      <>
        <ImageButton
          imgSrc={user && user.photo ? {uri: user?.photo ?? ''} : Images.noPhoto}
          titleStyle={styles.userPhotoContainer}
          imageStyle={styles.userPhotoImg}
          onPress={openImagePicker}
        />
        <ImageButton
          imgSrc={require('../../../asset/plus2.png')}
          titleStyle={styles.plusSignContainer}
          imageStyle={styles.plusSignImg}
          onPress={openImagePicker}
        />
      </>
    </View>
    <Text style={styles.photoText}>{AppText.settingsPage.layout4.photoText}</Text>

    <View style={styles.bottomContentContainer}>
      <MyButton
        buttonStyle={styles.upgradeBtn}
        titleStyle={styles.upgradeBtnText}
        title={isUpgraded ? AppText.settingsPage.layout4.isUpgraded.text : AppText.settingsPage.layout4.upgradeText}
        onPress={async() =>
        {
          if(!isUpgraded)
          {
            updateMasterState({ isPaying: true });
          }
        }}
      />
      {displayFormInputs()}
      <GoogleCalendarButton
        isLinked={customDetails && customDetails.googleToken !== null}
        showAlert={showAlert}
        updateMasterState={updateMasterState}
      />
      <MicrosoftCalendarButton
        isLinked={customDetails && customDetails.microsoftToken !== null}
        showAlert={showAlert}
        updateMasterState={updateMasterState}
      />
      <MobileCalendarButton
        showAlert={showAlert}
        updateMasterState={updateMasterState}
      />
    </View>
  </KeyboardAwareScrollView>
  );
};

const height5 = Math.round(Dimensions.get('window').height * 0.00641);
const height11 = Math.round(Dimensions.get('window').height * 0.0141);
const height15 = Math.round(Dimensions.get('window').height * 0.01923);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height20 = Math.round(Dimensions.get('window').height * 0.0256);
const height30 = Math.round(Dimensions.get('window').height * 0.0384);
const width16 = Math.round(Dimensions.get('window').width * 0.04266);
const width30 = Math.round(Dimensions.get('window').width * 0.08);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkBlue2,
    marginTop: Math.round(Dimensions.get('window').height * 0.035),
    width: '100%',
    height: '100%',
  },
  plusSignContainer: {
    backgroundColor: Colors.white,
    borderRadius: 100,
    width:  Math.round(Dimensions.get('window').width * 0.084),
    height: Math.round(Dimensions.get('window').height * 0.038),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.darkBlue2,
    borderWidth: 1,
    position:'absolute',
    bottom: height15 * -1,
    left: Math.round(Dimensions.get('window').width * 0.125),
  },
  plusSignImg: {
    width: Math.round(Dimensions.get('window').width * 0.042),
    height: Math.round(Dimensions.get('window').width * 0.042),
    borderRadius: Math.round(Dimensions.get('window').width * 0.042) / 2,
  },
  userPhotoOutline: {
    alignSelf: 'center',
  },
  userPhotoContainer: {
  },
  userPhotoImg: {
    width: Math.round(Dimensions.get('window').width * 0.33),
    height: Math.round(Dimensions.get('window').width * 0.33),
    borderRadius: Math.round(Dimensions.get('window').width * 0.33) / 2,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  editImg: {
    height: '100%',
    width: Math.round(Dimensions.get('window').width * 0.0637),
    alignSelf: 'center',
  },
  backBtn: {
    width: Math.round(Dimensions.get('window').width * 0.05),
    height: Math.round(Dimensions.get('window').height * 0.02),
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: width30,
    marginTop: height30,
    resizeMode: 'contain',
  },
  backText: {
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
    fontSize: height11,
    textAlign: 'left',
    color: Colors.white,
    marginTop: height5,
    marginLeft: width30,
  },
  photoText: {
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
    fontSize: height18,
    textAlign: 'center',
    color: Colors.white,
    marginTop: height20
  },

  bottomContentContainer: {
    marginTop: height20 * 2,
  },
  upgradeBtn: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    width: '100%',
    backgroundColor: Colors.header.background,
    justifyContent: 'center',
  },
  upgradeBtnText: {
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
    fontSize: height18,
    textAlign: 'left',
    marginLeft: width16,
    color: Colors.orange1,
  },
});

export default Layout4;
