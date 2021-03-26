import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  StatusBar,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { MyButton } from '../../../component/myButton';
import { ImageButton } from '../../../component/imageButton';
import { FormInput } from '../../../component/formInput';
import { Colors, Styles } from '../../../constant';

const Layout1 = ({ isLoading, updateMasterState }) =>
{
  return (
  <KeyboardAwareScrollView style={Styles.backgroundColor} >
    <StatusBar barStyle="dark-content" />
    <View style={styles.body}>
    <ActivityIndicator size="large"
      color={Colors.burnoutGreen}
      animating={isLoading}
    />
      <View style={Styles.sectionContainer}>
        <View>
          <FormInput
            id='username'
            updateMasterState={updateMasterState}
            value={this.state.username}
            label='Username'
            autoCompleteType='username'
            otherTextInputProps = {{
              maxLength: 16,
            }}
            helperText='Please enter a valid username'
            validationType={FormInput.ValidationType.Username}
            forcedBlur={this.state.forcedBlur}
          />
        </View>
        <View style={Styles.formInput}>
          <FormInput
            id='email'
            updateMasterState={this.updateMasterState}
            value={this.state.email}
            label='Email'
            autoCompleteType='email'
            otherTextInputProps = {{
              maxLength: 64
            }}
            helperText='Please enter a valid email address'
            validationType={FormInput.ValidationType.Email}
            forcedBlur={this.state.forcedBlur}
          />
        </View>
        <View style={Styles.formInput}>
          <FormInput
            id='phone'
            updateMasterState={this.updateMasterState}
            value={this.state.phone}
            label='Mobile Number'
            autoCompleteType='phone'
            otherTextInputProps = {{
              maxLength: 12,
            }}
            helperText='Must be a valid phone number'
            validationType={FormInput.ValidationType.Phone}
            forcedBlur={this.state.forcedBlur}
          />
        </View>
        <View style={Styles.formInput}>
          <FormInput
            id='currentPassword'
            updateMasterState={this.updateMasterState}
            value={this.state.currentPassword}
            label='Current Password'
            autoCompleteType='off'
            otherTextInputProps = {{
              maxLength: 32,
              secureTextEntry: true,
              autoCompleteType: 'off',
              autoCorrect: false,
              textContentType: 'none',
            }}
            helperText='The password must be at least 4 characters'
            validationType={FormInput.ValidationType.Password}
          />
        </View>
        <View style={Styles.formInput}>
          <FormInput
            id='newPassword'
            updateMasterState={this.updateMasterState}
            value={this.state.newPassword}
            label='New Password'
            autoCompleteType='off'
            otherTextInputProps = {{
              maxLength: 32,
              secureTextEntry: true,
              autoCompleteType: 'off',
              autoCorrect: false,
              textContentType: 'none',
            }}
            helperText='The password must be at least 4 characters'
            validationType={FormInput.ValidationType.Password}
          />
        </View>
        <View style={Styles.formInput}>
          <FormInput
            id='confirmPassword'
            updateMasterState={this.updateMasterState}
            value={this.state.confirmPassword}
            label='Confirm Password'
            autoCompleteType='off'
            otherTextInputProps = {{
              maxLength: 32,
              secureTextEntry: true,
              autoCompleteType: 'off',
              autoCorrect: false,
              textContentType: 'none',
            }}
            helperText='The password must be at least 4 characters'
            validationType={FormInput.ValidationType.Password}
          />
        </View>
        <MyButton
          buttonStyle={styles.saveBtn}
          titleStyle={styles.buttonText}
          onPress={() => this.update()}
          title='SAVE'
        />
      </View>
    </View>
  </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  body: {
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowColor: '#000000',
    shadowOffset: { height: -4, width: 1 },
  },
  buttonText: {
    fontFamily: 'Arial',
    fontSize: 16,
    color: Colors.white,
    textAlign:'center',
  },
  saveBtn: {
    width: '100%',
    height: 45,
    backgroundColor: Colors.burnoutGreen,
    borderRadius: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 20,
  },
});

export default Layout1;
