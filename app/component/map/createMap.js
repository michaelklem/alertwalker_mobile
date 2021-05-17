import React, { Component } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  Text,
  FlatList,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Vibration
} from 'react-native';

import { isPointWithinRadius } from 'geolib';
import { StackActions } from '@react-navigation/native';
import MapView, { Callout, Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Icon from "react-native-vector-icons/MaterialIcons";

import { AppManager, DataManager, HeaderManager, LocationManager } from '../../manager';
import RadiusField from './radiusField';
import SubmitField from './submitField';
import LocationField from './locationField';
import { ImageButton } from '../imageButton';
import { Colors } from '../../constant';
import { GetLocationCommand, SetLocationCommand } from '../../command/location';

// MARK: - Constants
const RADIUS_SIZE = 500;

export default class CreateMap extends Component
{
  // MARK: - Data fields
  // Managers
  _dataMgr = null;
  _headerMgr = null;
  // Refs
  _mapViewRef = null;
  _createMarkerRef = null;
  // Keyboard related
  _keyboardIsShowing = false;
  _keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
  _keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  // Map view related
  // _mapCreateLastGoodPosition = null;
  // The number of decimal places a longitude or latitude must change in order for an update to be processed
  // prevents map from repeatedly updating
  _threshold = 2;
  _isMapMovable = true;

  constructor(props)
  {
    super(props);
    console.log('\tCreateMap()');
    this._dataMgr = DataManager.GetInstance();
    this._headerMgr = HeaderManager.GetInstance();

    this.state =
    {
      radius: RADIUS_SIZE,
      note: '',
      // Disabled this to use map restriction instead
      // mapCreateRadius: AppManager.GetInstance().getMapCreateRadius(),
      dataVersion: 0
    };

    this._mapViewRef = React.createRef();
    this._createMarkerRef = React.createRef();
  }

  async componentWillUnmount()
  {
    // Remove observers
    LocationManager.GetInstance().removeListener('map');
    this._dataMgr.removeObserver('map');
    this._headerMgr.removeListener('map');
  }

  async componentDidMount()
  {
    console.log('\tCreateMap.componentDidMount()');

    // Setup observers
    LocationManager.GetInstance().addListener('map', this.onLocation);

    this._dataMgr.addObserver(() =>
    {
      this.refresh();
    },
    'map',
    'geofenceAreas');

    try
    {
      this._isMounted = true;

      // If location not supplied load user's location and set map to that
      if(!this.props.geofenceArea)
      {
        const locationData = this._dataMgr.getData('location');
        await this.getLocation();
      }
    }
    catch(err)
    {
      console.log(err);
    }
  }

  _keyboardDidShow = () =>
  {
    this._keyboardIsShowing = true;
    console.log("Showing");
  }

  _keyboardDidHide = () =>
  {
    this._keyboardIsShowing = false;
    console.log("Hiding");
  }

  getLocation = async() =>
  {
    await this._dataMgr.execute(await new GetLocationCommand(
    {
      updateMasterState: (state) => this.setState(state),
      setLoading: (isLoading) => this.props.updateMasterState({ isLoading: isLoading }),
      dataVersion: this.state.dataVersion
    }));

    // Set map location to use delta configuration
    const locationData = this._dataMgr.getData('location');
    const region = {...locationData.mapLocation};
    const delta = {...AppManager.GetInstance().getMapCreateDelta()};
    region.latitudeDelta = delta.latitudeDelta;
    region.longitudeDelta = delta.longitudeDelta;
    await this._dataMgr.execute(await new SetLocationCommand({
      newLocation: region,
      updateMasterState: (state) => this.setState(state),
      dataVersion: this.state.dataVersion,
      type: 'map',
    }));
  }

  refresh = () =>
  {
    this.setState({ dataVersion: this.state.dataVersion + 1 });
  }

  onLocation = async() =>
  {
    /*const locationData = this.#dataMgr.getData('location');
    if( location.latitude !== locationData.userLocation.latitude ||
        location.longitude !== locationData.userLocation.longitude)
    {
      await this._dataMgr.execute(await new SetLocationCommand({
        newLocation: region,
        updateMasterState: (state) => this.setState(state),
        dataVersion: this.state.dataVersion,
        type: 'user',
      }));
    }*/
  }

  // MARK: - Renders
  renderMapView = (data, locationData) =>
  {
    //console.log(locationData);
    return (
      <MapView
        ref={this._mapViewRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        onPress={(e) =>
        {
          if(this._keyboardIsShowing)
          {
            Keyboard.dismiss();
          }
        }}
        onRegionChangeComplete={async(region, isGesture) =>
        {
          // console.log('Map.onRegionChangeComplete()');
          //console.log(region.latitude.toFixed(this._threshold) + ' == ' + locationData.mapLocation.latitude.toFixed(this._threshold));
          //console.log(region.longitude.toFixed(this._threshold) + ' == ' + locationData.mapLocation.longitude.toFixed(this._threshold));
          //console.log(region.latitudeDelta.toFixed(this._threshold) + ' == ' + locationData.mapLocation.latitudeDelta.toFixed(this._threshold));


          // if( region.latitude.toFixed(this._threshold) !== locationData.mapLocation.latitude.toFixed(this._threshold) ||
          //     region.longitude.toFixed(this._threshold) !== locationData.mapLocation.longitude.toFixed(this._threshold) ||
          //     region.latitudeDelta.toFixed(this._threshold) !== locationData.mapLocation.latitudeDelta.toFixed(this._threshold) ||
          //     region.longitudeDelta.toFixed(this._threshold) !== locationData.mapLocation.longitudeDelta.toFixed(this._threshold))
          // {
          //   await this._dataMgr.execute(await new SetLocationCommand({
          //     newLocation: region,
          //     updateMasterState: (state) => this.setState(state),
          //     dataVersion: this.state.dataVersion,
          //     type: 'map',
          //   }));
          // }
        }}
        region={locationData.mapLocation}
        showsUserLocation={true}
        moveOnMarkerPress={this._isMapMovable}
        scrollEnabled={this._isMapMovable}
        rotateEnabled={this._isMapMovable}
        zoomEnabled={this._isMapMovable}
        zoomTapEnabled={this._isMapMovable}
        zoomControlEnabled={this._isMapMovable}
        pitchEnabled={this._isMapMovable}
      >

        { /* Create marker bounds (Disabled this for now, instead will restrict map view itself )*/}
        {false &&
        (locationData && locationData.userLocation) &&
        <Circle
          center={locationData.userLocation}
          radius={this.state.mapCreateRadius}
          strokeWidth={5}
          strokeColor={'#E74C3C'}
          fillColor={'rgba(231, 76, 60,0.5)'}
        />}

        {/* Create marker moveable circle */}
        {(locationData && locationData.alertLocation) &&
        <Circle
          center={locationData.alertLocation}
          radius={this.state.radius}
          onRegionChangeComplete={async(e) =>
          {
            // console.log('Circle.onRegionChangeComplete()');
            // await this._dataMgr.execute(await new SetLocationCommand({
            //   newLocation:
            //   {
            //     latitude: e.nativeEvent.coordinate.latitude,
            //     longitude: e.nativeEvent.coordinate.longitude
            //   },
            //   updateMasterState: (state) => this.setState(state),
            //   dataVersion: this.state.dataVersion,
            //   type: 'alert',
            // }));
            // return true;
          }}
          strokeWidth = { 5 }
          strokeColor = { '#1a66ff' }
          fillColor = { 'rgba(230,238,255,0.5)' }
        />}

        {/* Movable create marker */}
        {(locationData && locationData.alertLocation) &&
        <Marker
          ref={this._createMarkerRef}
          draggable
          coordinate={locationData.alertLocation}
          onDragEnd={async(e) =>
          {
            // console.log('OnMarkerDragEnd()');
            /*if(!isPointWithinRadius(e.nativeEvent.coordinate, locationData.userLocation, this.state.mapCreateRadius))
            {
              console.log('Resetting marker');
              await this._dataMgr.execute(await new SetLocationCommand({
                newLocation:
                {
                  latitude: this._mapCreateLastGoodPosition.latitude + .000000001, // Dumb workaround for marker not resetting if same coordinate passed in
                  longitude: this._mapCreateLastGoodPosition.longitude + .00000001
                },
                updateMasterState: (state) => this.setState(state),
                dataVersion: this.state.dataVersion,
                type: 'alert',
              }));
              this._createMarkerRef.current.redraw();
            }
            else
            {
              console.log('Took the value change');
              */

              console.log(`[Debug] new alert corrds: ${JSON.stringify( e.nativeEvent.coordinate)}` )
                console.log('[Debug] state: ' + JSON.stringify(this.state));

              await this._dataMgr.execute(await new SetLocationCommand({
                newLocation:
                {
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude
                },

                // mk
                // Uncommenting this line forces a refresh which causes the 
                // map to re-render at user's current location.
                // Not seeing the point of this at this time.
                // updateMasterState: (state) => this.setState(state),
                dataVersion: this.state.dataVersion,
                type: 'alert',
              }));
            //}

          }}
          onDragStart={() => 
          {
            // Provides user with feedback that marker is now draggable.
            Vibration.vibrate();
          }}
          onDrag={async(e) =>
          {
            

            // console.log('onMarkerDrag()');
            // Disabling this and restricting map view itself to restrict marker movement
            /*console.log('onMarkerDrag()');

            // If not in circle set back to good position
            if(!isPointWithinRadius(e.nativeEvent.coordinate, locationData.userLocation, this.state.mapCreateRadius))
            {
              console.log('Not in circle');
            }
            else
            {
              this._mapCreateLastGoodPosition = e.nativeEvent.coordinate;
            }*/

              // this._mapCreateLastGoodPosition = e.nativeEvent.coordinate;
          }}
          pinColor={"red"}
        />}
      </MapView>
    );
  }

  render()
  {
    console.log('\tCreateMap.render()');
    const data = this._dataMgr.getData('geofenceAreas');
    const locationData = this._dataMgr.getData('location');

    //console.log('locationData: ' + JSON.stringify(locationData.alertLocation) );
    //console.log(this._mapCreateLastGoodPosition);

    return (
      <KeyboardAvoidingView style={styles.container}>
        {/* Main map */}
        <View style={[styles.mapContainer]}>
          {locationData &&
          locationData.mapLocation &&
          this.renderMapView(data, locationData)}
        </View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  mapContainer: {
    flex: 1,
    height: '100%',
    backgroundColor: Colors.white,
  },
  map: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
