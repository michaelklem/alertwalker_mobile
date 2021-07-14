import React from 'react';
import { View } from 'react-native';
import MyButton from '../myButton';
import { ImageButton } from '../imageButton';
import { AppText, Images, Styles } from '../../constant';

const RememberMe = ({ toggleRememberMe, rememberMe }) =>
{
  return (
  <View style={Styles.rowLtr}>
    <MyButton
      titleStyle={Styles.authRememberMeBtn}
      title={AppText.rememberMeBtn}
      onPress={() => toggleRememberMe()}
    />
    <ImageButton
      titleStyle={rememberMe ? Styles.authCheck : Styles.authCircle}
      onPress={ () =>  toggleRememberMe()}
      imgSrc={rememberMe === true ? Images.rememberMe.check : Images.rememberMe.circle}
    />
  </View>);
};
export default RememberMe;
