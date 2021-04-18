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
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';

import { isPointWithinRadius } from 'geolib';
import { StackActions } from '@react-navigation/native';
import MapView, { Callout, Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { AppManager, DataManager, LocationManager } from '../../manager';
import RadiusField from './radiusField';
import SubmitField from './submitField';
import { Colors } from '../../constant';
import {  AddGeofenceAreaCommand,
          LoadGeofenceAreasCommand } from '../../command/geofence';
import { GetLocationCommand, SetLocationCommand } from '../../command/location';

export default class Map extends Component
{
  _dataMgr = null;
  _mapViewRef = null;
  _createMarkerRef = null;
  _keyboardIsShowing = false;
  _keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
  _keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  _mapCreateLastGoodPosition = null;
  _threshold = 2;

  constructor(props)
  {
    super(props);
    console.log('\tMap()');
    this._dataMgr = DataManager.GetInstance();
    this.state =
    {
      radius: 500,
      note: '',
      hideRadiusOption: true,
      // Disabled this to use map restriction instead
      //mapCreateRadius: AppManager.GetInstance().getMapCreateRadius(),
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
  }

  async componentDidMount()
  {
    console.log('\tMap.componentDidMount()');

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
        console.log(locationData);
        if(!locationData || !locationData.mapLocation)
        {
          await this.getLocation();
        }
        // Load current location when adding new alert
        else if(this.props.createMode)
        {
          await this.getLocation();
        }
      }

      if(!this.props.createMode && !this.props.geofenceArea)
      {
        await this.loadData();
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

  loadData = async(isRefreshing) =>
  {
    console.log('\tMap.loadData()');
    return await this._dataMgr.execute(await new LoadGeofenceAreasCommand(
    {
      updateMasterState: (state) => this.setState(state),
      dataVersion: this.state.dataVersion
    }));
  }

  getLocation = async() =>
  {
    await this._dataMgr.execute(await new GetLocationCommand(
    {
      updateMasterState: (state) => this.setState(state),
      setLoading: (isLoading) => this.props.updateMasterState({ isLoading: isLoading }),
      dataVersion: this.state.dataVersion
    }));

    // Set map location to use delta configuration if create mode
    if(this.props.createMode)
    {
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

  render()
  {
    console.log('\tMap.render()');
    const data = this._dataMgr.getData('geofenceAreas');
    const locationData = this._dataMgr.getData('location');

    console.log(locationData.alertLocation);
    console.log(this._mapCreateLastGoodPosition);

    return (
    <KeyboardAvoidingView style={styles.container}>
      <KeyboardAwareScrollView
        contentContainerStyle={{flexGrow: 1}}
        keyboardShouldPersistTaps={'always'}
      >
        {/* Show actions for create mode */}
        {this.props.createMode &&
        <View style={[styles.actionsContainer, {height: h10}]}>
          {!this.state.hideRadiusOption &&
          <RadiusField
            radius={this.state.radius}
            updateMasterState={(state) => this.setState(state)}
          />}
          <SubmitField
            messageText={this.state.note}
            updateMasterState={(id, val) =>
            {
              this.setState({ note: val });
            }}
            submit={async() =>
            {
              const dataSet = await this._dataMgr.execute(await new AddGeofenceAreaCommand({
                updateMasterState: (state) => this.setState(state),
                showAlert: this.props.showAlert,
                data:
                {
                  location: locationData.alertLocation,
                  note: this.state.note,
                  radius: this.state.radius
                },
                dataVersion: this.state.dataVersion
              }));
              if(dataSet)
              {
                this.setState({ note: '', radius: 500 });
                this.props.navigation.dispatch(StackActions.pop(1));
              }
            }}
          />
        </View>}

        {/* Main map */}
        <View style={[styles.mapContainer, {height: !this.props.createMode ? h100 : h80}]}>
          {((locationData && locationData.mapLocation) || this.props.geofenceArea) &&
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
              console.log('Map.onRegionChangeComplete()');
              console.log(region.latitude.toFixed(this._threshold) + ' == ' + locationData.mapLocation.latitude.toFixed(this._threshold));
              console.log(region.longitude.toFixed(this._threshold) + ' == ' + locationData.mapLocation.longitude.toFixed(this._threshold));
              console.log(region.latitudeDelta.toFixed(this._threshold) + ' == ' + locationData.mapLocation.latitudeDelta.toFixed(this._threshold));
              if( region.latitude.toFixed(this._threshold) !== locationData.mapLocation.latitude.toFixed(this._threshold) ||
                  region.longitude.toFixed(this._threshold) !== locationData.mapLocation.longitude.toFixed(this._threshold) ||
                  region.latitudeDelta.toFixed(this._threshold) !== locationData.mapLocation.latitudeDelta.toFixed(this._threshold) ||
                  region.longitudeDelta.toFixed(this._threshold) !== locationData.mapLocation.longitudeDelta.toFixed(this._threshold))
              {
                await this._dataMgr.execute(await new SetLocationCommand({
                  newLocation: region,
                  updateMasterState: (state) => this.setState(state),
                  dataVersion: this.state.dataVersion,
                  type: 'map',
                }));
              }
            }}
            region={(locationData && locationData.mapLocation) ? locationData.mapLocation :
            {
              latitude: this.props.geofenceArea.location.coordinates[1],
              longitude: this.props.geofenceArea.location.coordinates[0],
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}

            scrollEnabled={!this.props.createMode}
            rotateEnabled={!this.props.createMode}
            zoomEnabled={!this.props.createMode}
            zoomTapEnabled={!this.props.createMode}
            zoomControlEnabled={!this.props.createMode}
            pitchEnabled={!this.props.createMode}
          >

            { /* Create marker bounds (Disabled this for now, instead will restrict map view itself )*/}
            {this.props.createMode &&
            false &&
            (locationData && locationData.userLocation) &&
            <Circle
              center={locationData.userLocation}
              radius={this.state.mapCreateRadius}
              strokeWidth={5}
              strokeColor={'#E74C3C'}
              fillColor={'rgba(231, 76, 60,0.5)'}
            />}

            {/* Create marker moveable circle */}
            {this.props.createMode &&
            (locationData && locationData.alertLocation) &&
            <Circle
              center={locationData.alertLocation}
              radius={this.state.radius}
              onRegionChangeComplete={async(e) =>
              {
                console.log('Circle.onRegionChangeComplete()');
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
                return true;
              }}
              strokeWidth = { 5 }
              strokeColor = { '#1a66ff' }
              fillColor = { 'rgba(230,238,255,0.5)' }
            />}

            {/* Movable create marker */}
            {this.props.createMode &&
            (locationData && locationData.alertLocation) &&
            <Marker
              ref={this._createMarkerRef}
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
                  */await this._dataMgr.execute(await new SetLocationCommand({
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
              pinColor={"green"}
            />}

            {/* Show all markers */
            !this.props.createMode &&
            !this.props.geofenceArea &&
            data &&
            data.geofenceAreas &&
            data.geofenceAreas.map( (geofenceArea, i) =>
            {
              return (
              <View key={`geofencearea-${geofenceArea._id.toString()}`}>
                <Circle
                  center={
                  {
                    latitude: geofenceArea.location.coordinates[1],
                    longitude: geofenceArea.location.coordinates[0]
                  }}
                  radius={geofenceArea.radius}
                  strokeWidth = { 5 }
                  strokeColor = { '#1a66ff' }
                  fillColor = { 'rgba(230,238,255,0.5)' }
                />
                <Marker
                  coordinate={
                  {
                    latitude: geofenceArea.location.coordinates[1],
                    longitude: geofenceArea.location.coordinates[0]
                  }}
                  pinColor={"red"}
                >
                  <Callout
                    tooltip={true}
                    style={styles.callout}
                  >
                    <Text style={styles.description}>{geofenceArea.note}</Text>
                  </Callout>
                </Marker>
              </View>
              );
            })}

            {/* Show one location (for notification) */}
            {this.props.geofenceArea &&
            <View>
              <Circle
                center={
                {
                  latitude: this.props.geofenceArea.location.coordinates[1],
                  longitude: this.props.geofenceArea.location.coordinates[0]
                }}
                radius={this.props.geofenceArea.radius}
                strokeWidth = { 5 }
                strokeColor = { '#1a66ff' }
                fillColor = { 'rgba(230,238,255,0.5)' }
              />
              <Marker
                coordinate={
                {
                  latitude: this.props.geofenceArea.location.coordinates[1],
                  longitude: this.props.geofenceArea.location.coordinates[0]
                }}
                description={this.props.geofenceArea.note}
                pinColor={"red"}
              >
                <Callout
                  tooltip={true}
                  style={styles.callout}
                >
                  <Text style={styles.description}>{this.props.geofenceArea.note}</Text>
                </Callout>
              </Marker>
            </View>}
          </MapView>}
        </View>

      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
    );
  }
}

const h100 = Math.round(Dimensions.get('window').height);
const h90 = Math.round(Dimensions.get('window').height * 0.9);
const h80 = Math.round(Dimensions.get('window').height * 0.8);
const h10 = Math.round(Dimensions.get('window').height * 0.1);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    width: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  actionsContainer: {
    width: '100%',
  },
  callout: {
    backgroundColor: "white",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    padding: 4
  },
  title: {
    color: "black",
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  description: {
    color: "#707070",
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  }
});
