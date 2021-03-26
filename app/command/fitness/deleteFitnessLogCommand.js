import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

export async function DeleteFitnessLogCommand({ updateMasterState, id, dataVersion })
{
  return new Command(async(dataStore, showAlert) =>
  {
    console.log('\t\tDeleteFitnessLogCommand.execute()');
    updateMasterState({ isLoading: true });
    try
    {
      const data = dataStore.get('fitness');
      const logs = data.fitnessLogs;
      const idx = logs.findIndex(log => log._id.toString() === id.toString());

      const response = await ApiRequest.sendRequest('post', {model: 'fitnesslog', id: id}, 'data/delete');
      console.log(response.data);

      if(response.data.error !== null)
      {
        updateMasterState({ isLoading: false });
        showAlert('Error', response.data.error);
        return;
      }

      logs.splice(idx, 1);
      data.fitnessLogs = logs;
      dataStore.set('fitness', data);

      updateMasterState({ isLoading: false, dataVersion: dataVersion + 1 });

      return data;
    }
    catch(err)
    {
      console.log(err);
      updateMasterState({ isLoading: false });
      showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  });
}
