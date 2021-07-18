import React, { Component } from 'react';
import {
  Animated,
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
  ActivityIndicator
} from 'react-native';

import { isPointWithinRadius } from 'geolib';
import { StackActions } from '@react-navigation/native';
import MapView, { AnimatedRegion, Callout, Circle, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Icon from "react-native-vector-icons/MaterialIcons";
import { HeaderHeightContext } from '@react-navigation/stack';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import ActionButton from 'react-native-action-button';

import {  AppManager,
          DataManager,
          HeaderManager,
          LocationManager,
          NotificationManager
        } from '../../manager';
import SubmitField from './submitField';
import CreateAlertButtons from './createAlertButtons';
import CreateMap from './createMap';
import { ImageModal } from '../imageModal';
import { Colors } from '../../constant';
import {  AddGeofenceAreaCommand,
          LoadGeofenceAreasCommand } from '../../command/geofence';
import { GetLocationCommand, SetLocationCommand } from '../../command/location';
import {  MenuTrigger,
          MenuProvider,
          Menu,
          MenuOptions,
          MenuOption,
          renderers
        } from '../contextMenu';
import { BottomSheet } from '../bottomSheet';
import {DEFAULT_LAT_DELTA, DEFAULT_LNG_DELTA, MARKER_DEFAULT_COLOR} from '../../constant/App'

// MARK: - Constants
const RADIUS_SIZE = 500
const MENU_NAME = 'alert-type-menu';

const { width, height } = Dimensions.get('window');

export default class Map extends Component
{
  // MARK: - Data fields
  // Managers
  _dataMgr = null;
  _headerMgr = null;
  _notificationMgr = null;
  // Refs
  // _mapViewRef = null;
  _bottomSheetRef = null;
  // Keyboard related
  _keyboardIsShowing = false;
  _keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
  _keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  // Map view related
  // _mapCreateLastGoodPosition = null;
  // The number of decimal places a longitude or latitude must change in order for an update to be processed
  // prevents map from repeatedly updating
  _threshold = 2;
  // Bottom sheet related
  _draggedValue = new Animated.Value(0);
  _heights =
  {
    minBottomSheetHeight: 0,
    maxBottomSheetHeight: Math.round(Dimensions.get('window').height),
  };
  // Used for header manager observer
  _id = '';


  // MARK: - Constructor
  constructor(props)
  {
    super(props);
    console.log('\tMap()');
    this._dataMgr = DataManager.GetInstance();
    this._headerMgr = HeaderManager.GetInstance();
    this._notificationMgr = NotificationManager.GetInstance();

    this.state =
    {
      radius: RADIUS_SIZE,
      note: '',
      image: null,
      type: null,
      submitIsEnabled: true,
      menuIsOpen: false,
      choosingLocation: true, // Display map by default
      imageModal:
      {
        image: null,
        isOpen: false
      },
      dataVersion: 0,
      userLatDelta: 0.0200,
      userLngDelta: 0.0200
    };


    this._id = this.props.createMode ? 'create-map' : 'view-map';

    // this._mapViewRef = React.createRef();
    this._bottomSheetRef = React.createRef();
  }

  async componentWillUnmount()
  {
    // Remove observers
    LocationManager.GetInstance().removeListener('map');
    this._dataMgr.removeObserver('map');
    this._headerMgr.removeListener(this._id);
  }

  async componentDidMount()
  {
    console.log('\tMap.componentDidMount()');
    console.log(this.props);

    // Setup observers
    LocationManager.GetInstance().addListener('map', this.onLocation);

    this._dataMgr.addObserver(() =>
    {
      this.refresh();
    },
    'map',
    'geofenceAreas');

    this._headerMgr.addListener(this._id, async (side) =>
    {
      console.log('\tMap.HeaderManagerListener: ' + side);
      if(side === 'left')
      {
        console.log(this.props);
        // Exit notification viewing
        if(this.props.geofenceArea)
        {
          this.props.navigation.dispatch(StackActions.pop(1));
          console.log('Pop');
        }
        // Exit create mode
        else
        {
          this._headerMgr.setIsCreateMode(false);
          this._bottomSheetRef.current.hide();
          console.log('change it here') //666
          await this.getLocation();
        }
      }
      else if(side === 'right')
      {
        this.createAlert();
      }
    });

    try
    {
      this._isMounted = true;

      // If location not supplied load user's location and set map to that
      if(!this.props.geofenceArea)
      {
        const locationData = this._dataMgr.getData('location');
        console.log('component map locationData: ' + JSON.stringify(locationData) );
        if(!locationData || !locationData.mapLocation)
        {
          await this.getLocation();
        }
        else
        {
          await this.loadData();
        }
      }
      else
      {
        console.log('component map being set to notifcation location')
        await this.loadData();
      }
    }
    catch(err)
    {
      console.log(err);
    }
  }


  // MARK: - Keyboard related
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

  // MARK: - API related
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
    console.log('\tMap.getLocation()');
    await this._dataMgr.execute(await new GetLocationCommand(
    {
      updateMasterState: (state) => this.setState(state),
      setLoading: (isLoading) => this.props.updateMasterState({ isLoading: isLoading }),
      dataVersion: this.state.dataVersion,
      successCb: () =>
      {
        this.loadData();
      }
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

  createAlert = async() =>
  {
    if(this.state.submitIsEnabled)
    {
      this.setState({ submitIsEnabled: false }, async() =>
      {
        const locationData = this._dataMgr.getData('location');

        let image = {};
        if(this.state.image)
        {
          image =
          {
            uri: this.state.image.uri,
            name: this.state.image.fileName ? this.state.image.fileName : 'alert-image',
            type: this.state.image.type,
            path: this.state.image.uri,
            fileName: this.state.image.fileName ? this.state.image.fileName : 'alert-image'
          };
        }

        const dataSet = await this._dataMgr.execute(await new AddGeofenceAreaCommand({
          updateMasterState: (state) => this.props.updateMasterState(state),
          updateDataVersion: (dataVersion) => this.setState({ dataVersion: dataVersion }),
          setLoading: (isLoading) => this.props.updateMasterState({ isLoading: isLoading }),
          showAlert: this.props.showAlert,
          data:
          {
            location: locationData.alertLocation,
            note: this.state.note,
            radius: this.state.radius,
            image: image,
            type: this.state.type._id.toString(),
          },
          dataVersion: this.state.dataVersion
        }));
        this.setState({ submitIsEnabled: true });

        if(dataSet)
        {
          this.setState({ note: '', radius: RADIUS_SIZE, /*choosingLocation: false,*/ image: null }, () =>
          {
            this._bottomSheetRef.current.hide();
            this._headerMgr.setIsCreateMode(false);
          });
        }
      });
    }
    return true;
  }

  // MARK: - Renders
  renderAllAlerts = (data) =>
  {
    return (
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
            strokeColor = { geofenceArea.type.color }
            fillColor = { 'rgba(230,238,255,0.5)' }
          />
          <Marker
            coordinate={
            {
              latitude: geofenceArea.location.coordinates[1],
              longitude: geofenceArea.location.coordinates[0]
            }}
            pinColor={geofenceArea.type.color}
          >
            <Callout
              tooltip={true}
              style={styles.callout}
              onPress={() =>
              {
                console.log('OnPress');
                // Display image if there
                if(geofenceArea.image)
                {
                  const tempImageModal = {...this.state.imageModal};
                  tempImageModal.image = geofenceArea.image;
                  tempImageModal.isOpen = true;
                  this.setState({ imageModal: tempImageModal });
                }
              }}
            >
              <Text style={styles.description}>{geofenceArea.note}</Text>
              {geofenceArea.image &&
              <Text style={styles.subDescription}>{('(tap to view image)')}</Text>}
            </Callout>
          </Marker>
        </View>
        );
      })
    );
  }

  // Not used, this was an early implementation of the floating action button
  renderAlertMenu = () =>
  {
    return (
      <Menu
        onSelect={(selection) =>
        {
          this._bottomSheetRef.current.show();
          this._headerMgr.setIsCreateMode(true);
          //console.log(selection);
        }}
        name={MENU_NAME}
        onClose={() => this.setState({ menuIsOpen: false })}
        onOpen={() => this.setState({ menuIsOpen: true })}
        renderer={renderers.SlideInMenu}
      >
        <MenuTrigger
          style={styles.createBtn}
        >
          <Icon
            name={this.state.menuIsOpen ? 'cancel' : 'add-circle'}
            size={h50}
            color={Colors.black}
          />
        </MenuTrigger>
        <MenuOptions
          optionsContainerStyle={styles.menuContainer}
        >
          <MenuOption value={'alert'}>
            <Text style={styles.menuOptionText}>Alert</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    );
  }

  // This is the floating action button
  renderAlertMenu2 = () =>
  {
    let geofenceAreaTypes = this._notificationMgr.getGeofenceAreaTypes();
    console.log(geofenceAreaTypes);

    // for now just show the original alert type 
    let useSecondAlertType = AppManager.GetInstance().getUseSecondAlertType()
    if (useSecondAlertType === 'false') {
      // only use the first alert which is the original one
      geofenceAreaTypes = geofenceAreaTypes.filter(function( element, index ) {
        return index === 0
      })
    }
    
    return (
      <ActionButton buttonColor={MARKER_DEFAULT_COLOR}>
        {geofenceAreaTypes &&
        geofenceAreaTypes.map( (geofenceAreaType, i) =>
        {
          return (
            <ActionButton.Item
              key={`action-btn-${i}`}
              buttonColor={geofenceAreaType.color}
              textContainerStyle={styles.fabItemContainerStyle}
              textStyle={styles.fabItemStyle}
              title={`New ${geofenceAreaType.label}`}
              size={40}
              onPress={() =>
              {
                this._bottomSheetRef.current.show();
                this._headerMgr.setIsCreateMode(true);
                this.setState({ type: geofenceAreaType });
              }}
            >
              <Icon
                name={geofenceAreaType.iconName}
                style={styles.createBtn2}
              />
            </ActionButton.Item>
          )
        })}
      </ActionButton>
    );
  }

  renderMapView = (data, locationData) =>
  {
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
          console.log('Component Map.onRegionChangeComplete() new region: ' + JSON.stringify(region) );
          // const window = Dimensions.get('window');
          // const { width, height }  = window
          // const LATITUD_DELTA = 0.0922
          // const LONGITUDE_DELTA = LATITUD_DELTA + (width / height)
          // console.log('Component Map.onRegionChangeComplete() new LONGITUDE_DELTA: ' + LONGITUDE_DELTA );
          // this.setState({ userLngDelta: LONGITUDE_DELTA })


          // let { width, height } = Dimensions.get('window')
          // const ASPECT_RATIO = width / height
          // const LATITUDE_DELTA = region.latitudeDelta //0.01104
          // const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
          // console.log('Component Map.onRegionChangeComplete() new LATITUDE_DELTA: ' + LATITUDE_DELTA);
          // console.log('Component Map.onRegionChangeComplete() new LONGITUDE_DELTA: ' + LONGITUDE_DELTA);
          // this.setState({ userLatDelta: LATITUDE_DELTA, userLngDelta: LONGITUDE_DELTA })


          // this will force the marker to always be re-centered.
          // this.setState({ userLatDelta: region.latitudeDelta, userLngDelta: region.longitudeDelta })

          // if( region.latitude.toFixed(this._threshold) !== locationData.mapLocation.latitude.toFixed(this._threshold) ||
          //     region.longitude.toFixed(this._threshold) !== locationData.mapLocation.longitude.toFixed(this._threshold) ||
          //     region.latitudeDelta.toFixed(this._threshold) !== locationData.mapLocation.latitudeDelta.toFixed(this._threshold) ||
          //     region.longitudeDelta.toFixed(this._threshold) !== locationData.mapLocation.longitudeDelta.toFixed(this._threshold))
          // {
          //   console.log('   Component Map SetLocationCommand')
          //   await this._dataMgr.execute(await new SetLocationCommand({
          //     newLocation: region,
          //     updateMasterState: (state) => this.setState(state),
          //     dataVersion: this.state.dataVersion,
          //     type: 'map',
          //   }));
          // }
        }}

        // if there is an alert data, we show the map there, otherewise we show the map at the users location
        region={(this.props.geofenceArea) ?
        {
          latitude: this.props.geofenceArea.location.coordinates[1],
          longitude: this.props.geofenceArea.location.coordinates[0],
          latitudeDelta: DEFAULT_LAT_DELTA, // force the marker to be zoomed in
          longitudeDelta: DEFAULT_LNG_DELTA,
        }
        :
        {
          latitude: locationData.userLocation.latitude,
          longitude: locationData.userLocation.longitude,
          latitudeDelta: DEFAULT_LAT_DELTA,
          longitudeDelta: DEFAULT_LNG_DELTA,
        }
        }

        showsUserLocation={true}
        showsMyLocationButton={true}
        moveOnMarkerPress={false}
        scrollEnabled={true}
        rotateEnabled={true}
        zoomEnabled={true}
        zoomTapEnabled={false}
        zoomControlEnabled={false}
        pitchEnabled={true}
      >

        {/* Show all markers */
        !this.props.geofenceArea &&
        data &&
        data.geofenceAreas &&
        this.renderAllAlerts(data)}

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
            strokeColor = { this.props.geofenceArea.type.color }
            fillColor = { 'rgba(230,238,255,0.5)' }
          />
          <Marker
            coordinate={
            {
              latitude: this.props.geofenceArea.location.coordinates[1],
              longitude: this.props.geofenceArea.location.coordinates[0]
            }}
            description={this.props.geofenceArea.note}
            pinColor={this.props.geofenceArea.type.color}
          >
            <Callout
              tooltip={true}
              style={styles.callout}
              onPress={() =>
              {
                // console.log('OnPress');
                // Display image if there
                if(this.props.geofenceArea.image)
                {
                  const tempImageModal = {...this.state.imageModal};
                  tempImageModal.image = this.props.geofenceArea.image;
                  tempImageModal.isOpen = true;
                  this.setState({ imageModal: tempImageModal });
                }
              }}
            >
              <Text style={styles.description}>{this.props.geofenceArea.note}</Text>
              {this.props.geofenceArea.image &&
              <Text style={styles.subDescription}>{('(tap to view image)')}</Text>}
            </Callout>
          </Marker>
        </View>}
      </MapView>
    );
  }

  renderBottomSheet = (data, locationData, headerHeight) =>
  {
    // console.log('xxxxxxxx locationData: ' + JSON.stringify(locationData) );
    //console.log('Max bottom sheet height: ' + this._heights.maxBottomSheetHeight);
    return (
      <BottomSheet
        ref={this._bottomSheetRef}
        draggableRange={{
          top: this._heights.maxBottomSheetHeight - (headerHeight + h10),
          bottom: this._heights.minBottomSheetHeight,
        }}
        animatedValue={this._draggedValue}
        snappingPoints={[360]}
        height={this._heights.maxBottomSheetHeight}
        friction={0.5}
        containerStyle={styles.createModalContainer}
        allowDragging={false}
      >
        {/* Actions for create mode */}
        <TouchableWithoutFeedback
          style={[styles.actionsContainer]}
          onPress={() => Keyboard.dismiss()}
        >
          <SubmitField
            note={this.state.note}
            updateMasterState={(id, val) =>
            {
              this.setState({ note: val });
            }}
            showAlert={this.props.showAlert}
          />
          <CreateAlertButtons
            onPress1={() =>
            {
              console.log(`[Debug] Current location: ${JSON.stringify(locationData.alertLocation)}` )
              Keyboard.dismiss();
              this.setState({ choosingLocation: !this.state.choosingLocation });
            }}
            isShowingLocation={this.state.choosingLocation}
            location={locationData.alertLocation}
            onPress2={() =>
            {
              Keyboard.dismiss();
            }}
            updateMasterState={(val) =>
            {
              this.setState({ image: val });
            }}
            showAlert={this.props.showAlert}
          />


          {/* Choose location map view */}
          {this.state.choosingLocation &&
          this.renderCreateMap()}
        </TouchableWithoutFeedback>
      </BottomSheet>
    );
  }

  renderCreateMap = () =>
  {
    console.log(this.state.type);
    return (
      <CreateMap
        //ref={this._componentRef}
        updateMasterState={(state) => this.setState(state)}
        showAlert={this.props.showAlert}
        navigation={this.props.navigation}
        markerColor={this.state.type ? this.state.type.color : MARKER_DEFAULT_COLOR}
      />
    );
  }

  renderImageModal = () =>
  {
    return (
      <ImageModal
        imageSrc={this.state.imageModal.image}
        onClose={() =>
        {
          let tempModal = {...this.state.imageModal};
          tempModal.isOpen = false;
          tempModal.image = null;
          this.setState({ imageModal: tempModal });
        }}
      />
    );
  }

  render()
  {
    console.log('\t Component Map.render()');
    const data = this._dataMgr.getData('geofenceAreas');
    const locationData = this._dataMgr.getData('location');

    // console.log('   window dimensions: ' + Dimensions.get('window'));
    console.log('   locationData: ' + JSON.stringify(locationData) );
    console.log('   geofence data: ' + JSON.stringify(data) );

    return (
    <HeaderHeightContext.Consumer>
    {headerHeight =>
      (
      <MenuProvider>
        <KeyboardAvoidingView style={styles.container}>
            {/* Main map */}
            <View style={[styles.mapContainer]}>
              {((locationData && locationData.mapLocation) || this.props.geofenceArea) &&
              this.renderMapView(data, locationData)}

              {/* Create alert screen */}
              {this.renderBottomSheet(data, locationData, headerHeight)}

              {/* Image modal */}
              {this.state.imageModal.isOpen &&
              this.renderImageModal()}

              {/* Add alert button & menu */}
              {this.props.createMode &&
              this.renderAlertMenu2()}

          </View>
        </KeyboardAvoidingView>
      </MenuProvider>
      )}
    </HeaderHeightContext.Consumer>
    );
  }
}

const h100 = Math.round(Dimensions.get('window').height * 0.1282);
const h90 = Math.round(Dimensions.get('window').height * 0.9);
const h80 = Math.round(Dimensions.get('window').height * 0.8);
const h78 = Math.round(Dimensions.get('window').height * 0.1);
const h50 = Math.round(Dimensions.get('window').height * 0.064);
const h25 = Math.round(Dimensions.get('window').height * 0.0320);
const h18 = Math.round(Dimensions.get('window').height * 0.023);
const h16 = Math.round(Dimensions.get('window').height * 0.0205);
const h14 = Math.round(Dimensions.get('window').height * 0.0179);
const h10 = Math.round(Dimensions.get('window').height * 0.01282);

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
  actionsContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.white,
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
    fontSize: h14,
    lineHeight: h18,
    flex: 1,
  },
  description: {
    color: "#707070",
    fontSize: h14,
    lineHeight: h16,
    flex: 1,
  },
  subDescription: {
    color: "#707070",
    fontSize: h10,
    lineHeight: h16,
    flex: 1,
  },
  createBtn: {
    position: 'absolute',
    bottom: h25,
    right: h25,
    width: h50,
    height: h50,
    zIndex: 102,
  },
  createBtn2: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  menuContainer: {
    backgroundColor: Colors.transparent,
    width: 100,
    height: 100,
    position: 'absolute',
    right: h25,
  },
  menuOptionText: {
    fontFamily: 'Arial',
    fontSize: h18,
    textAlign: 'center',
    color: Colors.black,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: Colors.black,
  },
  createModalContainer: {
    backgroundColor: Colors.plainGray5
  },
  fabItemContainerStyle: {
    backgroundColor: MARKER_DEFAULT_COLOR,
  },
  fabItemStyle: {
    backgroundColor: MARKER_DEFAULT_COLOR,
    color: 'white'
  }
});
