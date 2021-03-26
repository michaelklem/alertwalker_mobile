import React, { Component } from 'react';
import {  Dimensions,
          Image,
          ImageBackground,
          Linking,
          StyleSheet,
          Text,
          TouchableOpacity,
          View } from 'react-native';
import { ApiRequest } from '../../helper';
import { MyButton } from '../myButton';
import { AppText, Colors, Images, Styles } from '../../constant';
import { OauthManager } from '../../manager';


export default class GoogleLoginButton extends Component
{
  _oauthMgr = null;
  constructor(props)
  {
    console.log('\tGoogleLoginButton()');
    super(props);

    this._oauthMgr = OauthManager.GetInstance();
    this._oauthMgr.addListener('GoogleLoginButton',
    (msg) =>
    {
      console.log(msg);
      if(msg.source === 'google' && msg.token !== null)
      {
        this.props.login(msg);
      }
    });
  }

  getUrl = async() =>
  {
    this.props.updateMasterState({ isLoading: true });
    const response = await ApiRequest.sendRequest('post',
                                                  {source: 'google'},
                                                  'oauth/auth-url');
    console.log(response.data);
    if(response.data.error !== null)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    this.props.updateMasterState({ isLoading: false });

    const isSupported = await Linking.canOpenURL(response.data.result);

    if(isSupported)
    {
      await Linking.openURL(response.data.result);
    }
    else
    {
      this.props.showAlert('Error', 'Cannot resolve URL');
    }
  };

  render() {
    //console.log(this.props.redirectUrl);
    return (
      <TouchableOpacity
        key={this.props.formInput.name}
        style={styles.container}
        onPress={async() => this.props.isLinked ? console.log("Already linked") : this.getUrl()}
      >
        <Image
          style={styles.image}
          source={Images.googleIcon}
        />
        <Text
          style={styles.buttonText}
          adjustsFontSizeToFit={true}
          numberOfLines={1}
        >{'Sign in with Google'}</Text>
      </TouchableOpacity>
    );
  }
};

const font18 = Math.round(Dimensions.get('window').height * 0.02307);


const styles = StyleSheet.create({
  container: {
    width: Math.round(Dimensions.get('window').width),
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.transparent,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',


    borderColor: Colors.plainGray5,
    borderWidth: 1,
    borderRadius: 4,
  },
  image: {
    height: '100%',
    width: '25%',
    overflow: 'visible',
    resizeMode: 'contain',
    padding: 0,
  },
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
    marginLeft: font18,
    color: Colors.plainGray5,
    width: '75%',
    flex: 1,
    justifyContent: 'center',
    textAlignVertical: 'center',
  },
});
