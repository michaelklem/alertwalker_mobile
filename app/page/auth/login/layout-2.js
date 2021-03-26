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
import Icon from "react-native-vector-icons/MaterialIcons";

import { MyButton } from '../../../component/myButton';
import { AppText, Colors, Styles } from '../../../constant';

const Layout2 = ({isLoading,
                  displayFormInputs,
                  guestAccessAllowed,
                  segue }) =>
{
  return (
    <KeyboardAwareScrollView
      style={Styles.backgroundColor}
      contentContainerStyle={Styles.pinnableScrollView}
    >
      <StatusBar barStyle="dark-content" />
      <View style={[Styles.sectionContainer]}>
        <View style={Styles.row}>
          <Image
            source={require('../../../asset/logo2.png')}
            style={Styles.authLogo}
          />
          {guestAccessAllowed &&
            <TouchableOpacity onPress={() => segue('main')}>
              <Text style={Styles.skipText}>{AppText.pLoginSkipText}</Text>
              <Icon
                name={'trending-flat'}
                size={40}
                color={Colors.purple}
                style={ { alignSelf: 'center' } }
              />
            </TouchableOpacity>
          }
        </View>
        <Text style={Styles.authWelcomeText} adjustsFontSizeToFit={true}>{AppText.pLoginWelcomeText}</Text>
        <Text style={Styles.authSubWelcomeText} adjustsFontSizeToFit={true}>{AppText.pLoginSubWelcomeText}</Text>
        <ActivityIndicator
          size="large"
          color={Colors.burnoutGreen}
          animating={isLoading}
        />
        {displayFormInputs()}
        <MyButton
          titleStyle={Styles.forgotPasswordBtnL2}
          title={AppText.pLoginForgotPasswordBtnText}
          onPress={() => segue('reset')}
        />
      </View>
      <View style={Styles.pinToBottom}>
        <View style={[styles.registerRow, Styles.sideMargins]}>
          <Text style={Styles.authBottomText} adjustsFontSizeToFit={true}>{AppText.pLoginRegisterLblText}</Text>
          <MyButton titleStyle={Styles.authBottomBtn}
            title={AppText.pLoginRegisterBtnText}
            onPress={() => segue('register')}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};
const styles = StyleSheet.create({
  registerRow: {
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
});
export default Layout2;
