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


const Layout3 = ({isLoading,
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
      <KeyboardAwareScrollView contentContainerStyle={Styles.pinnableScrollViewContent}>
        <StatusBar barStyle="dark-content" />
        <View style={[Styles.sectionContainer]}>
          <Image
            source={require('../../../asset/logo3.png')}
            style={Styles.loadingLogo}
          />
          <ActivityIndicator
            size="large"
            color={Colors.burnoutGreen}
            animating={isLoading}
          />
          {displayFormInputs()}
        </View>
        <View style={[{marginBottom: 20}, {marginTop: 20}]}>
          <View style={[styles.registerRow, Styles.sideMargins]}>
            <Text style={Styles.authBottomText} adjustsFontSizeToFit={true}>{AppText.pRegisterLoginLblText}</Text>
            <MyButton titleStyle={Styles.authBottomBtn}
              title={AppText.pRegisterLoginBtnText}
              onPress={() => segue('login')}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  registerRow: {
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
});
export default Layout3;
