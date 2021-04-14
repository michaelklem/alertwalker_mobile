import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

import { AppText, Colors, Styles } from '../../../constant';
import { AppManager, OauthManager } from '../../../manager';
import ApiRequest from '../../../helper/ApiRequest';


export default class Api extends Component
{
  _manager = null;

  // MARK: - Constructor
  constructor(props)
  {
    console.log('\tApi()');
    super(props);

    this.state =
    {
      isLoading: false
    };

    console.log(props.route.params);

    // Get components on page
    this._manager = AppManager.GetInstance();
  }

  async componentDidMount()
  {
    await this.oauthConvert(this.props.route.params.source, this.props.route.params.code);
  }


  oauthConvert = async(source, code) =>
  {
    this.setState({ isLoading: true });

    const params =
    {
      source: source,
      code: code
    };
    const response = await ApiRequest.sendRequest('post',
                                                  params,
                                                  'oauth/convert');
    console.log(response.data);
    if(response.data.error !== null)
    {
      this.setState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    this.setState({ isLoading: false });

    // Need to tell GoogleLoginButton that we are done
    if(response.data.results.source === 'google')
    {
      OauthManager.GetInstance().notifyListeners(response.data.results);
    }

    // Pop back to where we were
    if(this.props.route.params.onGoBack)
    {
      this.props.route.params.onGoBack();
    }
    this.props.navigation.goBack();
  }


  render()
  {
    console.log('\tApi.render()');
    return (
      <>
        <ActivityIndicator
          size="large"
          color={Colors.burnoutGreen}
          animating={this.state.isLoading}
        />
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.separatorGray,
    justifyContent: 'flex-start',
  },
});
