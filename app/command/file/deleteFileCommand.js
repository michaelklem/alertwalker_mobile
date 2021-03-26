import RNFetchBlob from 'rn-fetch-blob';
import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

export async function DeleteFileCommand(updateMasterState, params, useRemoteStorage, dataVersion)
{
  return new Command(async(dataStore, showAlert) =>
  {
    console.log('\t\tDeleteFileCommand.execute()');
    try
    {
      if(useRemoteStorage)
      {
        updateMasterState({ isLoading: true });
        const data = dataStore.get('files');
        const files = data.files;
        const idx = files.findIndex(file => file._id.toString() === params.file._id.toString());

        const response = await ApiRequest.sendRequest('post', {model: 'file', id: params.file._id}, 'data/delete');
        console.log(response.data);

        if(response.data.error !== null)
        {
          updateMasterState({ isLoading: false });
          showAlert('Error', response.data.error);
          return;
        }

        files.splice(idx, 1);
        data.files = files;
        dataStore.set('files', data);

        updateMasterState({ isLoading: false, dataVersion: dataVersion + 1 });

        return data;
      }
      else
      {
        const path = RNFetchBlob.fs.dirs.DocumentDir + '/' + params.file.item;
        await RNFetchBlob.fs.unlink(path);

        files = await RNFetchBlob.fs.ls(RNFetchBlob.fs.dirs.DocumentDir);
        files = files.filter(file => file.indexOf('pdf') !== -1);
        let data =
        {
          files: files
        };
        dataStore.set('files', data);
        return data;
      }
    }
    catch(err)
    {
      console.log(err);
      updateMasterState({ isLoading: false });
      showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  });
}
