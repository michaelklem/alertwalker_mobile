import { Alert, Platform } from 'react-native';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import { getUniqueId } from 'react-native-device-info';
import AppJson from '../../app.json';
import DataManager from './dataManager';
import { SetLocationCommand } from '../command/location';

export default class LocationManager
{
  static singleton = null;
  #listeners = [];
  #dataMgr = null;

  // Singleton
  /**
    @returns {LocationManager}
   */
  static GetInstance()
  {
    // Initialize
    if(LocationManager.singleton == null)
    {
      LocationManager.singleton = new LocationManager();
      LocationManager.singleton.#dataMgr = DataManager.GetInstance();
    }
    return LocationManager.singleton;
  }

  // Singleton
  /**
    @returns {LocationManager}
   */
  static async GetInstanceA(token)
  {
    // Initialize
    if(LocationManager.singleton == null)
    {
      LocationManager.singleton = new LocationManager();
      LocationManager.singleton.#dataMgr = DataManager.GetInstance();
      await LocationManager.singleton.init(token);
    }
    return LocationManager.singleton;
  }

  async init(token)
  {
    const httpHeaders =
    {
      'x-access-token': 	token,
      'x-device-id':			getUniqueId(),
      'x-request-source': 'mobile',
      'x-device-service-name': `${Platform.select(
      {
        ios: 'ios',
        android: 'android',
        default: 'android'
      })}`,
      'x-device-service-version': `${parseInt(Platform.Version)}`
    };
    console.log(httpHeaders);
    try
    {
      BackgroundGeolocation.configure(
      {
        desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
        stationaryRadius: 50,
        distanceFilter: 50,
        notificationTitle: 'Background tracking',
        notificationText: 'enabled',
        debug: false,
        startOnBoot: false,
        stopOnTerminate: false,
        locationProvider: Platform.select({
          ios: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER,
          android: BackgroundGeolocation.ACTIVITY_PROVIDER,
          default: BackgroundGeolocation.DISTANCE_FILTER_PROVIDER
        }),
        interval: 15000,
        fastestInterval: 10000,
        activitiesInterval: 15000,
        stopOnStillActivity: false,
        url: AppJson.backendUrl + 'location/geofence',
        httpHeaders: httpHeaders,
        // customize post properties
        postTemplate:
        {
          latitude: '@latitude',
          longitude: '@longitude',
          time: '@time',
          accuracy: '@accuracy'
        }
      });

      BackgroundGeolocation.on('location', async(location) =>
      {
        const locationData = this.#dataMgr.getData('location');
        
        // check for valid data.
        if (locationData === {} || typeof locationData.userLocation === 'undefined' ) return

        if( location.latitude !== locationData.userLocation.latitude ||
            location.longitude !== locationData.userLocation.longitude)
        {
          console.log('   BackgroundGeolocation SetLocationCommand: ' + location.latitude + ' vs ' + locationData.userLocation.latitude )
          console.log('   BackgroundGeolocation SetLocationCommand2: ' + location.longitude + ' vs ' + locationData.userLocation.longitude )
          await this.#dataMgr.execute(await new SetLocationCommand({
            newLocation: location,
            type: 'user',
          }));
        }
        //console.log(location);
        // handle your locations here
        // to perform long running operation on iOS
        // you need to create background task
        /*BackgroundGeolocation.startTask(taskKey =>
        {
          // execute long running task
          // eg. ajax post location
          // IMPORTANT: task has to be ended by endTask
          BackgroundGeolocation.endTask(taskKey);
        });*/
      });

      BackgroundGeolocation.on('stationary', (stationaryLocation) => {
        // handle stationary locations here
        //Actions.sendLocation(stationaryLocation);
      });

      BackgroundGeolocation.on('error', (error) => {
        console.log('[ERROR] BackgroundGeolocation error:', error);
      });

      BackgroundGeolocation.on('start', () => {
        console.log('[INFO] BackgroundGeolocation service has been started');
      });

      BackgroundGeolocation.on('stop', () => {
        console.log('[INFO] BackgroundGeolocation service has been stopped');
      });

      BackgroundGeolocation.on('authorization', (status) =>
      {
        console.log('[INFO] BackgroundGeolocation authorization status: ' + status);
        if (status !== BackgroundGeolocation.AUTHORIZED)
        {
          // we need to set delay or otherwise alert may not be shown
          setTimeout(() =>
            Alert.alert('Alert Walker requires background location tracking permission.',
                        'Would you like to open app settings to allow this permission now?',
                        [
                          { text: 'Yes', onPress: () => BackgroundGeolocation.showAppSettings() },
                          { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' }
                        ]),
            1000);
        }
      });

      BackgroundGeolocation.on('background', () => {
        console.log('[INFO] App is in background');
      });

      BackgroundGeolocation.on('foreground', () => {
        console.log('[INFO] App is in foreground');
      });

      BackgroundGeolocation.on('abort_requested', () => {
        console.log('[INFO] Server responded with 285 Updates Not Required');

        // Here we can decide whether we want stop the updates or not.
        // If you've configured the server to return 285, then it means the server does not require further update.
        // So the normal thing to do here would be to `BackgroundGeolocation.stop()`.
        // But you might be counting on it to receive location updates in the UI, so you could just reconfigure and set `url` to null.
      });

      BackgroundGeolocation.on('http_authorization', () => {
        console.log('[INFO] App needs to authorize the http requests');
      });

      BackgroundGeolocation.checkStatus(status => {
        console.log('[INFO] BackgroundGeolocation service is running', status.isRunning);
        console.log('[INFO] BackgroundGeolocation services enabled', status.locationServicesEnabled);
        console.log('[INFO] BackgroundGeolocation auth status: ' + status.authorization);

        // you don't need to check status before start (this is just the example)
        if (!status.isRunning) {
          BackgroundGeolocation.start(); //triggers start on start event
        }
      });
    }
    catch(err2)
    {
      console.log(err2);
      console.error('\t\tLocationManager.init error: Location services will not work');
    }
  }



  // MARK: - Listener related
  addListener(id, cb)
  {
    this.#listeners.push({ id: id, cb: cb });
  }

  removeListener(listenerId)
  {
    for(let i = 0; i < this.#listeners.length; i++)
    {
      if(this.#listeners[i].id === listenerId)
      {
        this.#listeners.splice(i, 1);
        break;
      }
    }
  }

  notifyListeners(newLocation)
  {
    for(let i = 0; i < this.#listeners.length; i++)
    {
      console.log('LocationManager.notifyListeners(' + this.#listeners[i].id + ')');
      this.#listeners[i].cb(newLocation);
    }
  }
}
