import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';
import { ToastAndroid } from 'react-native';

export async function AddGeofenceAreaCommand({  updateMasterState,
                                                setLoading,
                                                updateDataVersion,
                                                showAlert,
                                                data,
                                                dataVersion })
{
  return new Command(async(dataStore) =>
  {
    console.log('\t\tAddGeofenceAreaCommand.execute()');

    if(data.note.trim().length === 0)
    {
      showAlert('Error', 'A note is required');
      return null;
    }
    else if(!data.location)
    {
      showAlert('Error', 'A location is required');
      return null;
    }

    let dataSet = {...dataStore.get('geofenceAreas')};

    const createFormData = new FormData();
    createFormData.append('model', 'geofencearea');
    createFormData.append('location', ('[' + data.location.longitude + ', ' + data.location.latitude + ']'));
    createFormData.append('note', data.note);
    createFormData.append('radius', data.radius);
    createFormData.append('type', data.type);

    // Image is optional
    if(data.image && data.image.path)
    {
      createFormData.append('image', data.image);
    }

    setLoading ? setLoading(true) : '';

    try
    {
      console.log('\t\t AddGeofenceAreaCommand.sendRequest ...');
      let response = await ApiRequest.sendRequest("post", createFormData, 'data/create');
      console.log('\t\t AddGeofenceAreaCommand.sendRequest response: ' + JSON.stringify(response.data));

      if(response.data.error !== null)
      {
        setLoading ? setLoading(false) : '';
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

      setLoading ? setLoading(false) : '';
      updateDataVersion ? updateDataVersion(dataVersion + 1) : '';

      // showAlert('', 'Alert created successfully');
      ToastAndroid.showWithGravity("Alert created successfully.", ToastAndroid.SHORT, ToastAndroid.BOTTOM);


      return dataSet;
    }
    catch(err)
    {
      console.log(err);
      setLoading ? setLoading(false) : '';
      showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
      return null;
    }
  });
}
