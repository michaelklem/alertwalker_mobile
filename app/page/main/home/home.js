import React, { Component } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Image,
  View,
  Text,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import LinearGradient from 'react-native-linear-gradient';

import { AppText, Colors, Styles } from '../../../constant';
import { AppManager, OauthManager } from '../../../manager';
import ApiRequest from '../../../helper/ApiRequest';
import { Map } from '../../../component/map';

import {extractValueFromPointer} from '../../../helper/coreModel';

export default class Home extends Component
{
  _manager = null;
  _isMounted = false;
  _componentRef = null;

  // MARK: - Constructor
  constructor(props)
  {
    console.log('Home()');
    super(props);

    // Get components on page
    this._manager = AppManager.GetInstance();
    const components = this._manager.getComponentsForPage('home');

    this.state =
    {
      isLoading: false,
      components: components,
    };

    // Refresh data
    props.navigation.addListener('focus', () =>
    {
      if(this._isMounted !== true)
      {
        this._isMounted = true;
      }
      else
      {
        if(this._componentRef.current && this._componentRef.current.refresh)
        {
          this._componentRef.current.refresh();
        }
      }
    });

    this._componentRef = React.createRef();
  }


  // MARK: - Render
  shouldComponentUpdate(nextProps, nextState)
  {
    return (
      this.state.isLoading !== nextState.isLoading ||
      this.state.components !== nextState.components
    );
  }

  // MARK: - Render
  render()
  {
    //console.log(this.state);
    console.log('Home.render()');
    return (
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        colors={[Colors.white, Colors.white]}
        style={[Styles.fullScreen]}
      >
        <ActivityIndicator
          size="large"
          color={Colors.black}
          animating={this.state.isLoading}
          style={Styles.loading}
        />
        <View style={styles.mapContainer} key={`component-map-container`}>
          <Map
            ref={this._componentRef}
            updateMasterState={(state) => this.setState(state)}
            showAlert={this.props.showAlert}
            createMode={false}
            navigation={this.props.navigation}
          />
        </View>
      </LinearGradient>
    );
  }
}


const height18 = Math.round(Dimensions.get('window').height * 0.02307);

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
    flexDirection: 'column',
  },
});
