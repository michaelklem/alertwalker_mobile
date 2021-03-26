import React, {Component} from 'react';
import { Dimensions, View, TouchableOpacity, Image, Text, TextInput, StyleSheet, Platform } from "react-native";

import ImagePicker from 'react-native-image-picker';
import Icon from "react-native-vector-icons/MaterialIcons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Picker } from '@react-native-community/picker';

import {AppText, Colors, Styles} from '../../constant';
import { MyButton } from '../myButton';
import ApiRequest from '../../helper/ApiRequest';

export default class CreatePost extends Component
{
  _isMounted = false;
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
  _audienceTypes = ['Anonymous', 'Villages', 'Public'];

  constructor(props)
  {
    console.log("\tCreatePost()");
    super(props);


    let state =
    {
      audience: 'Public',
      photo: null,
      text: '',
    };
    if(props.route.params && props.route.params.post)
    {
      state.editMode = true;
      if(props.route.params.post.length > 0)
      {
        state.photo =
        {
          uri: props.route.params.post.files[0],
          name: 'mobile-photo',
          path: props.route.params.post.files[0],
          fileName: 'mobile-photo'
        };
      }
      else
      {
        state.photo = null;
      }
      state.audience = props.route.params.post.audience;
      state.text = props.route.params.post.text;
    }

    this.state = state;

    props.navigation.addListener('focus', () =>
    {
      if(this._isMounted !== true)
      {
        this._isMounted = true;
      }
      else
      {
        console.log(this.props.route.params);
        if(this.props.route.params && this.props.route.params.post)
        {
          let state =
          {
            editMode: true,
            photo: null,
            audience: this.props.route.params.post.audience,
            text: this.props.route.params.post.text
          }
          if(this.props.route.params.post.files.length > 0)
          {
            state.photo =
            {
              uri: this.props.route.params.post.files[0],
              name: 'mobile-photo',
              path: props.route.params.post.files[0],
              fileName: 'mobile-photo'
            };
          }
          this.setState(state);
        }
      }
    });
  }

  async componentDidMount()
  {
    console.log('\tCreatePost.componentDidMount()');
    //this._isMounted = true;
  }

  openImagePicker = async() =>
  {
    ImagePicker.launchImageLibrary(this._imagePickerOptions, (response) =>
    {
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
        const file =
        {
          uri: Platform.OS === "android" ? response.uri : response.uri.replace("file://", "/private"),
          name: response.fileName ? response.fileName : 'mobile-photo',
          type: response.type,
          path: Platform.OS === "android" ? response.uri : response.uri.replace("file://", "/private"),
          fileName: response.fileName ? response.fileName : 'mobile-photo'
        };
        console.log(file);
        this.setState({ photo: file });
      }
    });
  }

  createPost = async() =>
  {
    try
    {
      if(this.state.text)
      {
        this.props.updateMasterState({ isLoading: true });

        const params = new FormData();
        params.append('model', 'post');
        if(this.state.photo)
        {
          params.append('files', this.state.photo);
          console.log(this.state.photo);
        }
        params.append('text', this.state.text);
        params.append('audience', this.state.audience);
        params.append('likedBy', '_empty_array_');

        const response = await ApiRequest.sendRequest('post', params, 'data/create', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');
        if(response.data.error !== null)
        {
          this.props.updateMasterState({ isLoading: false });
          this.props.showAlert('Un-oh', response.error, 'danger');
          return;
        }

        this.setState({ text: '', photo: null, editMode: false });

        this.props.updateMasterState({ isLoading: false });
        this.props.navigation.navigate('home');
      }
    }
    catch(err)
    {
      this.props.updateMasterState({ isLoading: false });
    }
  }

  deletePost = async() =>
  {
    try
    {
      if(this.state.text)
      {
        this.props.updateMasterState({ isLoading: true });

        const params =
        {
          model: 'post',
          id: this.props.route.params.post._id.toString()
        };

        const response = await ApiRequest.sendRequest('post', params, 'data/delete');
        if(response.data.error !== null)
        {
          this.props.updateMasterState({ isLoading: false });
          this.props.showAlert('Un-oh', response.error, 'danger');
          return;
        }

        this.setState({ text: '', photo: null, editMode: false });

        this.props.updateMasterState({ isLoading: false });
        this.props.route.params.onGoBack();
        this.props.navigation.goBack();
      }
    }
    catch(err)
    {
      this.props.updateMasterState({ isLoading: false });
    }
  }

  updatePost = async() =>
  {
    try
    {
      if(this.state.text)
      {
        this.props.updateMasterState({ isLoading: true });

        const params = new FormData();
        params.append('model', 'post');
        params.append('id', this.props.route.params.post._id.toString());

        if(this.state.photo)
        {
          params.append('files', this.state.photo);
        }
        else
        {
          params.append('files', '_empty_array_');
        }
        params.append('text', this.state.text);
        params.append('audience', this.state.audience);

        const response = await ApiRequest.sendRequest('post', params, 'data/update', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');
        if(response.data.error !== null)
        {
          this.props.updateMasterState({ isLoading: false });
          this.props.showAlert('Un-oh', response.error, 'danger');
          return;
        }

        this.setState({ text: '', photo: null, editMode: false });

        this.props.updateMasterState({ isLoading: false });
        this.props.route.params.onGoBack();
        this.props.navigation.goBack();
      }
    }
    catch(err)
    {
      this.props.updateMasterState({ isLoading: false });
    }
  }

  render()
  {
    console.log(this.state);
    return (
    <View style={[Styles.paper, styles.container]}>
      <TouchableOpacity
        onPress={() =>
        {
          this.setState({ text: '', photo: null, editMode: false });
          this.props.navigation.goBack();
        }}
      >
        <Icon
          name={'arrow-back'}
          size={Math.round(Dimensions.get('window').height * 0.04)}
          color={Colors.black}
        />
      </TouchableOpacity>
      <KeyboardAwareScrollView>
        <TextInput
          autoCapitalize={'sentences'}
          autoFocus={true}
          maxLength={8192}
          multiline={true}
          numberOfLines={4}
          onChangeText={(text) => this.setState({ text: text })}
          placeholder={'Enter text here'}
          style={styles.textInput}
          value={this.state.text}
        />

          {!this.state.photo &&
          <TouchableOpacity style={styles.photoImg} onPress={this.openImagePicker}>
            <Icon
              name={'photo-library'}
              size={32}
              color={Colors.black}
            />
          </TouchableOpacity>}

          {this.state.photo &&
          <>
            <TouchableOpacity style={styles.photoImg} onPress={this.openImagePicker}>
              <Image
                style={styles.image}
                source={{uri: this.state.photo.uri}}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoImg} onPress={() => this.setState({ photo: null })}>
              <Icon
                name={'delete'}
                size={32}
                color={Colors.black}
              />
            </TouchableOpacity>
          </>}

        <Text style={styles.label}>{AppText.posts.create.audienceLabel}</Text>
        <Picker
          key={this.props.key + '-picker'}
          selectedValue={this.state.audience}
          onValueChange={(val, idx) => this.setState({ audience: val })}
        >
          {this._audienceTypes.map((val, i) =>
          {
            return <Picker.Item label={val} value={val} key={'picker-value-' + i}/>
          })}
        </Picker>
      </KeyboardAwareScrollView>
      <View style={styles.bottomBtnRow}>
        <MyButton
          buttonStyle={styles.submitBtn}
          titleStyle={Styles.authSubmitBtnText}
          title={this.state.editMode ? 'UPDATE' : 'CREATE'}
          onPress={() =>
          {
              if(this.state.editMode)
              {
                this.updatePost();
              }
              else
              {
                this.createPost();
              }
          }}
        />
        {this.state.editMode &&
        <MyButton
          buttonStyle={styles.submitBtn}
          titleStyle={Styles.authSubmitBtnText}
          title={'DELETE'}
          onPress={() =>
          {
            this.deletePost();
          }}
        />}
      </View>
    </View>);
  }
}

const styles = StyleSheet.create({
  container: {
    margin: 10,
    flex: 1,
  },
  bottomBtnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  textInput: {
    backgroundColor: Colors.separatorGray,
    borderRadius: 5,
    padding: 10,
  },
  image: {
    width:  Math.round(Dimensions.get('window').width * 0.2),
    height:  Math.round(Dimensions.get('window').height * 0.2),
    resizeMode: 'contain',
    padding: 0,
    backgroundColor: Colors.black,
  },
  label: {
    fontSize: 22,
    color: Colors.descriptionGray,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    })
  },
  submitBtn: {
    backgroundColor : Colors.white,
    borderRadius : 35,
    paddingVertical: 14,
    alignSelf: 'center',
  },
  photoImg: {
    alignItems: 'center',
    marginTop: 20,
  }
});
