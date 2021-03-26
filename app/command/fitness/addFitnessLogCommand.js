import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

export async function AddFitnessLogCommand({ updateMasterState, showAlert, log, dataVersion })
{
  return new Command(async(dataStore) =>
  {
    console.log('\t\tAddFitnessLogCommand.execute()');
    let data = {...dataStore.get('fitness')};

    // Update existing
    if(log)
    {
      let found = false;
      for(let i = 0; i < data.fitnessLogs.length; i++)
      {
        if(data.fitnessLogs[i]._id.toString() === log._id.toString())
        {
          data.fitnessLogs[i] = log;
          found = true;
          break;
        }
      }

      if(!found)
      {
        data.fitnessLogs.push(log);
      }
    }
    // Create new
    else
    {
      updateMasterState ? updateMasterState({ isLoading: true }) : '';
      try
      {
        let response = await ApiRequest.sendRequest("post", {}, 'fitness/create');
        console.log(response.data);

        if(response.data.error !== null)
        {
          updateMasterState ? updateMasterState({ isLoading: false }) : '';
          showAlert('Error', response.data.error);
          return data;
        }

        data.fitnessLogs.push(response.data.results);

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
    }

    dataStore.set('fitness', data);
    return data;
  });
}
