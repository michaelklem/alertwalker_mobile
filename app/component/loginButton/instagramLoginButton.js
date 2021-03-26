import React, { Component } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { InstagramLogin } from '../instagramLogin';
import { ApiRequest } from '../../helper';
import { MyButton } from '../myButton';
import { AppText, Colors, Styles } from '../../constant';
import { OauthManager } from '../../manager';

import CookieManager from '@react-native-community/cookies';

export default class InstagramLoginButton extends Component
{
  _oauthMgr = null;

  constructor(props)
  {
    super(props);
    this._oauthMgr = OauthManager.GetInstance();
    //CookieManager.clearAll(true);
  }

  /**
    Convert code to access token on the backend (protect app secret)
    @param  {String}  code  The code returned from InstagramLogin
  */
  convertCode = async(code) =>
  {
    this.props.updateMasterState({ isLoading: true });
    const response = await ApiRequest.sendRequest('post',
                                                  {code: code},
                                                  'oauth/instagram');
    console.log(response.data);

    this.props.updateMasterState({ isLoading: false });
    if(response.data.error !== null)
    {
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    if(this.props.onLoginSuccess)
    {
      this._oauthMgr.addOauthToken('instagramToken', response.data.results);
      this.props.onLoginSuccess();
    }
    else if(this.props.shouldLogin)
    {
      this.props.login(response.data.results);
    }
  }

  render() {
    //console.log(this.props.redirectUrl);
    return (
      <View key={this.props.formInput.name}>
        {!this.props.managed &&
        <MyButton
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title={AppText.loginButton.instagramLoginButton.text}
          linearGradient={['#8D0159', '#F49E48']}
          onPress={() => this.props.updateMasterState({ instagramModalVisible: true })}
        />}
        <InstagramLogin
          appId={this.props.appId}
          appSecret={''}
          redirectUrl={this.props.redirectUrl}
          modalVisible={this.props.modalVisible}
          scopes={['user_profile', 'user_media']}
          onLoginSuccess={(code) => this.convertCode(code)}
          onLoginFailure={(data) => console.log(data)}
          updateMasterState={this.props.updateMasterState}
          modalVisible={this.props.modalVisible}
          updateFormInput={this.props.updateFormInput}
        />
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
