import React, { Component } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import { MyButton } from '../myButton';
import { AppText, Colors } from '../../constant';

export default class EmailLoginButton extends Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      expanded: false,
      email: '',
      password: ''
    };
  }


  render()
  {
    return (
      <View>
        <MyButton
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title={AppText.loginButton.emailLoginButton.text}
          onPress={async() =>
          {
            this.props.onPress();
          }}
        />
      </View>
    );
  }
};

const font18 = Math.round(Dimensions.get('window').height * 0.02307);

const styles = StyleSheet.create({
  button: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.white,
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
    color: Colors.backgroundBlue,
  },
});



module.exports = EmailLoginButton;
