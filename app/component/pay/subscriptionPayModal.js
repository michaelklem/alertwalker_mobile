import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Linking,
  SafeAreaView,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';


import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Icon from "react-native-vector-icons/MaterialIcons";
import { AppManager, IapManager } from '../../manager';
import { MyButton } from '../myButton';
import { TosModal } from '../../component/tos';
import { ImageButton } from '../imageButton';
import { AppText, Colors, Images, Styles } from '../../constant';

const SubscriptionPayModal = ({ close, isOpen, iapSubscription, }) =>
{
  const [tosModalVisible, setTosModalVisible] = useState(false);
  return (
    <Modal
      animationType={'slide'}
      transparent={true}
      visible={isOpen}
    >
      <View style={styles.container}>

        <KeyboardAwareScrollView>
          <ImageButton
            titleStyle={styles.closeBtn}
            imgSrc={Images.close}
            onPress={() => close()}
          />

          <View style={styles.centered}>
            <Image
              source={Images.logo4}
              style={[styles.logo, {marginTop: 'auto'}]}
            />
            <Image
              source={Images.logo4textwhite}
              style={[styles.logoText]}
            />
          </View>

          <Text style={styles.headerText}>{AppText.subscriptionPayModal.header.text}</Text>
          <Text style={styles.bodyText}>{AppText.subscriptionPayModal.body.text}</Text>
          <Text style={styles.priceText}>{`${iapSubscription ? iapSubscription.localizedPrice + '/month' : 'Not supported on simulator, use a real device'}`}</Text>
          <Text style={styles.subscriptionTitleText}>{AppText.subscriptionPayModal.whatYouGet.text}</Text>

          <MyButton
            buttonStyle={styles.bottomBtn}
            titleStyle={styles.bottomBtnText}
            title={AppText.subscriptionPayModal.bottomBtn.text}
            onPress={async() =>
            {
              await IapManager.GetInstance().requestSubscription();
            }}
          />
          <MyButton
            buttonStyle={styles.termsBtn}
            titleStyle={styles.termsBtnText}
            title={AppText.loginPage.layout4.termsText}
            onPress={async() =>
            {
              setTosModalVisible(true);
            }}
          />
          <View style={{flex: 0.8}} />

          <TosModal
            close={() =>
            {
              setTosModalVisible(false);
            }}
            visible={tosModalVisible}
            bottomBtnText={'Agree and close'}
          />

        </KeyboardAwareScrollView>
      </View>
    </Modal>);
};
let tenPercent = Math.round(Dimensions.get('window').width * 0.1);
let tenPercentHeight = Math.round(Dimensions.get('window').height * 0.1);
let thirtyHeight = Math.round(Dimensions.get('window').height * 0.0384);
let fourtyHeight = Math.round(Dimensions.get('window').height * 0.0512);
const font9 = Math.round(Dimensions.get('window').height * 0.01153);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.black,
    opacity: 0.99,
  },
  centered: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logo: {
    width: Math.round(Dimensions.get('window').width * 0.4),
    height: Math.round(Dimensions.get('window').height * 0.23),
    alignSelf: 'center',
    resizeMode: 'contain',
    tintColor: Colors.white,
    marginBottom: Math.round(Dimensions.get('window').height * 0.0153)
  },
  logoText: {
    width: Math.round(Dimensions.get('window').width * 0.4),
    height: Math.round(Dimensions.get('window').height * 0.04),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  closeBtn: {
    width: tenPercent,
    height: tenPercent,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    marginRight: tenPercent,
    marginTop: tenPercent,
  },
  closeRow: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
    margin: 40,
  },
  headerText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Bold'
      },
      android: {
        fontFamily: 'Roboto-Bold'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: 18,
    textAlign: 'center',
    color: Colors.lightBlue1,
    marginTop: thirtyHeight,
  },
  bodyText: {
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
    fontSize: 18,
    textAlign: 'center',
    color: Colors.white,
    marginHorizontal: 10,
    opacity: 0.5,
    marginTop: thirtyHeight,
  },
  priceText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Bold'
      },
      android: {
        fontFamily: 'Roboto-Bold'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: 36,
    textAlign: 'center',
    color: Colors.orange1,
    marginTop: fourtyHeight,
  },
  subscriptionTitleText: {
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
    fontSize: 18,
    textAlign: 'center',
    color: Colors.lightBlue1,
    marginTop: fourtyHeight,
  },
  bottomBtn: {
    height: tenPercentHeight,
    backgroundColor: Colors.white,
    justifyContent: 'center'
  },
  bottomBtnText: {
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
    marginLeft: 16,
    color: Colors.black,
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
});
export default SubscriptionPayModal;
