import Geolocation from 'react-native-geolocation-service';
import { hasLocationPermission } from '../../helper/location';
import { Command } from '..';

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
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            },
            mapLocation:
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            },
            alertLocation:
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
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
