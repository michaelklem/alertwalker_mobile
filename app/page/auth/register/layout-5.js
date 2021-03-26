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
  Image
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/MaterialIcons";

import { MyButton } from '../../../component/myButton';
import { AppText, Colors, Styles } from '../../../constant';
import { ImageButton } from '../../../component/imageButton';


const Layout5 = ({isLoading,
                  displayFormInputs,
                  guestAccessAllowed,
                  segue }) =>
{
  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      colors={[Colors.white, Colors.white]}
      style={[Styles.fullScreen]}
    >
      {isLoading &&
      <ActivityIndicator
        size="large"
        color={Colors.burnoutGreen}
        animating={isLoading}
      />}

      <KeyboardAwareScrollView contentContainerStyle={Styles.pinnableScrollViewContent}
        extraScrollHeight={150}
      >
        <SafeAreaView>
          <View style={{justifyContent: 'flex-start'}}>
            <ImageButton
              imgSrc={require('../../../asset/backArrow.png')}
              imageStyle={styles.backBtn}
              onPress={() => segue('login')}
            />
          </View>
        </SafeAreaView>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <Image
            source={require('../../../asset/alertwalkerlogo-circle.png')}
            style={styles.userPhotoImg}
          />
        </View>
        <View style={[{flex: 0.5}, {justifyContent: 'flex-end'}]}>
          {displayFormInputs()}
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  text: {
    width: Math.round(Dimensions.get('window').width * 0.4),
    height: Math.round(Dimensions.get('window').height * 0.04),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  container: {
    flex: 1
  },
  inner: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  headerContainer: {
    backgroundColor: Colors.header.background,
    flexDirection: 'column',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#979797',
  },
  userPhotoImg: {
    width: Math.round(Dimensions.get('window').width * 0.43),
    height: Math.round(Dimensions.get('window').height * 0.2),
    borderRadius: Math.round(Dimensions.get('window').width * 0.43) / 2,
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
    tintColor: Colors.black,
  },
});
export default Layout5;
