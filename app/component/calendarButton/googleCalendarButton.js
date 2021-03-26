import React, { Component } from 'react';
import { Dimensions, Image, Linking, StyleSheet, View } from 'react-native';

import { ApiRequest } from '../../helper';
import { MyButton } from '../myButton';
import { AppText, Colors, Images, Styles } from '../../constant';

export default class GoogleCalendarButton extends Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
    };
  }

  getUrl = async() =>
  {
    this.props.updateMasterState({ isLoading: true });
    const response = await ApiRequest.sendRequest('post',
                                                  {source: 'google'},
                                                  'oauth/auth-url');
    console.log(response.data);
    if(response.data.error !== null)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    this.props.updateMasterState({ isLoading: false });

    const isSupported = await Linking.canOpenURL(response.data.result);

    if(isSupported)
    {
      await Linking.openURL(response.data.result);
    }
    else
    {
      this.props.showAlert('Error', 'Cannot resolve URL');
    }
  };


  render()
  {
    return (
      <View style={styles.container}>
        <Image
          source={this.props.isLinked ? Images.checkFilled : Images.checkEmpty}
          style={styles.check}
        />
        <MyButton
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
          title={AppText.calendarButton.googleCalendarButton.text}
          linearGradient={[Colors.darkBlue2, Colors.darkBlue2]}
          onPress={async() => this.props.isLinked ? console.log("Already linked") : this.getUrl()}
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

module.exports = GoogleCalendarButton;
