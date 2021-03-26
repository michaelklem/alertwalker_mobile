import React, { Component } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { AppleButton, appleAuth } from '@invertase/react-native-apple-authentication';
import jwt_decode from 'jwt-decode';

import { MyButton } from '../myButton';
import { AppText, Colors } from '../../constant';

export default class AppleLoginButton extends Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      expanded: false,
      email: '',
      password: ''
    };
  }

  onAppleLogin = (response) =>
  {
    let email = response.email;
    if(!email)
    {
      const decoded = jwt_decode(response.identityToken);
      email = decoded.email;
    }

    let updateParams =
    {
      accessToken: response.identityToken,
      externalId: response.user,
      email: email,
      source: 'apple',
      firstName: response.fullName.givenName ? response.fullName.givenName : 'Apple',
      lastName: response.fullName.familyName ? response.fullName.familyName : 'User',
      photo: '',
      url: ''
    };
    if(this.props.login)
    {
      this.props.login(updateParams);
    }
  }

  render()
  {
    console.log('\tAppleLoginButton.render()');
    return (
      <View>
        <AppleButton
          buttonStyle={AppleButton.Style.BLACK}
          buttonType={AppleButton.Type.SIGN_IN}
          cornerRadius={0}
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={async() =>
          {
            // performs login request
            const appleAuthRequestResponse = await appleAuth.performRequest({
              requestedOperation: appleAuth.Operation.LOGIN,
              requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });

            // get current authentication state for user
            // /!\ This method must be tested on a real device. On the iOS simulator it always throws an error.
            const credentialState = await appleAuth.getCredentialStateForUser(appleAuthRequestResponse.user);

            // use credentialState response to ensure the user is authenticated
            if (credentialState === appleAuth.State.AUTHORIZED)
            {
              console.log(appleAuthRequestResponse);
              this.onAppleLogin(appleAuthRequestResponse);
            }
          }}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  button: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
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
    textAlign: 'left',
    marginLeft: 16,
    color: Colors.backgroundBlue,
  },
});



module.exports = AppleLoginButton;
