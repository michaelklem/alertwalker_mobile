import React, {Component} from 'react';
import {
  SafeAreaView,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

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
      {this._layout === 4 &&
      <Layout4 />}
    </>
    );
  }
};
