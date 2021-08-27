import ApiRequest from '../../helper/ApiRequest';
import { NotificationManager } from '../../manager';
import { LoadGeofenceAreasCommand } from '../geofence';
import { Command } from '..';

export async function UpdateNotificationPreferencesCommand({ updateMasterState, dataVersion, eventSubscriptions })
{
  return new Command(async(dataStore, showAlert) =>
  {
    console.log('\t\tUpdateNotificationPreferencesCommand.execute()');
    updateMasterState ? updateMasterState({ isLoading: true }) : '';
    try
    {

      /** TG: 7/14/21
      Changed this to use location/map route so we can have custom query logic rather than using
      standard data/query route which is more limited in what we can do.
      location/map has MAP_DISPLAY_ALERT_RADIUS configuration usage and filters alerts by 2 hours old.
       */
      let response = await ApiRequest.sendRequest("post",
      {
        eventSubscriptions: eventSubscriptions
      },
      'notification/update-subscription');
      console.log(response.data);

      if(response.data.error !== null)
      {
        updateMasterState ? updateMasterState({ isLoading: false }) : '';
        showAlert('Error', response.data.error);
        return;
      }

      await NotificationManager.GetInstance().setEventSubscriptions(response.data.results);

      // When changing notification preferences we need to reload the geofence areas
      const loadGeofenceAreasCommand = await new LoadGeofenceAreasCommand({ updateMasterState: null, dataVersion: null });
      await loadGeofenceAreasCommand.execute(dataStore, showAlert);

      updateMasterState ? updateMasterState({
        isLoading: false,
        dataVersion: dataVersion + 1,
      }) : '';

    }
    catch(err)
    {
      console.log(err);
      updateMasterState ? updateMasterState({ isLoading: false }) : '';
      showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  });
}
