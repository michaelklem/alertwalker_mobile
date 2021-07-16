import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

export async function LoadGeofenceAreasCommand({ updateMasterState, dataVersion })
{
  return new Command(async(dataStore, showAlert) =>
  {
    console.log('\t\tLoadGeofenceAreasCommand.execute()');
    updateMasterState ? updateMasterState({ isLoading: true }) : '';
    try
    {
      const locationData = dataStore.get('location');

      /** TG: 7/14/21
      Changed this to use location/map route so we can have custom query logic rather than using
      standard data/query route which is more limited in what we can do.
      location/map has MAP_DISPLAY_ALERT_RADIUS configuration usage and filters alerts by 2 hours old.
       */
      let response = await ApiRequest.sendRequest("post",
      {
        location: locationData.userLocation
      },
      'location/map');
      console.log(response.data);

      if(response.data.error !== null)
      {
        updateMasterState ? updateMasterState({ isLoading: false }) : '';
        showAlert('Error', response.data.error);
        return;
      }

      let data =
      {
        geofenceAreas: response.data.results
      };
      dataStore.set('geofenceAreas', data);

      updateMasterState ? updateMasterState({
        isLoading: false,
        dataVersion: dataVersion + 1,
      }) : '';

      return data;
    }
    catch(err)
    {
      console.log(err);
      updateMasterState ? updateMasterState({ isLoading: false }) : '';
      showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  });
}
