import RNFetchBlob from 'rn-fetch-blob';
import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

export async function LoadFilesCommand(updateMasterState, params, useRemoteStorage, dataVersion)
{
  return new Command(async(dataStore, showAlert) =>
  {
    console.log('\t\tLoadFilesCommand.execute()');
    try
    {
      if(useRemoteStorage)
      {
        updateMasterState ? updateMasterState({ isLoading: true }) : '';
        let response = await ApiRequest.sendRequest("post", params, 'data/query');
        console.log(response.data);

        if(response.data.error !== null)
        {
          updateMasterState ? updateMasterState({ isLoading: false }) : '';
          showAlert('Error', response.data.error);
          return;
        }

        let data =
        {
          files: response.data.results,
          purpose: params.purpose
        };
        dataStore.set('files', data);

        updateMasterState ? updateMasterState({
          isLoading: false,
          dataVersion: dataVersion + 1,
        }) : '';

        return data;
      }
      else
      {
        files = await RNFetchBlob.fs.ls(RNFetchBlob.fs.dirs.DocumentDir);
        files = files.filter(file => file.indexOf('pdf') !== -1);
        let data =
        {
          files: files,
          purpose: params.purpose
        };
        dataStore.set('files', data);
        return data;
      }
    }
    catch(err)
    {
      console.log(err);
      updateMasterState ? updateMasterState({ isLoading: false }) : '';
      showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  });
}
