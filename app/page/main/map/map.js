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
import { Map } from '../../../component/map';

import {extractValueFromPointer} from '../../../helper/coreModel';

export default class MapPage extends Component
{
  _manager = null;
  _oauthManager = null;
  _isMounted = false;

  // MARK: - Constructor
  constructor(props)
  {
    console.log('Main Map()');
    super(props);

    this.state =
    {
      isLoading: false,
      location: null,
      geofenceArea: (this.props.route.params && this.props.route.params.geofenceArea) ?
                                                 this.props.route.params.geofenceArea : null
    };

    // Refresh data
    // this appears to only get called when we click on 
    // a previously received alert to render the map for that alert
    props.navigation.addListener('focus', () =>
    {
      if(this.props.route.params && this.props.route.params.geofenceArea)
      {
        console.log('Main map about to show an alert')
        this.setState({ geofenceArea: this.props.route.params.geofenceArea });
      }
    });
  }

  async componentDidMount()
  {

  }


  shouldComponentUpdate(nextProps, nextState)
  {
    return (
      this.state.isLoading !== nextState.isLoading ||
      this.state.geofenceArea !== nextState.geofenceArea
    );
  }

  // MARK: - Render
  render()
  {
    console.log('Main Map.render() geo fence data: ' + JSON.stringify( this.state.geofenceArea ));

    return (
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        colors={[Colors.white, Colors.white]}
        style={[Styles.fullScreen]}
      >
        <ActivityIndicator
          size="large"
          color={Colors.burnoutGreen}
          animating={this.state.isLoading}
          style={Styles.loading}
        />
        <View style={styles.mapContainer}>
          <Map
            updateMasterState={(state) => this.setState(state)}
            showAlert={this.props.showAlert}
            createMode={false}
            navigation={this.props.navigation}
            geofenceArea={this.state.geofenceArea}
          />
        </View>
      </LinearGradient>
    );
  }
}


const height18 = Math.round(Dimensions.get('window').height * 0.02307);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.white,
    justifyContent: 'flex-start',
  },
  mapContainer: {
    flex: 1,
    flexDirection: 'column',
  },
});
