import Geolocation from 'react-native-geolocation-service';
import { hasLocationPermission } from '../../helper/location';
import { Command } from '..';
import {DEFAULT_LAT_DELTA, DEFAULT_LNG_DELTA} from '../../constant/App'



export async function GetLocationCommand({ updateMasterState, dataVersion, setLoading })
{
  return new Command(async(dataStore, showAlert) =>
  {
    console.log('\t\tGetLocationCommand.execute()');
    try
    {
      const hasPermission = await hasLocationPermission(showAlert);
      if(hasPermission)
      {
        setLoading(true);
        Geolocation.getCurrentPosition((position) =>
        {
          let data =
          {
            userLocation:
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: DEFAULT_LAT_DELTA,
              longitudeDelta: DEFAULT_LNG_DELTA,
            },
            mapLocation:
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: DEFAULT_LAT_DELTA,
              longitudeDelta: DEFAULT_LNG_DELTA,
            },
            alertLocation:
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: DEFAULT_LAT_DELTA,
              longitudeDelta: DEFAULT_LNG_DELTA,
            }
          };
          dataStore.set('location', data);

          updateMasterState ? updateMasterState({ dataVersion: dataVersion + 1 }) : '';
          setLoading(false);
        },
        (error) =>
        {
          setLoading(false);
          showAlert('Error', `Code ${error.code} ${error.message}`);
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
    catch(err)
    {
      console.log(err);
      setLoading(false);
      showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  });
}
