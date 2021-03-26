import React, { Component } from 'react';
import { ActivityIndicator, Dimensions, Image, KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-community/async-storage';
import ApiRequest from '../../helper/ApiRequest';
import { FormInput } from '../formInput';
import { MyButton } from '../myButton';
import { TosButton } from '../tos';
import { ImageButton } from '../imageButton';
import { AppText, Colors, Images, Styles } from '../../constant';

export default class VerifySms extends Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      phone: '',
      payload: '',
      isVerifying: false,
    };
  }

  verifySms = async () =>
  {
    console.log('SmsVerification.validatePayload()');
    this.props.updateMasterState({ isLoading: false });

    try
    {
      let response = await ApiRequest.sendRequest("post", {payload: this.state.payload}, "user/verify-sms");
      console.log(response.data);
      if(response.data.error === null)
      {
        const _ = await AsyncStorage.setItem('smsVerificationRequired', 'false');
        this.props.segue('welcome');
      }
      else
      {
        this.props.updateMasterState({ isLoading: false });
        this.props.showAlert('Error', response.data.error);
      }
    }
    catch(err)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 4 ' + err);
    }
  }

  sendVerifySms = async () =>
  {
    console.log('SmsVerification.validatePayload()');
    this.props.updateMasterState({ isLoading: false });

    try
    {
      let response = await ApiRequest.sendRequest("post", {phone: this.state.phone}, "user/send-verify-sms");
      console.log(response.data);
      if(response.data.error === null)
      {
        this.setState({ isLoading: false, isVerifying: true });
      }
      else
      {
        this.props.updateMasterState({ isLoading: false });
        this.props.showAlert('Error', response.data.error);
      }
    }
    catch(err)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 4 ' + err);
    }
  }


  formInput = (formInput) =>
  {
    console.log(formInput);
    let label = formInput.name.replace(/([A-Z])/g, ' $1').trim()
    // Handle confirmation field
    if(label.indexOf('_confirm_') !== -1)
    {
      const cleanName = label.replace('_confirm_', '');
      label = 'Confirm ' + cleanName[0].toUpperCase() + cleanName.slice(1);
    }
    else
    {
      label = label[0].toUpperCase() + label.slice(1);
    }
    const otherTextInputProps =
    {
      maxLength: formInput.maxLength,
      minLength: formInput.minLength
    }
    if(formInput.type === 'select')
    {
      //console.log(formInput);
      label = formInput.label;
    }
    // Handle secure text field
    if(formInput.type === 'secure')
    {
      otherTextInputProps.secureTextEntry = true;
      otherTextInputProps.autoCompleteType = 'off';
      otherTextInputProps.autoCorrect = false;
      otherTextInputProps.textContentType = 'none';
    }
    //console.log(formInput);
    return (
        <FormInput
          id={formInput.name}
          updateMasterState={(id, val) =>
          {
            this.setState({ [id]: val });
          }}
          value={this.state[formInput.name]}
          label={label}
          autoCompleteType={formInput.name}
          textInputStyle={1}
          containerStyle={1}
          type={formInput.type}
          showLabel={false}
          placeholder={formInput.placeholder ? formInput.placeholder : label}
          values={[]}
          validationType={FormInput.ValidationType[formInput.name]}
        />
    );
  }

  render()
  {
    console.log(this.props);
    return (
      <KeyboardAwareScrollView contentContainerStyle={Styles.pinnableScrollViewContent}
        extraScrollHeight={150}
      >
        <View style={{justifyContent: 'flex-start'}}>
          <ImageButton
            imgSrc={require('../../asset/backArrow.png')}
            imageStyle={styles.backBtn}
            onPress={async() =>
            {
              await this.props.updateGlobalState('deepLink', '');
              this.props.updateGlobalState('user', null);
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              this.props.segue('login');
            }}
          />
        </View>
        <View style={{flex: 1, justifyContent: 'center'}}>
          <ImageButton
            imgSrc={require('../../asset/white-circle-logo.png')}
            imageStyle={styles.userPhotoImg}
          />
          <Text style={styles.instructionText}>{this.props.component['subHeader' + (this.state.isVerifying ? 2 : 1)].text}</Text>
        </View>

        <View style={[{flex: 0.5}, {justifyContent: 'flex-end'}]}>
          {!this.state.isVerifying &&
          this.formInput(this.props.component.phoneField)}
          {this.state.isVerifying &&
          this.formInput({
            name: 'payload',
            maxLength: 8,
            minLength: 0,
            type: 'text',
            placeholder: 'Verification code'
          })}
          <MyButton
            buttonStyle={styles.emailLoginBtn}
            titleStyle={styles.emailLoginBtnText}
            title={this.props.component['submit' + (this.state.isVerifying ? 2 : 1)].text}
            onPress={() => (this.state.isVerifying ? this.verifySms() : this.sendVerifySms())}
          />
          <TosButton title={AppText.loginPage.layout4.termsText} />
        </View>

      </KeyboardAwareScrollView>);
  }
};

const styles = StyleSheet.create({
  backBtn: {
    width: Math.round(Dimensions.get('window').width * 0.05),
    height: Math.round(Dimensions.get('window').height * 0.02),
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    marginLeft: 30,
    marginTop: 30,
  },
  emailLoginBtn: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.loginContainer.emailLoginBtn,
    justifyContent: 'center',
  },
  emailLoginBtnText: {
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
    color: Colors.white,
  },
  instructionText: {
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
    fontSize: 16,
    marginTop: 30,
    textAlign: 'left',
    opacity: 0.5,
    marginHorizontal: 40,
    lineHeight: 18,
    color: Colors.white,
  },
  userPhotoImg: {
    width: Math.round(Dimensions.get('window').width * 0.43),
    height: Math.round(Dimensions.get('window').height * 0.2),
    alignSelf: 'center',
    resizeMode: 'contain',
    justifyContent: 'center',
  },
});

module.exports = VerifySms;
