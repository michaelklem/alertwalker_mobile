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

import { StackActions } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { DataManager } from '../../manager';
import RadiusField from './radiusField';
import SubmitField from './submitField';
import { hasLocationPermission } from '../../helper/location';
import { Colors } from '../../constant';
import {  AddGeofenceAreaCommand,
          LoadGeofenceAreasCommand } from '../../command/geofence';

export default class Map extends Component
{
  _dataMgr = null;

  constructor(props)
  {
    super(props);
    console.log('\tMap()');
    this._dataMgr = DataManager.GetInstance();
    this.state =
    {
      location: null,
      radius: 500,
      note: '',
      initialMapCoordinate: null,
      hideRadiusOption: true,
      dataVersion: 0
    };
  }

  async componentDidMount()
  {
    console.log('\tMap.componentDidMount()');
    try
    {
      this._isMounted = true;

      // If location not supplied load user's location and set map to that
      if(!this.props.geofenceArea)
      {
        await this.getLocation();
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
    const hasPermission = await hasLocationPermission(this.props.showAlert);
    if(hasPermission)
    {
      this.props.updateMasterState({ isLoading: true });
      Geolocation.getCurrentPosition((position) =>
      {
        this.setState(
        {
          initialMapCoordinate:
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          },
          location:
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
        });
        this.props.updateMasterState({ isLoading: false });
      },
      (error) =>
      {
        this.props.updateMasterState({ isLoading: false });
        this.props.showAlert('Error', `Code ${error.code} ${error.message}`);
        console.log(error);
      },
      {
        accuracy:
        {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        distanceFilter: 0,
        forceRequestLocation: true,
        showLocationDialog: true,
      });
    }
  }

  render()
  {
    console.log('\tMap.render()');
    const data = this._dataMgr.getData('geofenceAreas');
    //console.log(data);

    //console.log(this.state);
    //console.log(this.props);
    return (
      <View
        style={styles.container}
      >
        <View style={[styles.mapContainer, {flex: !this.props.createMode ? 1.0 : (this.state.hideRadiusOption ? 0.9 : 0.8)}]}>
          {(this.state.initialMapCoordinate || this.props.geofenceArea) &&
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={this.state.initialMapCoordinate ? this.state.initialMapCoordinate :
            {
              latitude: this.props.geofenceArea.location.coordinates[1],
              longitude: this.props.geofenceArea.location.coordinates[0],
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >

            {/* Show marker that can be manipulated */
            this.props.createMode &&
            this.state.location &&
            <Circle
              center={this.state.location}
              radius={this.state.radius}
              onRegionChangeComplete={(e) =>
              {
                this.setState(
                {
                  location:
                  {
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude
                  }
                });
              }}
              strokeWidth = { 5 }
              strokeColor = { '#1a66ff' }
              fillColor = { 'rgba(230,238,255,0.5)' }
            />}
            {this.props.createMode &&
            this.state.location &&
            <Marker draggable
              coordinate={this.state.location}
              onDragEnd={(e) =>
              {
                this.setState(
                {
                  location:
                  {
                    latitude: e.nativeEvent.coordinate.latitude,
                    longitude: e.nativeEvent.coordinate.longitude
                  }
                });
              }}
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
                  description={geofenceArea.note}
                  pinColor={"blue"}
                />
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
                pinColor={"blue"}
              />
            </View>}
          </MapView>}
        </View>

        {/* Show actions for create mode */}
        {this.props.createMode &&
        <View style={[styles.actionsContainer, {flex: this.state.hideRadiusOption ? 0.1 : 0.2}]}>
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
                  location: this.state.location,
                  note: this.state.note,
                  radius: this.state.radius
                },
                dataVersion: this.state.dataVersion
              }));
              this.setState({ note: '', radius: 500 });
              this.props.navigation.dispatch(StackActions.pop(1));
            }}
          />
        </View>}

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    width: '100%',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  actionsContainer: {
    width: '100%',
  },
});
