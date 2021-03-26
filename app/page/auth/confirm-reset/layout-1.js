import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  StatusBar,
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

const Layout1 = ({isLoading,
                  displayFormInputs,
                  guestAccessAllowed,
                  segue }) =>
{
  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      colors={['#8FE1E6', '#99EBC2']}
      style={[Styles.fullScreen]}
    >
      <KeyboardAwareScrollView>
        <StatusBar barStyle="dark-content" />
        <View style={[Styles.sectionContainer]}>

          <View style={Styles.row}>
            <TouchableOpacity onPress={() => segue('login')}>
              <Icon
                name={'keyboard-backspace'}
                size={40}
                color={Colors.black}
                style={ { alignSelf: 'center' } }
              />
            </TouchableOpacity>
            <Image
              source={require('../../../asset/logo3.png')}
              style={Styles.loadingLogo}
            />
            <View />
          </View>

          <Text style={Styles.authSubWelcomeText} adjustsFontSizeToFit={true}>{AppText.pConfirmResetHeaderText}</Text>
          <ActivityIndicator
            size="large"
            color={Colors.burnoutGreen}
            animating={isLoading}
          />
          {displayFormInputs()}
        </View>

      </KeyboardAwareScrollView>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  forgotPasswordBtn: {
    marginTop: Math.round(Dimensions.get('window').height * 0.03),
    textAlign: 'center',
    fontWeight: 'bold',
    color: Colors.white,
    fontSize: 18,
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
  registerRow: {
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
});
export default Layout1;
