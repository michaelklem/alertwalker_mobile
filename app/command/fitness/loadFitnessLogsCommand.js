import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

const DefaultLogsSortBy = 1;

export async function LoadFitnessLogsCommand({ updateMasterState, dataVersion, isRefreshing, sortBy })
{
  return new Command(async(dataStore, showAlert) =>
  {
    console.log('\t\tLoadFitnessLogsCommand.execute()');
    updateMasterState ? updateMasterState({ [isRefreshing ? 'isRefreshing' : 'isLoading']: true }) : '';
    try
    {
      let response = await ApiRequest.sendRequest("post", {sortBy: sortBy}, 'fitness/');
      console.log(response.data);

      if(response.data.error !== null)
      {
        updateMasterState ? updateMasterState({ [isRefreshing ? 'isRefreshing' : 'isLoading']: false }) : '';
        showAlert('Error', response.data.error);
        return;
      }

      let data =
      {
        fitnessLogs: response.data.results,
        schemaFields: response.data.schemaFields
      };
      dataStore.set('fitness', data);

      updateMasterState ? updateMasterState({
        [isRefreshing ? 'isRefreshing' : 'isLoading']: false,
        dataVersion: dataVersion + 1,
      }) : '';

      return data;
    }
    catch(err)
    {
      console.log(err);
      updateMasterState ? updateMasterState({ [isRefreshing ? 'isRefreshing' : 'isLoading']: false }) : '';
      showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  });
}
