import React, { Component } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { MyButton } from '../myButton';
import { AppText, Colors } from '../../constant';

export default class SubmitButton extends Component
{
  render()
  {
    return (
      <View>
        <MyButton
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title={AppText.submit}
          onPress={async() =>
          {
            this.props.onPress();
          }}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  button: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.lightBlue1,
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
    fontSize: 18,
    textAlign: 'center',
    color: Colors.white,
  },
});