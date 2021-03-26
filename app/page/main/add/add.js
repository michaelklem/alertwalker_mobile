import React, { Component } from 'react';
import {  Alert,
          Dimensions,
          Keyboard,
          Platform,
          SafeAreaView,
          StyleSheet,
          Text,
          View } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import Swipeout from 'react-native-swipeout';
import Icon from "react-native-vector-icons/MaterialIcons";

import { AppManager } from '../../../manager';

import Layout1 from './layout-1';
import { Colors, Images, Styles } from '../../../constant';

export default class Add extends Component
{
  _layout = 1;

  constructor(props)
  {
    console.log('Add()');
    super(props);
    this.state =
    {
      isLoading: false,
    };
  }

  render()
  {
    console.log('Add.render()');
    return (
    <>
      {this._layout === 1 &&
        <Layout1
          isLoading={this.state.isLoading}
          user={this.props.user}
          updateMasterState={(state) => this.setState(state)}
          showAlert={this.props.showAlert}
          navigation={this.props.navigation}
        />}
      </>
    );
  }
}
