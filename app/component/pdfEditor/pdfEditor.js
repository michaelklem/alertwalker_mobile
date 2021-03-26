import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  processColor,
  FlatList,
  StyleSheet,
  NativeModules,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';

//const PSPDFKit = NativeModules.PSPDFKit;

import RNFetchBlob from 'rn-fetch-blob';
//import PSPDFKitView from 'react-native-pspdfkit';
import { PDFDocument, PDFPage } from 'react-native-pdf-lib';
import Pdf from 'react-native-pdf';
import {WebView} from 'react-native-webview';
import DocumentPicker from 'react-native-document-picker';
import Dialog from "react-native-dialog";

import { Colors, Images } from '../../constant';
import { MyButton } from '../myButton';
import { ImageButton } from '../imageButton';
import ApiRequest from '../../helper/ApiRequest';
import { DataManager, IapManager } from '../../manager';

import {  AddFileCommand,
          DeleteFileCommand,
          LoadFilesCommand
} from '../../command/file';

/*const LicenseKey = 'WG9zaPUIJfnuBJgQl0qvIuQDT7GCI3UKaY9cIe4VrstnXwwXAxhMvIWlTSlguS4m30AMfTlUKZ0NpGwfqAgcLDdUYuJ0daOhdT4zfwsbLuKQ7D9nLaFx/vIBJHPyazigqifUSExkUEzL0x+PvDIUm3XiNN3cxG0fWdiTdHAW3YT1U4aC4wSjRUEA2Ajr2gA8qeM9tNoUG33SErM7lEwAOj/DBr3W3pJfnbp7nFVNlw3k71dVMSVFzT5wWYT96WbuAcCMZSzSZNQAZq01ubkGalYIUvwEXp2G5uXe0jl9ZM74u2VnbZgj1EiGKyVn0FeOXkBDS29ysLWzdLBQ8OJESFUnBkIoNtukQ5i88lrSP/KNJltLsy1xWd6qq9VL+5EQdCqK1UATC/HY2/AgiIr7vQ4Nr3aB2VAsgJzantrAIvarNI49jM2Q65n4bHyBcg+yxTdCmZV9DAqqkLNN09af/J8/gRp+kQbmoK4og/yVSK0fEY3lMAKPxzWDym5LoiFi9mhJjgX7PLbvESaV60YX3co+krDmloHUzJnMJ226yfe8SkQ5sdy07C364VtaXHp4jTLUZR/9PHNxPutM61Gxyw==';*/
export default class PdfEditor extends Component
{
  _pdfEditor = null;
  _maxFileSize = 20971520; // 20 MB
  _dataMgr = null;
  _iapMgr = null;

  // MARK: - Constructor
  constructor(props)
  {
    console.log('\tPdfEditor()');
    super(props);

    //PSPDFKit.setLicenseKey(LicenseKey);

    // Setup IAP manager so we can get notifications when receipt is updated
    this._iapMgr = IapManager.GetInstance();
    const receipt = this._iapMgr.getReceipt();
    this._iapMgr.addListener('pdfEditor', (rcpt) =>
    {
      const isUpgraded = (rcpt !== null && rcpt.status === 'active');
      console.log(rcpt);
      if(isUpgraded)
      {
        this.setState({ isUpgraded: isUpgraded });
      }
      else
      {
        this.setState({ isUpgraded: isUpgraded });
      }
    });


    this.state =
    {
      calendarTemplate: {pdf: 'https://s3.amazonaws.com/core.bitbybit.software/uploads/w7rlO7/calendartemplate/pdf_2020-12-10T13%3A14%3A56.801Z.pdf'},
      tappedLocation: null,
      pdf: null,
      isSaving: false,
      fileName: '',
      fileListVisible: false,
      localFile: '',
      dataVersion: 0,
      saveInProgress: false,
      fileId: '',
      isUpgraded: (receipt !== null && receipt.status === 'active'),
    };

    this._pdfEditor = React.createRef();

    this._dataMgr = DataManager.GetInstance();
  }

  async componentDidMount()
  {
    this._isMounted = true;

    // Only load data if not already cached
    let data = this._dataMgr.getData('files');
    //console.log(data);
    if(!data || !data.files || data.files.length === 0 || data.purpose !== this.props.filePurpose)
    {
      await this.loadData();
    }
  }

  // MARK: - API
  loadData = async () =>
  {
    console.log('\tPdfEditor.loadData(' + this.props.filePurpose + ')');
    try
    {
      const data = await this._dataMgr.execute(await new LoadFilesCommand(
        (state) => this.setState(state),
        {
          model: 'file',
          params:
          {
            createdBy: this.props.user._id,
            purpose: this.props.filePurpose,
            type: 'pdf'
          }
        },
        this.props.useRemoteStorage,
        this.state.dataVersion
      ));
    }
    catch(err)
    {
      console.log(err);
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  }

  // MARK: - File
  openFile = async() =>
  {
    try
    {
      console.log('\tPdfEditor.openFile()');

      if(!this.state.isUpgraded)
      {
        this.props.showAlert('Uh-oh', 'In order to use the PDF editor you must upgrade your account. Click the additional features tab to do so!');
        return;
      }

      let file = await DocumentPicker.pick({ type: [DocumentPicker.types.pdf], copyTo: 'documentDirectory' });

      if(file.size > this._maxFileSize)
      {
        this.props.showAlert('Uh-oh', 'This file is larger than 20 MB, please choose a smaller file.');
        return;
      }

      file.uri = Platform.OS === "android" ? file.uri : file.uri.replace("/private", '');
      const path = decodeURI(file.fileCopyUri.replace("file://", ''));
      //console.log('Open file path: ' + path);
      this.setState({ pdf: path });
    }
    catch (err)
    {
      if(DocumentPicker.isCancel(err))
      {
        // User cancelled the picker, exit any dialogs or menus and move on
      }
      else
      {
        throw err;
      }
    }
  }

  listFiles = async() =>
  {
    console.log('\tPdfEditor.listFiles()');
    if(!this.state.isUpgraded)
    {
      this.props.showAlert('Uh-oh', 'To use this feature, upgrade your account by selecting "Additonal Features" from the bottom menu.');
      return;
    }

    const data = this._dataMgr.getData('files');

    if(data.files.length > 0)
    {
      this.setState({ fileListVisible: true });
    }
    else
    {
      this.props.showAlert('Uh-oh', 'To use this feature, upgrade your account by selecting "Additonal Features" from the bottom menu.');
    }
  }

  savePdf = async() =>
  {
    try
    {
      console.log('\tPdfEditor.savePdf()');

      this.setState({ saveInProgress: true });

      // Returns {data: {Data}, error: 'Error msg if it exists, null otherwise'}
      const addFileResult = await this._dataMgr.execute(await new AddFileCommand(
      {
        updateMasterState: (state) => this.setState(state),
        fileName: this.state.fileName,
        fileUrl: this.props.useRemoteStorage ? 'fileName' : null,
        useRemoteStorage: this.props.useRemoteStorage,
        pdfEditor: this._pdfEditor.current,
        pdf: this.state.pdf,
        localFile: this.state.localFile,
        fileId: this.state.fileId,
        filePurpose: this.props.filePurpose
      }));

      if(addFileResult.error !== null)
      {
        this.props.showAlert('Uh-oh', addFileResult.error);
        this.setState({ saveInProgress: false });
        return;
      }

      if(this.props.onSavePdf)
      {
        this.props.onSavePdf(addFileResult.file);
      }

      this.setState({ isSaving: false, fileName: '', pdf: null, localFile: '', saveInProgress: false, fileId: '' }, () =>
      {
        this.props.showAlert('Success', 'PDF saved');
      });
    }
    catch(err)
    {
      this.setState({ saveInProgress: false });
      console.log(err);
    }
  }

  editFile = async(file) =>
  {
    console.log('\tPdfEditor.editFile()');
    console.log(file);
    // Need to download local copy to work with
    if(this.props.useRemoteStorage)
    {
      // Copy file to work file and delete it it already exists
      const workFilePath = RNFetchBlob.fs.dirs.DocumentDir + '/' + file.name.replace('.pdf', '') + '-workfile.pdf';

      // Make sure we have room for this file
      const fileExists = await RNFetchBlob.fs.exists(workFilePath);
      if(fileExists)
      {
        await RNFetchBlob.fs.unlink(workFilePath);
      }

      const downloadResult = await RNFetchBlob
                                              .config({ path : workFilePath })
                                              .fetch('GET', file.url);
      console.log('File ID: ' + file._id);
      this.setState({ pdf: workFilePath, files: [], localFile: file.name + '.' + file.type, fileListVisible: false, fileId: file._id });
    }
    // Copy local file to work file
    else
    {
      // Copy file to work file and delete it it already exists
      const workFilePath = RNFetchBlob.fs.dirs.DocumentDir + '/' + file.replace('.pdf', '') + '-workfile.pdf';
      const path = RNFetchBlob.fs.dirs.DocumentDir + '/' + file;

      const fileExists = await RNFetchBlob.fs.exists(workFilePath);
      if(fileExists)
      {
        await RNFetchBlob.fs.unlink(workFilePath);
      }

      RNFetchBlob.fs.cp(path, workFilePath);
      this.setState({ pdf: workFilePath, files: [], localFile: file, fileListVisible: false });
    }
  }

  // MARK: - Editor
  closeEditor = async() =>
  {
    console.log('\tPdfEditor.closeEditor()');
    if(this.state.localFile !== '')
    {
      let workFilePath = RNFetchBlob.fs.dirs.DocumentDir + '/' + this.state.localFile;
      //console.log('Work file path: ' + workFilePath);
      if(workFilePath.substr(workFilePath.length - 4, workFilePath.length) === '.pdf')
      {
        workFilePath = workFilePath.replace('.pdf', '') + '-workfile.pdf';
      }
      //console.log('Work file path: ' + workFilePath);
      await RNFetchBlob.fs.unlink(workFilePath);
    }
    this.setState({ pdf: null, localFile: '', fileId: '' });
  }


  // MARK: - Renders
  renderFile = (file, i) =>
  {
    console.log(file);
    let fileName = file.item.name;
    if(this.props.useRemoteStorage)
    {
      if(file.item.name.substr(file.item.name.length - 4, file.item.name.length) !== '.pdf')
      {
        fileName = (file.item.name + '.' + file.item.type);
      }
    }

    return (
    <View style={{ flexDirection: 'row'}}>
      <TouchableOpacity
        onPress={async() =>
        {
          const data = await this._dataMgr.execute(await new DeleteFileCommand(
            (state) => this.setState(state),
            {
              file: file.item
            },
            this.props.useRemoteStorage,
            this.state.dataVersion
          ));

          // If no files left, close list
          if(data.files.length === 0)
          {
            this.setState({ fileListVisible: false });
          }
          // Otherwise re-list files
          else
          {
            this.listFiles();
          }
        }}
      >
        <Text style={[styles.text, {color: 'red', marginRight: 10}]}>{'Delete'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.itemContainer]}
        onPress={() => this.editFile(file.item)}
      >
        <Text
          adjustsFontSizeToFit={true}
          style={styles.text}>{fileName}</Text>
      </TouchableOpacity>
    </View>
    );
  }

  renderPdfEditor = () =>
  {
    return (
      <Modal
        animationType={'slide'}
        transparent={true}
        visible={this.state.pdf !== null}
        style={styles.container}
      >
        <View style={styles.container}>
          <View style={styles.titleLhs}>
            {!this.state.saveInProgress &&
            <ImageButton
              titleStyle={styles.closeBtn}
              imgSrc={Images.checkFilled}
              onPress={async() =>
              {
                // If local file then overwrite
                if(this.state.localFile !== '')
                {
                  this.setState({ fileName: this.state.localFile }, () =>
                  {
                    this.savePdf();
                  });
                }
                // Otherwise let user enter file name
                else
                {
                  this.setState({ isSaving: true });
                }
              }}
            />}
            {!this.state.saveInProgress &&
            <ImageButton
              titleStyle={styles.closeBtn}
              imgSrc={Images.close}
              onPress={async() =>
              {
                this.closeEditor();
              }}
            />}
            {this.state.saveInProgress &&
            <Text
              adjustsFontSizeToFit={true}
              style={styles.text}>{'Saving...'}</Text>}
          </View>

          {this.state.pdf !== null && false
          /*<PSPDFKitView
            ref={this._pdfEditor}
            document={this.state.pdf}
            style={styles.pdf}
            disableAutomaticSaving={false}
            annotationAuthorName={this.props.user.username.toString()}
            shouldAskForAnnotationUsername={false}
            configuration={{
              backgroundColor: processColor(Colors.header.background),
              showThumbnailBar: "scrollable",
              pageTransition: 'scrollContinuous',
              scrollDirection: 'vertical'
            }}
          />*/}


          <Dialog.Container visible={this.state.isSaving}>
            <Dialog.Title>{'Save File'}</Dialog.Title>
            <Dialog.Description>{'Enter a file name'}</Dialog.Description>
            <Dialog.Input
              onChangeText={(val) => this.setState({ fileName: val.replace(/[^\w\s]/gi, '') }) }
              value={this.state.fileName}
            />
            <Dialog.Button
              disabled={this.state.saveInProgress}
              label="Cancel"
              onPress={() => this.setState({ isSaving: false })}
            />
            <Dialog.Button
              disabled={this.state.saveInProgress}
              label="Save"
              onPress={() =>
              {
                if(this.state.fileName.length > 0)
                {
                  this.savePdf();
                }
                else
                {
                  this.props.showAlert('Uh-oh', 'File name cannot be blank');
                }
              }}
            />
          </Dialog.Container>
        </View>
      </Modal>
    );
  }

  renderFileList = (files) =>
  {
    return (
      <Modal
        animationType={'slide'}
        transparent={false}
        visible={this.state.fileListVisible}
        style={styles.fileContainer}
      >
        <SafeAreaView style={styles.fileContainerInner}>
          <ImageButton
            titleStyle={styles.closeBtn2}
            imgSrc={Images.close}
            onPress={() =>
            {
              this.setState({ fileListVisible: false });
            }}
          />
          <FlatList
            vertical
            keyboardShouldPersistTaps={'always'}
            keyExtractor={(item, index) => item + '-' + index}
            data={files}
            alwaysBounceHorizontal={false}
            showsHorizontalScrollIndicator={false}
            renderItem={(action, i) => this.renderFile(action, i)}
            style={styles.fileList}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  // MARK: - Render
  render()
  {
    console.log('\tPdfEditor.render()');
    const data = this._dataMgr.getData('files');
    //console.log(data);
    return (
      <>

        {this.state.pdf !== null &&
        this.renderPdfEditor()}

        {data.files &&
        data.files.length > 0 &&
        this.renderFileList(data.files)}
      </>
    );
  }
}

/*
{false &&
<TouchableWithoutFeedback
  style={styles.pdf}
  onPress={(evt) => this.setState({ tappedLocation:  { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY } }) }
>
  <Pdf
    source={{ uri: this.state.calendarTemplate.pdf }}
    onLoadComplete={(numberOfPages,filePath)=>{
        console.log(`number of pages: ${numberOfPages}`);
    }}
    onPageChanged={(page,numberOfPages)=>{
        console.log(`current page: ${page}`);
    }}
    onPageSingleTap={(page) => {console.log(page)}}
    onError={(error)=>{
        console.log(error);
    }}
    onPressLink={(uri)=>{
        console.log(`Link presse: ${uri}`)
    }}
    style={styles.pdf}
  />
</TouchableWithoutFeedback>}
*/

const sideMargins = Math.round(Dimensions.get('window').width * 0.044);
const height14 = Math.round(Dimensions.get('window').height * 0.01794);
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  pdf: {
    width: '100%',
    height:'100%',
    marginTop: 10,
    backgroundColor: Colors.orange1,
  },
  itemContainer: {
    height: Math.round(Dimensions.get('window').height * 0.0615),
    backgroundColor: Colors.editorToolbar.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.darkBlue1,
    borderWidth: 1,
    width: Math.round(Dimensions.get('window').width * 0.75)
  },
  text: {
    color: Colors.white,
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Regular'
      },
      android: {
        fontFamily: 'Roboto-Regular'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height14,
    marginTop: 10,
    textAlign: 'center',
  },
  closeBtn: {
    width: Math.round(Dimensions.get('window').width * 0.1),
    height: Math.round(Dimensions.get('window').width * 0.1),
    marginRight: sideMargins,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  titleLhs: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexDirection: 'row',
    backgroundColor: Colors.black,
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.1),
  },
  saveBtn: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Regular'
      },
      android: {
        fontFamily: 'Roboto-Regular'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: 22,
    textAlign: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    color: Colors.white,
    width: Math.round(Dimensions.get('window').width * 0.1),
    height: Math.round(Dimensions.get('window').width * 0.1),
  },


  fileContainer: {
    width: Math.round(Dimensions.get('window').width),
    height:  Math.round(Dimensions.get('window').height),
    backgroundColor: Colors.header.background,
    position: 'absolute',
  },
  fileContainerInner: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.header.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn2: {
    width: Math.round(Dimensions.get('window').width * 0.1),
    height: Math.round(Dimensions.get('window').width * 0.1),
    marginRight: sideMargins,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
  },
  fileList: {
    backgroundColor: Colors.header.background,
  },
});
