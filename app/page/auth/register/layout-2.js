import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Image
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import { MyButton } from '../../../component/myButton';
import { AppText, Colors, Styles } from '../../../constant';
import { RememberMe } from '../../../component/rememberMe';

const Layout2 = ({isLoading,
                  displayFormInputs,
                  guestAccessAllowed,
                  segue }) =>
{
  return (
    <KeyboardAwareScrollView
      style={Styles.backgroundColor}
    >
      <StatusBar barStyle="dark-content" />
      <View style={[Styles.sectionContainer]}>
        <Image
          source={require('../../../asset/logo2.png')}
          style={Styles.authLogo}
        />
        <Text style={Styles.authWelcomeText} adjustsFontSizeToFit={true}>{AppText.pRegisterWelcomeText}</Text>
        <Text style={Styles.authSubWelcomeText} adjustsFontSizeToFit={true}>{AppText.pRegisterSubWelcomeText}</Text>
        <ActivityIndicator
          size="large"
          color={Colors.burnoutGreen}
          animating={isLoading}
        />
        {displayFormInputs()}
        <View style={[Styles.row, styles.loginRow]}>
          <Text style={Styles.authBottomText} adjustsFontSizeToFit={true}>{AppText.pRegisterLoginLblText}</Text>
          <MyButton titleStyle={Styles.authBottomBtn}
            title={AppText.pRegisterLoginBtnText}
            onPress={() => segue('login')}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};
const styles = StyleSheet.create({
  loginRow: {
    marginTop: Math.round(Dimensions.get('window').height * 0.03)
  },
});
export default Layout2;
