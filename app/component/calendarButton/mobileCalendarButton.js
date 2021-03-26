import React, { Component } from 'react';
import { Dimensions, Image, Linking, StyleSheet, View } from 'react-native';
import RNCalendarEvents from "react-native-calendar-events";

import { ApiRequest } from '../../helper';
import { MyButton } from '../myButton';
import { AppText, Colors, Images, Styles } from '../../constant';

export default class MobileCalendarButton extends Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      isLinked: false
    };
  }

  async componentDidMount()
  {
    const status = await RNCalendarEvents.checkPermissions();
    if(status === 'authorized')
    {
      this.setState({ isLinked: true });
    }
  }

  requestPermission = async() =>
  {
    const status = await RNCalendarEvents.requestPermissions();
    if(status === 'authorized')
    {
      this.setState({ isLinked: true });
    }
  };


  render()
  {
    return (
      <View style={styles.container}>
        <Image
          source={this.state.isLinked ? Images.checkFilled : Images.checkEmpty}
          style={styles.check}
        />
        <MyButton
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title={AppText.calendarButton.mobileCalendarButton.apple.text}
          linearGradient={[Colors.darkBlue2, Colors.darkBlue2]}
          onPress={async() => this.state.isLinked ? console.log("Already linked") : this.requestPermission()}
        />
      </View>
    );
  }
};

const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const width16 = Math.round(Dimensions.get('window').width * 0.0426);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkBlue1,
    alignItems: 'center',
  },
  check: {
    height: Math.round(Dimensions.get('window').height * 0.023),
    width: Math.round(Dimensions.get('window').width * 0.067),
    marginLeft: width16,
    resizeMode: 'contain',
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
    fontSize: height18,
    textAlign: 'left',
    marginLeft: width16,
    color: Colors.white,
  },
});

module.exports = MobileCalendarButton;
