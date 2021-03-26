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

import { MyButton } from '../../../component/myButton';
import { ImageButton } from '../../../component/imageButton';
import { FormInput } from '../../../component/formInput';
import { AppText, Colors, Images, Styles } from '../../../constant';

const Layout3 = ({  isLoading,
                    displayFormInputs,
                    user,
                    customDetails,
                    isEditing,
                    editModeOnChange,
                    openImagePicker,
                    logout
                  }) =>
{
  return (
  <View
    style={[Styles.fullScreen, Styles.contentContainer, styles.container]}
  >
    <ActivityIndicator
      size="large"
      color={Colors.burnoutGreen}
      animating={isLoading}
      style={Styles.loading}
    />

    <Modal
      animationType="slide"
      transparent={true}
      visible={isEditing}
    >
      <View style={[Styles.paper, styles.modalView]}>
        <TouchableOpacity
          onPress={editModeOnChange}
          style={styles.modalCloseBtn}
        >
          <Icon
            name={'close'}
            size={48}
            color={Colors.blue1}
          />
        </TouchableOpacity>
        <KeyboardAwareScrollView>
          <Text style={styles.passwordText}>{AppText.pSettingsPasswordNoteText}</Text>
          {displayFormInputs()}
        </KeyboardAwareScrollView>
      </View>
    </Modal>

    <View style={[Styles.row, {height: '8%'}]}>
      <View />
      <Text style={styles.name} adjustsFontSizeToFit={true}>{user?.firstName ?? '' + ' ' + user?.lastName ?? ''}</Text>
      <TouchableOpacity style={styles.editImg} onPress={editModeOnChange}>
        <Icon
          name={'create'}
          size={26}
          color={Colors.black}
        />
      </TouchableOpacity>
    </View>
    <Text style={styles.email} adjustsFontSizeToFit={true}>{user?.email ?? ''}</Text>

    <View style={styles.userPhotoOutline}>
      <>
        <ImageButton
          imgSrc={user && user.photo ? {uri: user?.photo ?? ''} : Images.noPhoto}
          titleStyle={styles.userPhotoContainer}
          imageStyle={styles.userPhotoImg}
          onPress={openImagePicker}
        />
        <ImageButton
          imgSrc={require('../../../asset/plus.png')}
          titleStyle={styles.plusSignContainer}
          imageStyle={styles.plusSignImg}
          onPress={openImagePicker}
        />
      </>
    </View>

    <MyButton
      onPress={logout}
      title={AppText.pSettingsLogoutText}
      buttonStyle={Styles.authSubmitBtn}
      titleStyle={Styles.authSubmitBtnText}
    />
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.separatorGray,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
  },
  modalCloseBtn: {
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 10,
  },
  modalView: {
    marginTop: '15%',
    height: '75%',
    backgroundColor: Colors.separatorGray,
    marginHorizontal: 10,
  },
  passwordText: {
    marginTop: 20,
    marginBottom: 20,
    color: Colors.black,
    fontSize: 14,
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
    }),
  },
  plusSignContainer: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 100,
    width:  Math.round(Dimensions.get('window').width * 0.084),
    height: Math.round(Dimensions.get('window').height * 0.038),
    alignItems: 'center',
    justifyContent: 'center',
    position:'absolute',
    bottom: 15,
  },
  plusSignImg: {
    width: Math.round(Dimensions.get('window').width * 0.042),
    height: Math.round(Dimensions.get('window').width * 0.042),
    borderRadius: Math.round(Dimensions.get('window').width * 0.042) / 2,
  },
  userPhotoOutline: {
    alignSelf: 'center',
    marginTop: 20,
  },
  userPhotoContainer: {
  },
  userPhotoImg: {
    width: Math.round(Dimensions.get('window').width * 0.33),
    height: Math.round(Dimensions.get('window').width * 0.33),
    borderRadius: Math.round(Dimensions.get('window').width * 0.33) / 2,
    borderWidth: 3,
    borderColor: Colors.cAccordionArrowInactive,
  },
  editImg: {
    height: '100%',
    width: Math.round(Dimensions.get('window').width * 0.0637),
    alignSelf: 'center',
  },
  name: {
    color: Colors.black,
    fontSize: 43,
    textAlign: 'center',
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
  email: {
    color: Colors.black,
    fontSize: 24,
    textAlign: 'center',
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
  }
});

export default Layout3;
