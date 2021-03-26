import { NativeModules } from 'react-native';
//const PSPDFKit = NativeModules.PSPDFKit;
import RNFetchBlob from 'rn-fetch-blob';
import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

export async function AddFileCommand({
  updateMasterState,
  fileName,
  fileUrl,
  useRemoteStorage,
  pdfEditor,
  pdf,
  localFile,
  fileId,
  filePurpose,
})
{
  return new Command(async(dataStore) =>
  {
    try
    {
      console.log('\t\tAddFileCommand.execute()');
      updateMasterState ? updateMasterState({ isLoading: true }) : '';

      let formattedFileName = fileName;

      // Figure out path and remove any existing
      let path = RNFetchBlob.fs.dirs.DocumentDir + '/' + fileName;
      console.log(path);
      if(path.substr(path.length - 4, path.length) !== '.pdf')
      {
        path += '.pdf';
        formattedFileName += '.pdf';
      }
      const fileExists = await RNFetchBlob.fs.exists(path);
      if(fileExists)
      {
        await RNFetchBlob.fs.unlink(path);
      }

      // Save
      const saveResult = await pdfEditor.saveCurrentDocument();
      if(!saveResult)
      {
        updateMasterState ? updateMasterState({ isLoading: false }) : '';
        console.log('uh oh');
        return {error: 'An error has occurred, please try again or contact support.'};
      }

      // Then, flatten all the annotations
      /*const success = await PSPDFKit.processAnnotations("embed",
                                                        "all",
                                                        pdf,
                                                        path);*/
                                                        const success = false;

      if(success)
      {
        // If editing a local file remove the work file copy
        if(localFile !== '')
        {
          const workFilePath = path.replace('.pdf', '') + '-workfile.pdf';
          await RNFetchBlob.fs.unlink(workFilePath);
        }

        let data = {...dataStore.get('files')};
        let file = null;
        if(useRemoteStorage)
        {
          const uploadResult = await uploadFile(
          {
            updateMasterState: updateMasterState,
            fileUrl: path,
            fileName: fileName,
            localFile: localFile,
            fileId: fileId,
            filePurpose: filePurpose
          });

          if(uploadResult.error)
          {
            return {data: null, error: uploadResult.error};
          }

          // Update existing
          if(fileId)
          {
            const idx = data.files.findIndex(file => file._id.toString() === fileId.toString());
            data.files[idx] = uploadResult.file;
            console.log('Idx: ' + idx);
            console.log(data.files[idx]);
          }
          // Add new
          else
          {
            data.files.push(uploadResult.file);
          }

          file = uploadResult.file;
        }
        else
        {
          data.files.push(formattedFileName);
          file = formattedFileName;
        }

        dataStore.set('files', data);
        return {data: data, error: null, file: file};
      }
      else
      {
        updateMasterState ? updateMasterState({ isLoading: false }) : '';
        return {error: 'There was an issue saving your PDF, please contact support if this issue persists.'};
      }
    }
    catch(err)
    {
      console.log(err);
      updateMasterState ? updateMasterState({ isLoading: false }) : '';
      return {error: 'An error has occurred, please try again or contact support.\nError: 11 ' + err};
    }
  })
}

async function uploadFile({
  updateMasterState,
  fileUrl,
  fileName,
  localFile,
  fileId,
  filePurpose,
})
{
  console.log('\tPdfEditor.uploadFile(' + fileUrl + ')');
  const formattedFile =
  {
    uri: Platform.OS === "android" ? fileUrl : fileUrl.replace("file://", '/private'),
    name: fileName,
    type: 'pdf',
    path: Platform.OS === "android" ? fileUrl : fileUrl.replace("file://", '/private'),
    fileName: fileName
  };

  updateMasterState ? updateMasterState({ isLoading: true }) : '';
  try
  {
    let route = 'create';
    const formData = new FormData();

    // If editing a local file then update
    if(localFile !== '')
    {
      route = 'update';
      formData.append('id', fileId.toString());
    }
    else
    {
      formData.append('type', 'pdf');
      formData.append('name', fileName);
      formData.append('purpose', filePurpose);
    }

    formData.append('model', 'file');
    formData.append('url', formattedFile);

    let response = await ApiRequest.sendRequest('post', formData, 'data/' + route, 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');
    console.log(response.data);

    updateMasterState ? updateMasterState({ isLoading: false }) : '';

    // Success
    if(response.data.error !== null)
    {
      return {error: response.data.error};
    }

    return {file: response.data.results, error: null};
  }
  catch(err)
  {
    console.log(err);
    updateMasterState ? updateMasterState({ isLoading: false }) : '';
    return {error: 'An error has occurred, please try again or contact support.\nError: 11 ' + err};
  }
}
