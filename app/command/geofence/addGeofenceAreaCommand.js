import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';
import { ToastAndroid } from 'react-native';

export async function AddGeofenceAreaCommand({ updateMasterState, updateDataVersion, showAlert, data, dataVersion })
{
  return new Command(async(dataStore) =>
  {
    console.log('\t\tAddGeofenceAreaCommand.execute()');

    if(data.note.trim().length === 0)
    {
      showAlert('Error', 'A note is required');
      return;
    }

    let dataSet = {...dataStore.get('geofenceAreas')};

    const createFormData = new FormData();
    createFormData.append('model', 'geofencearea');
    createFormData.append('location', ('[' + data.location.longitude + ', ' + data.location.latitude + ']'));
    createFormData.append('note', data.note);
    createFormData.append('radius', data.radius);
    updateMasterState ? updateMasterState({ isLoading: true }) : '';

    try
    {
      let response = await ApiRequest.sendRequest("post", createFormData, 'data/create');
      console.log(response.data);

      if(response.data.error !== null)
      {
        updateMasterState ? updateMasterState({ isLoading: false }) : '';
        showAlert('Error', response.data.error);
        return null;
      }

      let found = false;
      for(let i = 0; i < dataSet.geofenceAreas.length; i++)
      {
        if(dataSet.geofenceAreas[i]._id.toString() === response.data.results._id.toString())
        {
          dataSet.geofenceAreas[i] = response.data.results;
          found = true;
          break;
        }
      }

      if(!found)
      {
        dataSet.geofenceAreas.push(response.data.results);
      }

      dataStore.set('geofenceAreas', dataSet);

      updateMasterState ? updateMasterState({ isLoading: false }) : '';

      updateDataVersion ? updateDataVersion(dataVersion + 1) : '';

      // Need to get this changed on the server side.
      if (response.data.message === 'Created successfully') {
        response.data.message = 'Alert created successfully'
      }
      
      ToastAndroid.show(
        response.data.message,
        ToastAndroid.SHORT
      );

      return dataSet;
    }
    catch(err)
    {
      console.log(err);
      updateMasterState ? updateMasterState({ isLoading: false }) : '';
      showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
      return null;
    }
  });
}
