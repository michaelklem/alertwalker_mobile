import React, { Component } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginButton,
  LoginManager,
} from 'react-native-fbsdk';

import { OauthManager } from '../../manager';
import { MyButton } from '../myButton';
import { AppText, Colors, Styles } from '../../constant';

export default class FacebookLoginButton extends Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
    };
  }

  getInformationFromToken = (accessToken) =>
  {
    let params =
    {
      accessToken,
      parameters:
      {
        fields:
        {
          string: 'email, first_name, last_name, picture.type(large), id, link',
        },
      }
    };

    let meRequestHandler = (error, result) =>
    {
      if(error)
      {
        console.log('login info has error: ' + error);
      }
      else
      {
        console.log(result);

        let updateParams =
        {
          accessToken: accessToken,
          externalId: result.id,
          email: result.email,
          source: 'facebook',
          firstName: result.first_name,
          lastName: result.last_name,
          photo: result.picture.data.url,
          url: result.link
        };
        if(this.props.login)
        {
          this.props.login(updateParams);
        }
      }
    };

    const myProfileRequest = new GraphRequest('/me',
                                              params,
                                              meRequestHandler);

    new GraphRequestManager().addRequest(myProfileRequest).start();
  }

  render()
  {
    return (
      <View key={this.props.formInput.name}>
        {!this.props.customUI &&
        <LoginButton
          publishPermissions={["email"]}
          permissions={OauthManager.GetInstance().getFacebookPermissions()}
          onLoginFinished={async(error, result) =>
          {
            if (error)
            {
              alert("Login failed with error: " + error.message);
            }
            if(!result.isCancelled)
            {
              let userData = await AccessToken.getCurrentAccessToken();
              let accessToken = userData.accessToken.toString()
              this.getInformationFromToken(accessToken);
            }
          }}
          onLogoutFinished={() => alert("User logged out")}/>}
          {this.props.customUI &&
          <MyButton
            buttonStyle={styles.button}
            titleStyle={styles.buttonText}
            title={AppText.loginButton.facebookLoginButton.text}
            linearGradient={['#0480F8', '#0480F8']}
            onPress={async() =>
            {
              const result = await LoginManager.logInWithPermissions(OauthManager.GetInstance().getFacebookPermissions());
              if(!result.isCancelled)
              {
                let userData = await AccessToken.getCurrentAccessToken();
                let accessToken = userData.accessToken.toString()
                this.getInformationFromToken(accessToken);
              }
            }}
          />}
      </View>
    );
  }
};
const font18 = Math.round(Dimensions.get('window').height * 0.02307);

const styles = StyleSheet.create({
  button: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.transparent,
    justifyContent: 'center',
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
    fontSize: font18,
    textAlign: 'left',
    marginLeft: 16,
    color: Colors.white,
  },
});

module.exports = FacebookLoginButton;
