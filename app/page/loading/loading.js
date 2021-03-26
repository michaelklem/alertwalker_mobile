import React, {Component} from 'react';
import {
  SafeAreaView,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import Layout1 from './layout-1';
import Layout2 from './layout-2';
import Layout3 from './layout-3';
import Layout4 from './layout-4';

export default class Loading extends Component
{
  _layout = 4;

  constructor(props)
  {
    super(props);
  }

  render()
  {
    return (
    <>
      {this._layout === 1 &&
      <Layout1 />}
      {this._layout === 2 &&
      <Layout2 showText={this.props.showText}/>}
      {this._layout === 3 &&
      <Layout3 />}
      {this._layout === 4 &&
      <Layout4 />}
    </>
    );
  }
};
