import React, { Component } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
  Image,
} from 'react-native'

export default class ImageButton extends Component
{
 render()
 {
   let imageStyle = this.props.imageStyle ? [this.props.imageStyle] : [styles.image];
   if(this.props.tintColor)
   {
     imageStyle.push({ tintColor: this.props.tintColor });
   }
   return (
      <TouchableOpacity
        onPress={this.props.onPress}
        style={this.props.titleStyle}
      >
        <Image
          style={imageStyle}
          source={this.props.imgSrc}
        />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    overflow: 'visible',
    resizeMode: 'contain',
    padding: 0,
  },
});
