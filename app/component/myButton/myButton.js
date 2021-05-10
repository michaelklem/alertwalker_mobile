import React, { Component } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native'

import LinearGradient from 'react-native-linear-gradient';
import Icon from "react-native-vector-icons/MaterialIcons";
import { TouchableHighlight } from 'react-native-gesture-handler';

import { Colors, Styles } from '../../constant';

export default class MyButton extends Component
{
  render()
  {
    //console.log(this.props);
    return (
      <TouchableHighlight
        style={this.props.buttonStyle}
        onPress={this.props.onPress}
        activeOpacity={0.6}
        underlayColor={Colors.transparent}
      >
        <>
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

          {this.props.icon &&
          this.props.icon.size &&
          <Icon
            name={this.props.icon.name}
            size={this.props.icon.size}
            color={this.props.icon.color}
          />}
        </>
      </TouchableHighlight>
    )
  }
}
