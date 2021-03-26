import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

const DefaultNotesSortBy = 1;

export async function LoadNotesCommand(updateMasterState, params, dataVersion)
{
  return new Command(async(dataStore, showAlert) =>
  {
    console.log('\t\tLoadNotesCommand.execute()');
    updateMasterState ? updateMasterState({ isLoading: true }) : '';
    try
    {
      let apiParams = params;
      if(!apiParams)
      {
        apiParams =
        {
          sortBy: DefaultNotesSortBy
        };
      }
      let response = await ApiRequest.sendRequest("post", apiParams, 'note/list');
      console.log(response.data);

      if(response.data.error !== null)
      {
        updateMasterState ? updateMasterState({ isLoading: false }) : '';
        showAlert('Error', response.data.error);
        return;
      }

      let data =
      {
        notes: response.data.results,
        templates: response.data.templates,
        schemaFields: response.data.schemaFields,
      };
      dataStore.set('notes', data);

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
