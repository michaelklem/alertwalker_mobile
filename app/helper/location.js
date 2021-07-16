import React from 'react';
import {  Alert,
          Linking,
          PermissionsAndroid,
          Platform,
          ToastAndroid } from 'react-native';

import Geolocation from 'react-native-geolocation-service';

async function hasLocationPermissionIOS(showAlert)
{
  try
  {
    const openSetting = () =>
    {
      Linking.openSettings().catch(() =>
      {
        showAlert('Error', 'Unable to open settings');
      });
    };

    const status = await Geolocation.requestAuthorization('always');

    if (status === 'granted')
    {
      return true;
    }

    if (status === 'denied') {
      showAlert('Error', 'Location permission denied');
    }

    if (status === 'disabled') {
      showAlert('Error',
                `Turn on Location Services to allow Alert Walker to determine your location.`,
                openSetting);
    }

    return false;
  }
  catch(err)
  {
    console.log(err);
    return false;
  }
};

export async function hasLocationPermission(showAlert)
{
  console.log('location.hasLocationPermission()');
  try
  {
    if (Platform.OS === 'ios')
    {
      const hasPermission = await hasLocationPermissionIOS(showAlert);
      return hasPermission;
    }

    if (Platform.OS === 'android' && Platform.Version < 23)
    {
      console.log('Version < 23');
      return true;
    }

    // Check if we have background location permissions
    let hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
    if (hasPermission)
    {
      console.log('Has permission background');
      return true;
    }

    // Check if we at least have while using app permissions
    hasPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);

    if(hasPermission)
    {
      console.log('Has permission fine location');
      return true;
    }

    if(Platform.OS === 'android')
    {
      /*showAlert('Info',
                'This app collects location data to enable the map where you can see all alerts in your area as well. If you give the app background location permissions then it will use your location even when the app is closed or not in use to trigger a push notification when you are near an alert area.',
                async() =>
                {*/
                  console.log('location.hasLocationPermission()');
                  // Android 10 and above doesn't allow us to request background location, user needs to manually set that.
                  const status = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                  {
                    title: 'Location Permission',
                    message: 'This app collects location data to enable the map where you can see all alerts in your area as well. If you give the app background location permissions then it will use your location even when the app is closed or not in use to trigger a push notification when you are near an alert area.',
                  });

                  if (status === PermissionsAndroid.RESULTS.GRANTED)
                  {
                    return true;
                  }

                  if (status === PermissionsAndroid.RESULTS.DENIED) {
                    ToastAndroid.show(
                      'Location permission denied by user.',
                      ToastAndroid.LONG,
                    );
                  } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                    ToastAndroid.show(
                      'Location permission revoked by user.',
                      ToastAndroid.LONG,
                    );
                  }
                //});
    }

    return false;
  }
  catch(err)
  {
    console.log(err);
    return false;
  }
};
