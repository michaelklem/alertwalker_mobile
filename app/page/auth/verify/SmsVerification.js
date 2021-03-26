import {Dimensions } from "react-native";
import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { MyButton } from '../component/myButton';
import { ImageButton } from '../component/imageButton';
import { FormInput } from '../component/formInput';
import { AuthHeader } from '../component/authHeader';
import { Colors, Styles } from '../constant';
import ApiRequest from '../helper/ApiRequest';

export default class SmsVerification extends Component
{
  constructor(props)
  {
    console.log('SmsVerification()');
    super(props);
    this.state =
    {
      isLoading: false,
      payload: '',
    };
  }

  updateMasterState = (id, value) =>
  {
    this.setState({ [id]: value });
  }

  validatePayload = async () =>
  {
    console.log('SmsVerification.validatePayload()');

    this.setState({ isLoading: true });

    let params =
    {
      payload: this.state.payload
    };

    try
    {
      let response = await ApiRequest.sendRequest("post", params, "user/verifySms");

      console.log(response.data);

      // Success
      if(response.data.error === null)
      {
        _ = await AsyncStorage.setItem('smsVerificationRequired', 'false');
        this.props.navigation.navigate('MyClasses');
      }
      else
      {
        this.setState({
          isLoading: 		false
        });
        this.showAlert('Error', response.data.error);
      }
    }
    catch(err)
    {
      this.setState({
        isLoading: 		false,
      });
      this.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 4 ' + err, 'danger');
    }
  }

  showAlert = (title, message) =>
  {
    Alert.alert(title,
      message,
      [{text: 'OK'}],
      {cancelable: false});
  }

  render()
  {
    console.log('SmsVerification.render()');


    return (
      <KeyboardAwareScrollView >
        <StatusBar barStyle="dark-content" />
        <View style={styles.header}>
          <AuthHeader />
        </View>
        <View style={styles.body}>
          <ActivityIndicator size="large"
            color={Colors.burnoutGreen}
            animating={this.state.isLoading}
          />
          <View style={Styles.sectionContainer}>
            <Text style={Styles.sectionTitle} adjustsFontSizeToFit={true}>SMS Verification</Text>
            <View style={Styles.formInput}>
              <FormInput
                id='payload'
                updateMasterState={this.updateMasterState}
                value={this.state.payload}
                label='Enter your code'
                otherTextInputProps = {{
                  maxLength: 16,
                }}
              />
            </View>
            <View style={Styles.btnHolder}>
              <View/>
              <ImageButton titleStyle={Styles.greenArrowBtn}
                onPress={() => this.validatePayload()}
                imgSrc={require("../asset/arrow.png")}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    flex: 0.6,
    height: Math.round(Dimensions.get('window').height * 0.6),
    backgroundColor: Colors.white,
  },
  body: {
    backgroundColor: Colors.white,
    flex: 0.4,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowColor: '#000000',
    shadowOffset: { height: -4, width: 1 },
  },
});
