import React, { Component } from 'react';
import {
  Switch,
  StyleSheet,
  SafeAreaView,
  Image,
  View,
  Text,
  Dimensions,
  Alert,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {
  TouchableOpacity,
} from 'react-native-gesture-handler';
import {Button} from 'react-native-elements';

import { AppText, Colors, Styles } from '../../../constant';
import { DataManager, NotificationManager } from '../../../manager';
import { UpdateNotificationPreferencesCommand } from '../../../command/notification';

export default class SettingsPage extends Component
{
  _notificationMgr = null;
  _dataMgr = null;
  _isMounted = false;

  // MARK: - Constructor
  constructor(props)
  {
    console.log('Settings()');
    super(props);

    this._notificationMgr = NotificationManager.GetInstance();
    this._dataMgr = DataManager.GetInstance();

    this.state =
    {
      isLoading: false,
      eventSubscriptions: this._notificationMgr.getEventSubscriptions(),
      dataVersion: 0,
    };
  }

  async componentDidMount()
  {

  }


  shouldComponentUpdate(nextProps, nextState)
  {
    return (
      this.state.isLoading !== nextState.isLoading ||
      this.state.eventSubscriptions !== nextState.eventSubscriptions ||
      this.state.dataVersion !== nextState.dataVersion
    );
  }

  // MARK: - Render
  render()
  {
    console.log('Settings.render()');
    const geofenceAreaTypes = this._notificationMgr.getGeofenceAreaTypes();

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
        <View style={styles.container}>

          {/* Switches */}
          {this.state.eventSubscriptions &&
          this.state.eventSubscriptions.map( (subscription, i) =>
          {
            const geofenceAreaType = geofenceAreaTypes.filter( (area => area._id.toString() === subscription.trigger.geofenceAreaType));
            return (
              <View
                style={styles.setting}
                key={`settings-toggle-${i}`}
              >
                <Text align='left'>{geofenceAreaType.length > 0 ? geofenceAreaType[0].label : ''}</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  thumbColor={subscription.isDeleted ? Colors.plainGray3 : Colors.alertWalkerOrange}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() =>
                  {
                    const eventSubscriptions = [...this.state.eventSubscriptions];
                    eventSubscriptions[i].isDeleted = !eventSubscriptions[i].isDeleted;
                    this.setState({ eventSubscriptions: eventSubscriptions });
                  }}
                  value={!subscription.isDeleted}
                />
              </View>
            )
          })}

          {/* Save button */}
          <TouchableOpacity
            style={styles.saveButtonContainer}
            onPress={async() =>
            {
              await this._dataMgr.execute(await new UpdateNotificationPreferencesCommand(
              {
                updateMasterState: (state) => this.setState(state),
                dataVersion: this.state.dataVersion,
                eventSubscriptions: this.state.eventSubscriptions,
              }));

              /* Notify data manager observers that geofence areas dataset changed,
                Because UpdateNotificationPreferencesCommand will also reload the geofence areas so the
                new notification preferences take affect
              */
              this._dataMgr.dataSetUpdated('geofenceAreas');

              ToastAndroid.showWithGravity("Settings updated", ToastAndroid.SHORT, ToastAndroid.BOTTOM);
            }}
          >
            <Button
              title='Save'
              buttonStyle={{
                backgroundColor: 'green',
              }}
            />
          </TouchableOpacity>

        </View>
      </LinearGradient>
    );
  }
}


const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const h22 = Math.round(Dimensions.get('window').height * 0.0282);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.white,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  setting: {
    flexDirection: 'row',
  },
  saveText: {
    height: Math.round(Dimensions.get('window').height * 0.04),
    fontSize: h22,
    textAlign: 'center',
    color: Colors.black,
  },
});
