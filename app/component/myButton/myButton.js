import React, { Component } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native'

import LinearGradient from 'react-native-linear-gradient';

import { Styles } from '../../constant';

export default class MyButton extends Component
{
 render()
 {
   return (
     <TouchableOpacity style={this.props.buttonStyle} onPress={this.props.onPress}>
      {!this.props.linearGradient &&
      <Text
        style={this.props.titleStyle}
        adjustsFontSizeToFit={true}
        numberOfLines={1}
      >{this.props.title}</Text>}
      {this.props.linearGradient &&
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        colors={this.props.linearGradient}
        style={[{flex: 1}, {justifyContent: 'center'}]}
      >
        <Text style={this.props.titleStyle}>{this.props.title}</Text>
      </LinearGradient>}
    </TouchableOpacity>
    )
  }
}
