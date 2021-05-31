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
      var d = new Date();
      d.setHours(d.getHours() - 2);

      console.log('[LoadGeofenceAreasCommand.execute] sendRequest...');
      let response = await ApiRequest.sendRequest("post",
      {
        model: 'geofencearea',
        params:
        {
          createdOn:
          {
            $gte: d
          }
        }
      },
      'data/query');
      console.log('[LoadGeofenceAreasCommand.execute] response.data: ' + JSON.stringify(response.data));

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
      console.log( 'Loaded geo fence data: ' + JSON.stringify(data))
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
