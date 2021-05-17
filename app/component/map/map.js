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

import { AppManager, DataManager, HeaderManager, LocationManager } from '../../manager';
import SubmitField from './submitField';
import LocationField from './locationField';
import CreateMap from './createMap';
import ImageField from './imageField';
import { ImageButton } from '../imageButton';
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

// MARK: - Constants
const RADIUS_SIZE = 500
const MENU_NAME = 'alert-type-menu';

export default class Map extends Component
{
  // MARK: - Data fields
  // Managers
  _dataMgr = null;
  _headerMgr = null;
  // Refs
  _mapViewRef = null;
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

    this.state =
    {
      radius: RADIUS_SIZE,
      note: '',
      image: null,
      submitIsEnabled: true,
      menuIsOpen: false,
      choosingLocation: false,
      imageModal:
      {
        image: null,
        isOpen: false
      },
      dataVersion: 0
    };

    this._id = this.props.createMode ? 'create-map' : 'view-map';

    this._mapViewRef = React.createRef();
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

    this._headerMgr.addListener(this._id, (side) =>
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
        //console.log(locationData);
        if(!locationData || !locationData.mapLocation)
        {
          await this.getLocation();
        }

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
    await this._dataMgr.execute(await new GetLocationCommand(
    {
      updateMasterState: (state) => this.setState(state),
      setLoading: (isLoading) => this.props.updateMasterState({ isLoading: isLoading }),
      dataVersion: this.state.dataVersion
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
          },
          dataVersion: this.state.dataVersion
        }));
        this.setState({ submitIsEnabled: true });

        if(dataSet)
        {
          this.setState({ note: '', radius: RADIUS_SIZE, choosingLocation: false, image: null }, () =>
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
    return (
      <ActionButton buttonColor="rgba(231,76,60,1)">
        <ActionButton.Item
          buttonColor='#9b59b6'
          title="New Alert"
          onPress={() =>
          {
            this._bottomSheetRef.current.show();
            this._headerMgr.setIsCreateMode(true);
          }}
        >
          <Icon
            name="notifications-active"
            size={h50}
            style={styles.createBtn2}
          />
        </ActionButton.Item>
      </ActionButton>
    );
  }

  renderMapView = (data, locationData) =>
  {
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
          console.log('Map.onRegionChangeComplete()');
          //console.log(region.latitude.toFixed(this._threshold) + ' == ' + locationData.mapLocation.latitude.toFixed(this._threshold));
          //console.log(region.longitude.toFixed(this._threshold) + ' == ' + locationData.mapLocation.longitude.toFixed(this._threshold));
          //console.log(region.latitudeDelta.toFixed(this._threshold) + ' == ' + locationData.mapLocation.latitudeDelta.toFixed(this._threshold));
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
        moveOnMarkerPress={false}
        scrollEnabled={true}
        rotateEnabled={true}
        zoomEnabled={true}
        zoomTapEnabled={true}
        zoomControlEnabled={true}
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
              onPress={() =>
              {
                console.log('OnPress');
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
            </Callout>
          </Marker>
        </View>}
      </MapView>
    );
  }

  renderBottomSheet = (data, locationData, headerHeight) =>
  {
    //console.log('HeaderHeight: ' + headerHeight);
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
          <LocationField
            showAlert={this.props.showAlert}
            onPress={() =>
            {
              console.log(`[Debug] Current location: ${JSON.stringify(locationData.alertLocation)}` )
              Keyboard.dismiss();
              this.setState({ choosingLocation: !this.state.choosingLocation });
            }}
            isShowingLocation={this.state.choosingLocation}
            location={locationData.alertLocation}
          />
          <ImageField
            onPress={() =>
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
    return (
      <CreateMap
        ref={this._componentRef}
        updateMasterState={(state) => this.setState(state)}
        showAlert={this.props.showAlert}
        navigation={this.props.navigation}
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
    console.log('\tMap.render()');
    const data = this._dataMgr.getData('geofenceAreas');
    const locationData = this._dataMgr.getData('location');

    //console.log(Dimensions.get('window'));
    //console.log('locationData: ' + JSON.stringify(locationData.alertLocation) );
    //console.log(this._mapCreateLastGoodPosition);

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
  }
});
