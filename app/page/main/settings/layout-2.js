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
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import { Circle } from 'react-native-svg';
import Icon from "react-native-vector-icons/MaterialIcons";


import { MyButton } from '../../../component/myButton';
import { ImageButton } from '../../../component/imageButton';
import { FormInput } from '../../../component/formInput';
import { AppText, Colors, Images, Styles } from '../../../constant';

const Layout2 = ({  isLoading,
                    displayFormInputs,
                    user,
                    customDetails,
                    isEditing,
                    editModeOnChange,
                    openImagePicker,
                    logout
                  }) =>
{
  const winPercent = customDetails !== null ? (customDetails.wins > 0 ? ((customDetails.total / customDetails.wins) * 100) : 0) : 0;
  const lossPercent = customDetails !== null ? (customDetails.loses > 0 ? ((customDetails.total / customDetails.loses) * 100) : 0) : 0;

  return (
  <ScrollView style={[{backgroundColor: Colors.cAccordionRowInactive}, Styles.fullScreen, Styles.contentContainer]}>
    <View style={Styles.sideMarginsFivePercent}>
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
        <View style={styles.modalView}>
          <TouchableOpacity
            onPress={editModeOnChange}
            style={styles.modalCloseBtn}
          >
            <Icon
              name={'close'}
              size={48}
              color={Colors.purple}
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
        <Text style={styles.name} adjustsFontSizeToFit={true}>{user?.name ?? ''}</Text>
        <ImageButton
          imgSrc={require('../../../asset/pencil.png')}
          titleStyle={styles.editImg}
          onPress={editModeOnChange}
        />
      </View>
      <Text style={styles.email} adjustsFontSizeToFit={true}>{user?.email ?? ''}</Text>

      <View>
        <AnimatedCircularProgress
          size={Math.round(Dimensions.get('window').width * 0.53)}
          width={15}
          fill={winPercent}
          tintColor={Colors.orange}
          onAnimationComplete={() => console.log('onAnimationComplete')}
          backgroundColor={Colors.purple}
          style={styles.userPhotoOutline}
          children={() =>
          {
            return(
              <>
                <ImageButton
                  imgSrc={user ? {uri: user?.photo ?? ''} : Images.noPhoto}
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
            )
          }}
        />
        <Text style={styles.winPercent} adjustsFontSizeToFit={true}>{`${winPercent}%`}</Text>
        <Text style={styles.lossPercent} adjustsFontSizeToFit={true}>{`${lossPercent}%`}</Text>
      </View>

      <View style={[Styles.row, styles.statsRow]}>
        <View style={Styles.column}>
          <Image style={styles.winLossIcon} source={require('../../../asset/win.png')}/>
          <Text style={styles.email} adjustsFontSizeToFit={true}>{AppText.pSettingsWinText}</Text>
          <Text style={styles.winNumber} adjustsFontSizeToFit={true}>{customDetails ? customDetails.wins : 0}</Text>
        </View>
        <View style={Styles.column}>
          <Text style={styles.email} adjustsFontSizeToFit={true}>{AppText.pSettingsOneVOneText}</Text>
          <Text style={styles.email} adjustsFontSizeToFit={true}>{AppText.pSettingsDebatesText}</Text>
        </View>
        <View style={Styles.column}>
          <Image style={styles.winLossIcon} source={require('../../../asset/loss.png')}/>
          <Text style={styles.email} adjustsFontSizeToFit={true}>{AppText.pSettingsLoseText}</Text>
          <Text style={styles.lossNumber} adjustsFontSizeToFit={true}>{customDetails ? customDetails.loses : 0}</Text>
        </View>
      </View>

      <MyButton
        onPress={logout}
        title={AppText.pSettingsLogoutText}
        buttonStyle={Styles.authSubmitBtn}
        titleStyle={Styles.authSubmitBtnText}
      />
    </View>
  </ScrollView>
  );
};

const styles = StyleSheet.create({
  modalCloseBtn: {
    alignSelf: 'flex-end',
    position: 'absolute',
    right: 10,
  },
  modalView: {
    marginTop: '15%',
    height: '75%',
    backgroundColor: Colors.orange,
    borderRadius: 20,
    paddingHorizontal: 35,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 10,
  },
  statsRow: {
    marginTop: '20%',
    width: '70%',
    marginHorizontal: '15%'
  },
  lossNumber: {
    color: Colors.purple,
    fontSize: 64,
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
    textAlign: 'center',
  },
  winNumber: {
    color: Colors.orange,
    fontSize: 64,
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
    textAlign: 'center',
  },
  winLossIcon: {
    alignSelf: 'center',
    width:  Math.round(Dimensions.get('window').width * 0.127),
    height: Math.round(Dimensions.get('window').height * 0.067),
    resizeMode: 'contain',
  },
  passwordText: {
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
  winPercent: {
    color: Colors.orange,
    fontSize: 43,
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
    fontStyle: 'italic',
    position:'absolute',
    left: '3%',
    bottom: 0,
  },
  lossPercent: {
    color: Colors.purple,
    fontSize: 23,
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
    fontStyle: 'italic',
    position:'absolute',
    right: '10%',
    top: '20%',
  },
  plusSignContainer: {
    backgroundColor: Colors.orange,
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
    color: Colors.orange,
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
    color: Colors.white,
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

export default Layout2;
