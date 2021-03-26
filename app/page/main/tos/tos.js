import React, { Component } from 'react';
import { ActivityIndicator, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import LinearGradient from 'react-native-linear-gradient'
import Carousel from 'react-native-snap-carousel';
import Icon from "react-native-vector-icons/MaterialIcons";

import {AppManager} from '../../../manager';
import {Colors, Styles} from '../../../constant';
import ApiRequest from '../../../helper/ApiRequest';

export default class Tos extends Component
{
  _manager = null;


  constructor(props)
  {
    console.log('TOS()');
    super(props);

    this._manager = AppManager.GetInstance();

    let state =
    {
      formInputs: {},
      isLoading: false,
      termsOfService: this._manager.getTermsOfService()
    };

    this.state = state;
  }

  // MARK: - API
  // Agree to terms of service and send to home page
  agreeToTos = async() =>
  {
    console.log('Tos.agreeToTos()');
    this.setState({ isLoading: true });

    try
    {
      let params = {};
      let response = await ApiRequest.sendRequest("post", params, "user/agree-to-tos");

      console.log(response.data);

      // Success
      if(response.data.error === null)
      {
        await AsyncStorage.setItem('tosRequired', 'false');
        this.setState({ isLoading: false });
        if(this.props.stack === 'main')
        {
          this.props.navigation.navigate('home');
        }
        else
        {
          this.props.updateStack('main');
        }
      }
      else
      {
        this.setState({ isLoading: false  });
        this.props.showAlert('Error', response.data.error);
      }
    }
    catch(err)
    {
      this.setState({ isLoading: false  });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 12 ' + err, 'danger');
    }
  }

  // MARK: - Render
  _renderItem = ({item, index}) =>
  {
    return (
        <View style={styles.cardContainer}>
          <Text style={{fontSize: 30}}>{item.text}</Text>
          {index === (this.state.termsOfService.length - 1) &&
          <View style={[Styles.pinToBottom, styles.doneBtn]}>
            <TouchableOpacity
              onPress={()=>this.agreeToTos()}
            >
              <Icon
                name={'exit-to-app'}
                size={60}
                color={Colors.black}
              />
            </TouchableOpacity>
          </View>}
        </View>
      );
    }

  render()
  {
    console.log('TOS.render()');
    return (
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        colors={['#8FE1E6', '#99EBC2']}
        style={[Styles.fullScreen]}
      >
        <ActivityIndicator
          size="large"
          color={Colors.burnoutGreen}
          animating={this.state.isLoading}
          style={!this.state.isLoading ? {display: 'none'} : {}}
        />
        <Image
          source={require('../../../asset/logo3.png')}
          style={[Styles.loadingLogo, styles.logoImage]}
        />
        <Carousel
          layout={"stack"}
          ref={ref => this.carousel = ref}
          enableMomentum={true}
          enableSnap={true}
          data={this.state.termsOfService}
          itemWidth={Math.round(Dimensions.get('window').width * 0.9)}
          itemHeight={Math.round(Dimensions.get('window').height * 0.5)}
          sliderHeight={Math.round(Dimensions.get('window').height * 0.5)}
          renderItem={this._renderItem}
          onSnapToItem = { index => this.setState({ activeIndex:index }) }
          vertical={true}
        />
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  logoImage: {
    marginTop: 150
  },
  cardContainer: {
    flexGrow: 1,
    flexShrink: 1,


    backgroundColor:'floralwhite',
    borderRadius: 5,
    padding: 18,
    marginLeft: 25,
    marginRight: 25,
  },
  doneBtn: {
    alignItems: 'flex-end'
  }
});
