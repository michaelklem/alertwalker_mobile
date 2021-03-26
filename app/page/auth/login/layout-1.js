import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';


import { Colors, Styles } from '../../../constant';
import { MyButton } from '../../../component/myButton';
import { ImageButton } from '../../../component/imageButton';
import { FormInput } from '../../../component/formInput';
import { AuthHeader } from '../../../component/authHeader';

const Layout1 = ({ navigation, isLoading, updateMasterState, usernameValue,
  passwordValue, usernameFormInput, passwordFormInput, login  }) =>
{
  return (
  <>
    <View style={styles.header}>
      <AuthHeader />
    </View>
    <View style={styles.body}>
      <ActivityIndicator
        size="large"
        color={Colors.burnoutGreen}
        animating={isLoading}
      />
      <View style={Styles.sectionContainer}>
        <Text style={Styles.sectionTitle}>Sign In</Text>
        <View style={Styles.formInput}>
          <FormInput
            id={'username'}
            updateMasterState={updateMasterState}
            value={usernameValue}
            label='Username'
            autoCompleteType='username'
            otherTextInputProps = {{
              maxLength: 16,
            }}
            helperText='Please enter a valid username'
            validationType={FormInput.ValidationType.Username}
          />
        </View>
        <View style={Styles.formInput}>
          <FormInput
            id='password'
            updateMasterState={updateMasterState}
            value={passwordValue}
            label='Password'
            autoCompleteType='password'
            otherTextInputProps = {{
              maxLength: 32,
              secureTextEntry: true
            }}
            helperText='The password must be at least 4 characters'
            validationType={FormInput.ValidationType.Password}
          />
        </View>
        <View style={Styles.row}>
          <MyButton
            titleStyle={styles.forgotPasswordBtn}
            title="Forgot password?"
            onPress={() => navigation.navigate('forgotPassword')}
          />
          <ImageButton
            titleStyle={Styles.greenArrowBtn}
            onPress={ () => login() }
            //imgSrc={require("../../../asset/arrow.png")}
          />
        </View>
        <MyButton titleStyle={styles.signUpBtn}
          title="Sign up"
          onPress={() => navigation.navigate('Register')}
        />
      </View>
    </View>
  </>
  );
};
const styles = StyleSheet.create({
  header: {
    flex: 0.5,
    height: Math.round(Dimensions.get('window').height * 0.4),
    backgroundColor: Colors.white,
  },
  body: {
    backgroundColor: Colors.white,
    flex: 0.5,
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowColor: '#000000',
    shadowOffset: { height: -4, width: 1 },
  },
  forgotPasswordBtn: {
    fontFamily: 'Arial',
    opacity: 0.5,
    color: Colors.placeholderTextColor,
    fontSize: 17,
  },
  signUpBtn: {
    color: Colors.signUpBtn,
    fontSize: 17,
    fontFamily: 'Arial',
  },
});
export default Layout1;
