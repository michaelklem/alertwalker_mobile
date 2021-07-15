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
import { ImageButton } from '../imageButton';
import { Colors } from '../../constant';
import { GetLocationCommand, SetLocationCommand } from '../../command/location';
import {MARKER_DEFAULT_COLOR} from '../../constant/App'

// MARK: - Constants
const RADIUS_SIZE = 500;

export default class CreateMap extends Component
{
  // MARK: - Data fields
  // Managers
  _dataMgr = null;
  _headerMgr = null;
  // Refs
  // _mapViewRef = null;
  // _createMarkerRef = null;
  // Keyboard related
  _keyboardIsShowing = false;
  _keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
  _keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  // Map view related
  // _mapCreateLastGoodPosition = null;
  // The number of decimal places a longitude or latitude must change in order for an update to be processed
  // prevents map from repeatedly updating
  // _threshold = 2;
  _isMapMovable = true;

  constructor(props)
  {
    super(props);
    console.log('\t CreateMap() constructor');
    this._dataMgr = DataManager.GetInstance();
    this._headerMgr = HeaderManager.GetInstance();

    this.state =
    {
      radius: RADIUS_SIZE,
      note: '',
      // Disabled this to use map restriction instead
      //mapCreateRadius: AppManager.GetInstance().getMapCreateRadius(),
      dataVersion: 0
    };

    // this._mapViewRef = React.createRef();
    // this._createMarkerRef = React.createRef();
  }

  async componentWillUnmount()
  {
    // Remove observers
    LocationManager.GetInstance().removeListener('map');
    this._dataMgr.removeObserver('map');
    this._headerMgr.removeListener('map');
    console.log('\tCreateMap.componentWillUnMount()');
  }

  async componentDidMount()
  {
    console.log('\tCreateMap.componentDidMount()');


    // Setup observers
    //LocationManager.GetInstance().addListener('map', this.onLocation);

    // this._dataMgr.addObserver(() =>
    // {
    //   this.refresh();
    // },
    // 'map',
    // 'geofenceAreas');

    try
    {
      // this._isMounted = true;
    // const locationData = this._dataMgr.getData('location');
    // console.log('XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX location: ' + JSON.stringify(locationData))

        // const locationData = this._dataMgr.getData('location');
        await this.getLocation();

      // If location not supplied load user's location and set map to that
      // if(!this.props.geofenceArea)
      // {
      //   const locationData = this._dataMgr.getData('location');
      //   await this.getLocation();
      // }
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

    // Set alert location to use delta configuration
    const locationData = this._dataMgr.getData('location');
    const region = {...locationData.mapLocation};
    const delta = {...AppManager.GetInstance().getMapCreateDelta()};
    region.latitudeDelta = delta.latitudeDelta;
    region.longitudeDelta = delta.longitudeDelta;

    console.log('   CreateMap getLocation SetLocationCommand')
    await this._dataMgr.execute(await new SetLocationCommand({
      newLocation: region,
      updateMasterState: (state) => this.setState(state),
      dataVersion: this.state.dataVersion,
      type: 'alert',
    }));
  }

  refresh = () =>
  {
    console.log(' createmap refresh called')
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
    console.log(' createMap renderMapView called ' + JSON.stringify(locationData) );
    return (
      <MapView
        // ref={this._mapViewRef}
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
          // console.log('Create Map.onRegionChangeComplete() new region: ' + JSON.stringify(region) );
          // console.log('Create Map.onRegionChangeComplete() new userLocation: ' + JSON.stringify(locationData.userLocation) );
          // console.log('Create Map.onRegionChangeComplete() new alertLocation: ' + JSON.stringify(locationData.alertLocation) );

          // console.log('Create Map.onRegionChangeComplete()');
          //console.log(region.latitude.toFixed(this._threshold) + ' == ' + locationData.mapLocation.latitude.toFixed(this._threshold));
          //console.log(region.longitude.toFixed(this._threshold) + ' == ' + locationData.mapLocation.longitude.toFixed(this._threshold));
          //console.log(region.latitudeDelta.toFixed(this._threshold) + ' == ' + locationData.mapLocation.latitudeDelta.toFixed(this._threshold));
          // if( region.latitude.toFixed(this._threshold) !== locationData.mapLocation.latitude.toFixed(this._threshold) ||
          //     region.longitude.toFixed(this._threshold) !== locationData.mapLocation.longitude.toFixed(this._threshold) ||
          //     region.latitudeDelta.toFixed(this._threshold) !== locationData.mapLocation.latitudeDelta.toFixed(this._threshold) ||
          //     region.longitudeDelta.toFixed(this._threshold) !== locationData.mapLocation.longitudeDelta.toFixed(this._threshold))
          // {
          //     console.log('   CreateMap MapView SetLocationCommand')
          //   await this._dataMgr.execute(await new SetLocationCommand({
          //     newLocation: region,
          //     updateMasterState: (state) => this.setState(state),
          //     dataVersion: this.state.dataVersion,
          //     type: 'map',
          //   }));
          // }
        }}
       initialRegion={locationData.alertLocation}
        // we want to center the map on the user's location
        // region={(locationData && locationData.userLocation && locationData.userLocation.longitudeDelta) ? locationData.userLocation :
        // {
        //   latitude: locationData.userLocation.latitude,
        //   longitude: locationData.userLocation.longitude,
        //   latitudeDelta: 0.006, // force the marker to be zoomed in
        //   longitudeDelta: 0.006
        // }}

        // initialRegion={(locationData && locationData.alertLocation && locationData.alertLocation.longitudeDelta) ? locationData.alertLocation :
        // {
        //   latitude: locationData.alertLocation.latitude,
        //   longitude: locationData.alertLocation.longitude,
        //   latitudeDelta: 0.006, // force the marker to be zoomed in
        //   longitudeDelta: 0.006
        //   // latitudeDelta: 0.0922,
        //   // longitudeDelta: 0.0421,
        // }}
        showsUserLocation={true}
        showsMyLocationButton={true}
        moveOnMarkerPress={this._isMapMovable}
        scrollEnabled={this._isMapMovable}
        rotateEnabled={this._isMapMovable}
        zoomEnabled={this._isMapMovable}
        zoomTapEnabled={false}
        zoomControlEnabled={false}
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
            console.log('Circle.onRegionChangeComplete()');
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
          strokeColor = { this.props.markerColor }
          fillColor = { 'rgba(230,238,255,0.5)' }
        />}

        {/* Movable create marker */}
        {(locationData && locationData.alertLocation) &&
        <Marker
          // ref={this._createMarkerRef}
          draggable
          coordinate={locationData.alertLocation}
          onDragEnd={async(e) =>
          {
            console.log('OnMarkerDragEnd()');
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
              console.log('   CreateMap SetLocationCommand')
              await this._dataMgr.execute(await new SetLocationCommand({
                newLocation:
                {
                  latitude: e.nativeEvent.coordinate.latitude,
                  longitude: e.nativeEvent.coordinate.longitude
                },
                updateMasterState: (state) => this.setState(state),
                dataVersion: this.state.dataVersion,
                type: 'alert',
              }));
            //}
          }}

          onDragStart={() =>
          {
            // Provides user with feedback that marker is now draggable.
            Vibration.vibrate( 250 );
          }}

          onDrag={async(e) =>
          {
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
          }}
          pinColor={this.props.markerColor}
        />}
      </MapView>
    );
  }

  render()
  {
    console.log('\t CreateMap.render()');
    const data = this._dataMgr.getData('geofenceAreas');
    const locationData = this._dataMgr.getData('location');

    console.log('createmap locationData: ' + JSON.stringify(locationData.alertLocation) );
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
    borderWidth:1,
    borderColor:'#aaa',
    marginLeft:1,
    marginRight:1
  },
  map: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
