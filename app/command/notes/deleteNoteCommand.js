import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

export async function DeleteNoteCommand(updateMasterState, params, dataVersion)
{
  return new Command(async(dataStore, showAlert) =>
  {
    console.log('\t\tDeleteNoteCommand.execute()');
    updateMasterState({ isLoading: true });
    try
    {
      const data = dataStore.get('notes');
      const notes = data.notes;
      const idx = notes.findIndex(note => note._id.toString() === params.id.toString());

      const response = await ApiRequest.sendRequest('post', params, 'data/delete');
      console.log(response.data);

      if(response.data.error !== null)
      {
        updateMasterState({ isLoading: false });
        showAlert('Error', response.data.error);
        return;
      }

      notes.splice(idx, 1);
      data.notes = notes;
      dataStore.set('notes', data);

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
