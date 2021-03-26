import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { ImageButton } from '../../../component/imageButton';
import { FormInput } from '../../../component/formInput';
import { AuthHeader } from '../../../component/authHeader';
import { AppText, Colors, Styles } from '../../../constant';

const Layout1 = ({ navigation, isLoading, updateMasterState, usernameValue, usernameFormInput,
  passwordFormInput, passwordValue, confirmPasswordFormInput, confirmPasswordValue,
  nameValue, nameFormInput, register, toggleRememberMe, remember
}) =>
{
  const formInputs = [nameFormInput, usernameFormInput, passwordFormInput, confirmPasswordFormInput];

  return (
  <>
    <View style={styles.header}>
      <AuthHeader />
    </View>
    <View style={styles.body}>
    <ActivityIndicator size="large"
      color={Colors.burnoutGreen}
      animating={isLoading}
    />
      <View style={Styles.sectionContainer}>
        <Text style={Styles.sectionTitle}>{AppText.pLoginRegisterBtnText}</Text>
        {formInputs.map( (formInput) =>
        {
          const otherTextInputProps =
          {
            maxLength: formInput.maxLength,
          }
          if(formInput.type === 'secure')
          {
            otherTextInputProps.secureTextEntry = true;
            otherTextInputProps.autoCompleteType = 'off';
            otherTextInputProps.autoCorrect = false;
            otherTextInputProps.textContentType = 'none';
          }
          return (
            <View style={Styles.formInput}>
              <FormInput
                id={formInput.name}
                updateMasterState={updateMasterState}
                value={usernameValue}
                label={formInput.name[0].toUpperCase() + formInput.name.slice(1)}
                autoCompleteType={formInput.name}
                otherTextInputProps = {otherTextInputProps}
                helperText={AppText.formHelperText + formInput.name}
                validationType={FormInput.ValidationType[formInput.name]}
              />
            </View>
          );
        })}
        <View style={Styles.btnHolder}>
          <ImageButton titleStyle={Styles.greenArrowBtn}
            onPress={() => navigation.goBack(null)}
          //  imgSrc={require("../../../asset/back_arrow.png")}
          />
          <ImageButton titleStyle={Styles.greenArrowBtn}
            onPress={() => this.register()}
          //  imgSrc={require("../../../asset/arrow.png")}
          />
        </View>
      </View>
    </View>
  </>
  );
};
const styles = StyleSheet.create({
  header: {
    height: 77.0,
    backgroundColor: Colors.white,
  },
  body: {
    backgroundColor: Colors.white,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowColor: '#000000',
    shadowOffset: { height: -4, width: 1 },
  },
});
export default Layout1;
