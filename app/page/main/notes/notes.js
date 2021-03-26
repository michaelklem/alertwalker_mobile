import React, { Component } from 'react';
import {  Alert,
          Dimensions,
          Platform,
          SafeAreaView,
          StyleSheet,
          Text,
          TouchableOpacity,
          View } from 'react-native';
import ImagePicker from 'react-native-image-picker';
import ImagePickerWithCrop from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-community/async-storage';
import Swipeout from 'react-native-swipeout';
import Icon from "react-native-vector-icons/MaterialIcons";

import { ImageButton } from '../../../component/imageButton';
import { AppManager, DataManager, HeaderManager } from '../../../manager';
import { AddNoteCommand, DeleteNoteCommand, LoadNotesCommand } from '../../../command/notes';

import Layout1 from './layout-1';
import { Colors, Images, Styles } from '../../../constant';
import ApiRequest from '../../../helper/ApiRequest';
import { formatDateOnly, formatAMPM } from '../../../helper/datetime';

export default class Notes extends Component
{
  _layout = 1;
  _isMounted = false;
  _manager = null;
  _headerMgr = null;
  _dataMgr = null;
  _textEditor = null;
  _drawingBoard = null;
  _openNoteInterval = null;

  _imagePickerOptions =
  {
    title: 'Upload a photo',
    takePhotoButtonTitle: 'Take a photo',
    chooseFromLibraryButtonTitle: 'Select a photo',
    storageOptions:
    {
      skipBackup: true,
      path: 'images',
    },
  };

  constructor(props)
  {
    console.log('Notes()');
    super(props);
    let state =
    {
      dynamicLoad: false,
      selectedTemplateIndex: -1,
      isLoading: false,
      isRefreshing: false,
      menu:
      {
        isOpen: false,
        selectedIndex: 0,
        options:
        [
          { title: 'Old notes', sortBy: 1 },
          { title: 'Recent notes', sortBy: -1 }
        ]
      },
      note:
      {
        isOpen: false,
        isTemplate: false,
        title: '',
        _id: '',
        html: ''
      },
      drawingBoard:
      {
        isOpen: false,
        html: '',
      },
      editorInitialized: false,
      dataVersion: 0,
    };

    this._textEditor = React.createRef();
    this._drawingBoard = React.createRef();

    this._manager = AppManager.GetInstance();
    this.state = state;

    this._headerMgr = HeaderManager.GetInstance();

    this._dataMgr = DataManager.GetInstance();

    // On focus check if we should be creating
    props.navigation.addListener('focus', () =>
    {
      console.log("Notes.focus()");
      console.log(this.props);
      // Coming from quick add
      if(this.props.route.params && this.props.route.params.create)
      {
        this.props.navigation.setParams({ create: false });
        this.enterCreateNoteMode();
      }
      // Coming from calendar event
      else if(this.props.route.params && this.props.route.params._id)
      {
        if(this._dataMgr.getData('notes').notes)
        {
          this._openNoteInterval = setInterval(this.openNote, 100, this.props.route.params._id);
        }
      }
      else
      {
        // Hide header btn if coming back in and already in create mode
        if(this.state.note.isEditing)
        {
          this._headerMgr.hide('right');
        }
      }

      // Hide top right icon if note is already open
      if(this.state.note.isOpen)
      {
        this._headerMgr.hide('right');

        // enterCreateNoteMode will reload the Pdf editor for us so don't do it twice
        if(!this.props.route.params || !this.props.route.params.create)
        {
          // Need to update PDF editors files in case we are coming from calendar page
          this._textEditor.current.reloadPdfEditor();
        }
      }
    });

    // Before leaving the page, tell header manager to show top right icon
    props.navigation.addListener('blur', async () =>
    {
      this._headerMgr.show('right');
    });

    this._headerMgr.addListener('notes', this.onHeaderBtnPressed);
  }

  async componentDidMount()
  {
    this._isMounted = true;

    // Only load data if not already cached
    let data = this._dataMgr.getData('notes');
    if(!data || !data.notes || data.notes.length === 0)
    {
      await this.loadData();
    }
  }

  componentWillUnmount()
  {
    this._headerMgr.removeListener('notes');
  }


  // MARK: - API
  loadNote = async () =>
  {
    console.log('Notes.loadNote()');
    this.setState({ isLoading: true });
    try
    {
      let params =
      {
        title: this.state.note.title,
        isTemplate: this.state.note.isTemplate,
        html: this.state.note.html
      }
      if(this.state.note._id !== '')
      {
        params.id = this.state.note._id;
      }

      let response = await ApiRequest.sendRequest("post", params, 'note/');
      console.log(response.data);
      // Success
      if(response.data.error === null)
      {
        const note = {...this.state.note};
        note.title = response.data.results.title;
        note.isTemplate = response.data.results.isTemplate;
        note.isOpen = true;
        note.html = response.data.results.html;
        note._id = response.data.results._id;
        note.createdOn = response.data.results.createdOn;
        this.setState({
          isLoading: false,
          note: note
        }, () =>
        {
          this._textEditor.current.reloadPdfEditor();
        });
      }
      else
      {
        this.setState({ isLoading: false });
        this.props.showAlert('Error', response.data.error);
      }
    }
    catch(err)
    {
      console.log(err);
      this.setState({ isLoading: false });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  }

  refreshData = async () =>
  {
    console.log('Notes.refreshData()');
    await this.loadData();
  }

  loadData = async() =>
  {
    console.log('Notes.loadData()');
    return await this._dataMgr.execute(await new LoadNotesCommand(
      (state) => this.setState(state),
      {
        sortBy: this.state.menu.options[this.state.menu.selectedIndex].sortBy
      },
      this.state.dataVersion
    ));
  }

  saveData = async () =>
  {
    console.log('Notes.saveData()');
    this.setState({ isLoading: true });
    try
    {
      const params =
      {
        title: this.state.note.title,
        isTemplate: this.state.note.isTemplate,
        html: this.state.note.html,
        id: this.state.note._id,
      };

      console.log(params);
      let response = await ApiRequest.sendRequest("post", params, "note/");
      console.log(response.data);
      // Success
      if(response.data.error === null)
      {
        const data = this._dataMgr.getData('notes');
        let notes = data.notes;

        let found = false;
        for(let i = 0; i < notes.length; i++)
        {
          if(notes[i]._id.toString() === this.state.note._id.toString())
          {
            notes[i].html = this.state.note.html;
            notes[i].isTemplate = this.state.note.isTemplate;
            notes[i].title = this.state.note.title;
            found = true;
            break;
          }
        }

        if(!found)
        {
          const data = await this._dataMgr.execute(await new AddNoteCommand(response.data.results));
        }

        const note = {...this.state.note};
        note.isOpen = false;

        this._headerMgr.show('right');

        this.setState(
        {
          isLoading: false,
          note: note
        });
      }
      else
      {
        this.setState({ isLoading: false });
        this._headerMgr.show('right');
        this.props.showAlert('Error', response.data.error.toString());
      }
    }
    catch(err)
    {
      console.log(err);
      this.setState({ isLoading: false });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  }

  /**
    Delete a note
    @param {String}  id   ID of the note to delete
  */
  deleteNote = async(id) =>
  {
    const data = await this._dataMgr.execute(await new DeleteNoteCommand(
      (state) => this.setState(state),
      {
        model: 'note',
        id: id
      },
      this.state.dataVersion
    ));

    this.setState(
    {
      note:
      {
        isOpen: false,
        isTemplate: true,
        title: '',
        _id: '',
        html: ''
      }
    });
  }

  uploadFile = async(response) =>
  {
    console.log('Notes.uploadFile()');
    console.log(response);

    //const path = Platform.OS === "android" ? response.uri : response.uri.replace("file://", '/private');
    const path = response.uri;
    const file =
    {
      uri: path,
      name: response.fileName ? response.fileName : 'mobile-photo',
      type: response.type,
      path: path,
      fileName: response.fileName ? response.fileName : 'mobile-photo'
    };

    this.setState({ isLoading: true });
    try
    {
      const formData = new FormData();
      formData.append('type', 'image');
      formData.append('purpose', 'note:' + this.state.note._id.toString())
      formData.append('model', 'file');
      formData.append('url', file);

      let response = await ApiRequest.upload(formData, "data/create");
      console.log(response.data);

      if(response.data.error === null)
      {
        this.setState({ isLoading: false });
        this._textEditor.current.imageUploadFinished(response.data.results.url);
      }
      else
      {
        this.setState({ isLoading: false });
        this.props.showAlert('Error', response.data.error);
      }
    }
    catch(err)
    {
      console.log(err);
      this.setState({ isLoading: false });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 11 ' + err, 'danger');
    }
  }

  onHeaderBtnPressed = async() =>
  {
    await this.enterCreateNoteMode();
  }

  enterCreateNoteMode = async() =>
  {
    const {...note} = this.state.note;
    note.isOpen = false;
    note.title = '';
    note.isEditing = true;
    note.html = '';
    note.isTemplate = false;
    note._id = '';
    console.log(this.state);
    this.setState({ note: note }, () =>
    {
      this._textEditor.current.setContentHTML('');
      this._headerMgr.hide('right');
      console.log(this.state);
      this.loadNote();
    });
  }

  openImagePicker = async() =>
  {
    ImagePicker.launchImageLibrary(this._imagePickerOptions, (response) =>
    {
      console.log(response);
      if(response.didCancel)
      {
        return;
      }
      if(response.error)
      {
        this.props.showAlert('Error', response.error.toString());
        return;
      }
      else
      {
        this.uploadFile(response);
      }
    });
  }

  openCamera  = async() =>
  {
    ImagePicker.launchCamera(this._imagePickerOptions, (response) =>
    {
      console.log(response);
      if(response.didCancel)
      {
        return;
      }
      if(response.error)
      {
        this.props.showAlert('Error', response.error.toString());
        return;
      }
      else
      {
        this.uploadFile(response);
      }
    });
  }

  openImagePickerWithCrop = async() =>
  {
    console.log('Notes.openImagePickerWithCrop()');
    const file = await ImagePickerWithCrop.openPicker({
      width: 300,
      height: 400,
      cropping: true
    });
    this.uploadFile({
      uri: file.path,
      type: file.mime
    });
  }

  openNote = (noteId) =>
  {
    const notes = this._dataMgr.getData('notes').notes;
    if(notes.length > 0)
    {
      if(this._openNoteInterval)
      {
        clearInterval(this._openNoteInterval);
      }
      let tempNote = {...this.state.note};
      for(let i = 0; i < notes.length; i++)
      {
        if(notes[i]._id.toString() === noteId)
        {
          tempNote.isOpen = true;
          tempNote.title = notes[i].title;
          tempNote.html = notes[i].html;
          tempNote.isTemplate = notes[i].isTemplate;
          tempNote._id = notes[i]._id.toString();
          this._textEditor.current.setContentHTML(tempNote.html);
          this.setState({ note: tempNote }, () =>
          {
            this._textEditor.current.reloadPdfEditor();
          });
          break;
        }
      }

      this.props.navigation.setParams({ _id: '' });
      return;
    }
  }

  renderNote = (note, index) =>
  {
    const swipeBtns = [
      {
        text: 'Edit',
        backgroundColor: Colors.notesPage.title,
        onPress: () =>
        {
          let tempNote = {...this.state.note};
          tempNote.isOpen = true;
          tempNote.title = note.item.title;
          tempNote.isEditing = true;
          tempNote.html = note.item.html;
          tempNote.isTemplate = note.item.isTemplate;
          tempNote._id = note.item._id.toString();
          this._textEditor.current.setContentHTML(tempNote.html);
          this._headerMgr.hide('right');
          this.setState({ note: tempNote }, () =>
          {
            this._textEditor.current.reloadPdfEditor();
          });
        }
      },
      {
        text: 'Delete',
        backgroundColor: Colors.notesPage.title,
        onPress: () =>
        {
          Alert.alert('Confirm',
                      'Are you sure you want to delete this note?',
                      [ { text: 'Yes', onPress: () => this.deleteNote(note.item._id.toString()) }, { text: 'No', onPress: () => console.log('Not deleted') } ],
                      {cancelable: false});
        }
      },
    ];
    return (
      <Swipeout
        style={{backgroundColor: Colors.transparent}}
        right={swipeBtns}
        autoClose={true}
        key={`note-container-swipe-${index}`}
      >
        <TouchableOpacity
          key={`note-container-view-${index}`}
          style={styles.note}
          onPress={() =>
          {
            let tempNote = {...this.state.note};
            tempNote.isOpen = true;
            tempNote.title = note.item.title;
            tempNote.isEditing = false;
            tempNote.html = note.item.html;
            tempNote.isTemplate = note.item.isTemplate;
            tempNote._id = note.item._id.toString();
            this._textEditor.current.setContentHTML(tempNote.html);
            this._headerMgr.hide('right');
            this.setState({ note: tempNote });
          }}
        >
          <View style={{justifyContent: 'flex-start', flexDirection: 'row', width: '90%', alignItems: 'center', height: '100%'}}>
            <ImageButton
              key={`note-container-img-${index}`}
              imgSrc={this.props.user && this.props.user.photo ? {uri: this.props.user?.photo ?? '', cache: 'force-cache'} : Images.noPhoto}
              imageStyle={styles.userPhotoImg}
            />
            <View style={{flexDirection: 'column'}, {justifyContent: 'center'}}>
              <Text
                key={`note-container-text-${index}`}
                style={styles.title}
                numberOfLines={3}
                adjustsFontSizeToFit={true}
              >{note.item.title}</Text>
              <Text
                key={`note-container-date-${index}`}
                style={styles.date}
                numberOfLines={3}
                adjustsFontSizeToFit={true}
              >{`${formatDateOnly(note.item.createdOn)} ${formatAMPM(note.item.createdOn)}`}</Text>
            </View>
          </View>
          <View style={styles.iconContainer}>
            <Icon
              name={'arrow-forward-ios'}
              size={Math.round(Dimensions.get('window').height * 0.04)}
              color={Colors.notesPage.noteTitle}
              style={styles.moreIcon}
            />
          </View>
        </TouchableOpacity>
      </Swipeout>
    );
  }

  shouldComponentUpdate(nextProps, nextState)
  {
    return true;
  }

  async componentDidUpdate(prevProps, prevState)
  {
    if(this.state.menu.selectedIndex !== prevState.menu.selectedIndex)
    {
      await this.loadData();
    }
  }

  render()
  {
    console.log('Notes.render()');
    const data = this._dataMgr.getData('notes');
    return (
    <>
      {this._layout === 1 &&
        <Layout1
          isLoading={this.state.isLoading}
          menu={this.state.menu}
          note={this.state.note}
          notes={data.notes ? data.notes : []}
          templates={data.templates ? data.templates : []}
          user={this.props.user}
          updateMasterState={(state) => this.setState(state)}
          addNote={async(note) => await this._dataMgr.execute(await new AddNoteCommand(note))}
          showAlert={this.props.showAlert}
          textEditorRef={this._textEditor}
          drawingBoardRef={this._drawingBoard}
          drawingBoard={this.state.drawingBoard}
          onEditorInitialized={() => this.setState({ editorInitialized: true })}
          editorInitialized={this.state.editorInitialized}
          textEditorOnChange={(html) =>
          {
            const note = {...this.state.note};
            const htmlSchemaField = (data.schemaFields ? data.schemaFields : []).filter(schemaField => schemaField.name === 'html');
            if(htmlSchemaField.length > 0 && htmlSchemaField[0].maxLength < html.length)
            {
              this.props.showAlert('Uh-oh', 'This action would make your note too large to save. Please create a new note.');
              // Reset note
              this._textEditor.current.setContentHTML(note.html);
              return;
            }
            note.html = html;
            this.setState({ note: note })
          }}
          titleOnChange={(title) =>
          {
            let note = {...this.state.note};
            const htmlSchemaField = (data.schemaFields ? data.schemaFields : []).filter(schemaField => schemaField.name === 'title');
            if(htmlSchemaField.length > 0 && htmlSchemaField[0].maxLength < title.length)
            {
              this.props.showAlert('Uh-oh', 'Your title is too long');
              return;
            }
            note.title = title;
            this.setState({ note: note })
          }}
          drawingBoardOnChange={async (html) =>
          {
            console.log(html);
            const board = {...this.state.drawingBoard};
            board.html = html;
            this.setState({ drawingBoard: board });
          }}
          openImagePicker={this.openImagePicker}
          openCamera={this.openCamera}
          openImagePickerWithCrop={this.openImagePickerWithCrop}
          saveNote={this.saveData}
          renderNote={(item, index) => this.renderNote(item, index)}
          isRefreshing={this.state.isRefreshing}
          refresh={this.refreshData}
          selectTemplate={(idx) =>
          {
            const note = {...this.state.note};
            const template = {...this._dataMgr.getData('notes').templates[idx]};
            note.html = template.html;
            this._textEditor.current.setContentHTML(template.html);
            this.setState({ selectedTemplateIndex: idx, note: note });
          }}
          selectedTemplateIndex={this.state.selectedTemplateIndex}
          saveDrawing={async() =>
          {
            const file =
            {
              uri: this.state.drawingBoard.html,
              type: 'image/png'
            };
            const url = await this.uploadFile(file);
            this._textEditor.current.insertImage(url);
            const board = {...this.state.drawingBoard};
            board.isOpen = false;
            this.setState({ drawingBoard: board });
          }}
          headerManager={this._headerMgr}
        />}
      </>
    );
  }
}

const height5 = Math.round(Dimensions.get('window').height * 0.00641);
const height11 = Math.round(Dimensions.get('window').height * 0.0141);
const height14 = Math.round(Dimensions.get('window').height * 0.01794);
const height15 = Math.round(Dimensions.get('window').height * 0.01923);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height20 = Math.round(Dimensions.get('window').height * 0.0256);
const height30 = Math.round(Dimensions.get('window').height * 0.0384);
const width16 = Math.round(Dimensions.get('window').width * 0.04266);
const width30 = Math.round(Dimensions.get('window').width * 0.08);
const width20 = Math.round(Dimensions.get('window').width * 0.0533);

const styles = StyleSheet.create({
  note: {
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.1),
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkBlue1,
    paddingHorizontal: width20,
    paddingVertical: Math.round(Dimensions.get('window').height * 0.0128),
    flexDirection: 'row'
  },
  userPhotoImg: {
    width: Math.round(Dimensions.get('window').width * 0.12),
    height: Math.round(Dimensions.get('window').width * 0.12),
    borderRadius: Math.round(Dimensions.get('window').width * 0.12) / 2,
    resizeMode: 'cover',
    backgroundColor: Colors.black,
    borderColor: Colors.black,
    borderWidth: 1,
  },
  title: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height18,
    textAlign: 'left',
    width: '100%',
    height: '50%',
    marginLeft: width16,
    color: Colors.notesPage.noteTitle,
  },
  date: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height14,
    textAlign: 'left',
    width: '100%',
    height: '50%',
    marginLeft: width16,
    color: Colors.notesPage.noteTitle,
    opacity: 0.2,
  },
  moreIcon: {
    opacity: 0.1,
    alignSelf: 'flex-end',
    justifyContent: 'flex-end'
  },
  iconContainer: {
    width: '10%',
    justifyContent: 'center',
    alignContent: 'flex-end',
    alignItems: 'flex-end',
  }
});
