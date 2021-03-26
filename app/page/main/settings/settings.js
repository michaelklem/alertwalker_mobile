import React, { Component } from 'react';
import { Platform, SafeAreaView, StyleSheet} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-community/async-storage';

import {  AppManager,
          DataManager,
          IapManager,
          OauthManager
        } from '../../../manager';

import Layout1 from './layout-1';
import Layout2 from './layout-2';
import Layout3 from './layout-3';
import Layout4 from './layout-4';
import Colors from '../../../constant/Colors';
import Styles from '../../../constant/Styles';
import ApiRequest from '../../../helper/ApiRequest';
import { LoadCalendarEventsCommand } from '../../../command/calendar';

export default class Settings extends Component
{
  _isMounted = false;
  _manager = null;
  _iapMgr = null;

  // Flag to indicate if modal should close or not after updating user
  _needToHideModal = false;

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
    console.log('Settings()');
    super(props);

    // Setup IAP manager so we can get notifications when receipt is updated
    this._iapMgr = IapManager.GetInstance();
    const receipt = this._iapMgr.getReceipt();
    this._iapMgr.addListener('settings', (rcpt) =>
    {
      const isUpgraded = (rcpt !== null && rcpt.status === 'active');
      console.log(rcpt);
      if(isUpgraded)
      {
        this.setState({ isUpgraded: isUpgraded, isPaying: false });
      }
      else
      {
        this.setState({ isUpgraded: isUpgraded });
      }
    });

    let state =
    {
      isLoading: false,
      isEditing: false,
      user: null,
      customDetails: null,
      formInputs: {},
      dynamicLoad: {},
      isPaying: false,
      isUpgraded: (receipt !== null && receipt.status === 'active'),
      iapSubscription: null,
    };

    // Retrieve form inputs
    this._manager = AppManager.GetInstance();
    const formInputs = this._manager.processFormInputsForPage('settings');
    console.log(formInputs);
    state.formInputs = formInputs;

    // Check if dynamic load or not
    const custom = this._manager.getCustomForPage('settings');
    state.dynamicLoad = custom ? custom.dynamicLoad : false;

    this.state = state;
  }

  componentWillUnmount()
  {
    this._iapMgr.removeListener('settings');

  }

  /**
    Allow child page to update our formInput state
    @param  {String}  id  Id of state to update
    @param  {Any}     value   The value to update to
  */
  updateMasterState = (id, value) =>
  {
    let isFormInput = false;
    let formInputs = {...this.state.formInputs};

    const keys = Object.keys(formInputs);
    for(let i = 0; i < keys.length; i++)
    {
      if(formInputs[keys[i]].name === id)
      {
        isFormInput = true;
        break;
      }
    }

    if(isFormInput)
    {
      formInputs[id].value = value;
      this.setState({formInputs});
    }
    else
    {
      this.setState({ [id]: value });
    }
  }

  async componentDidMount()
  {
    let subscriptions = await this._iapMgr.getSubscriptions();
    if(subscriptions.length > 0)
    {
      console.log(subscriptions);
      this.setState({ iapSubscription: subscriptions[0] });
    }

    // Only refresh from backend if dynamic mode on
    // otherwise use user prop passed in
    if(!this.state.dynamicLoad)
    {
      await this.me();
    }
    this._isMounted = true;
  }

  onGoBack = () =>
  {
    console.log("Refreshing onGoBack");
    if(this._isMounted !== true)
    {
      this._isMounted = true;
    }
    else
    {
      this.me();
    }
  }

  me = async () =>
  {
    console.log('Settings.me()');
    this.setState({ isLoading: true });
    try
    {
      let response = await ApiRequest.sendRequest("post", {}, "user/me");

      // Success
      if(response.data.error === null)
      {
        // Populate form fields with user values
        let formInputs = {...this.state.formInputs};
        const inputKeys = Object.keys(formInputs);
        const userKeys = Object.keys(response.data.results);
        for(let i = 0; i < inputKeys.length; i++)
        {
          for(let j = 0; j < userKeys.length; j++)
          {
            if(userKeys[j] === inputKeys[i])
            {
              formInputs[inputKeys[i]].value = response.data.results[userKeys[j]];
              break;
            }
          }
        }

        OauthManager.GetInstance().setOauthTokens(response.data.customDetails);

        this.setState(
        {
          isLoading: false,
          user: response.data.results,
          customDetails: response.data.customDetails
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
        this.uploadFile(response);
      }
    });
  }

  uploadFile = async(response) =>
  {
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
      formData.append('photo', file);
      formData.append('model', 'user');

      let response = await ApiRequest.upload(formData, "user/upload");
      console.log(response.data);
      // Success
      if(response.data.error === null)
      {
        this.props.updateGlobalState('user', response.data.results);
        this.setState({ isLoading: false });
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

  saveDetails = async() =>
  {
    this.setState({ isLoading: true });
    try
    {
      let params = { };
      const keys = Object.keys(this.state.formInputs);
      for(let i = 0; i < keys.length; i++)
      {
        params[keys[i]] = this.state.formInputs[keys[i]].value;
      }
      console.log(params);
      let response = await ApiRequest.sendRequest("post", params, 'user/update');

      this.setState({ isLoading: false });

      console.log(response.data);
      if(response.data.error !== null)
      {
        this.props.showAlert('Error', 'An error has occurred, please try again or contact support.');
        return;
      }

      await AsyncStorage.setItem('user', JSON.stringify(response.data.results));
      this.props.updateGlobalState('user', response.data.results);

      if(this.props.route &&
        this.props.route.params &&
        this.props.route.params.shouldPop)
      {
        try
        {
          this.props.navigation.pop();
        }
        catch(err)
        {
          this.props.navigation.navigate('homeContainer');
        }
      }
      else
      {
        this.props.navigation.navigate('homeContainer');
      }
    }
    catch(err)
    {
      this.setState({ isLoading: false });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 2 ' + err);
    }
  }

  logout = async() =>
  {
    await this.props.updateGlobalState('deepLink', '');
    this.props.updateGlobalState('user', null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    this.props.updateStack('auth');
  }

  reloadCalendar = async() =>
  {
    await DataManager.GetInstance().execute(await new LoadCalendarEventsCommand());
  }

  shouldComponentUpdate(nextProps, nextState)
  {
    if(nextProps.user !== this.props.user)
    {
      this._needToHideModal = true;
    }
    return true;
  }

  componentDidUpdate(prevProps, prevState)
  {
    if(this._needToHideModal)
    {
      this._needToHideModal = false;
      this.setState({ isEditing: false });
    }
    // If oauth tokens have changed tell data store
    if(prevState.customDetails &&
      (prevState.customDetails.googleToken !== this.state.customDetails.googleToken ||
      prevState.customDetails.microsoftToken !== this.state.customDetails.microsoftToken))
      {
        this.reloadCalendar();
      }
  }

  render()
  {
    console.log('Settings.render()');
    const layout = this._manager.getCachedPageValues('settings').layout;
    return (
    <>
    {layout === 1 &&
      <Layout1
        isLoading={this.state.isLoading}
        displayFormInputs={() =>
        {
          return this._manager.displayFormInputs({ formInputs: this.state.formInputs,
                                                   updateMasterState: this.updateMasterState,
                                                   queryMasterState: (id) => { return this.state[id] },
                                                   navigation: this.props.navigation,
                                                   updateStack: this.props.updateStack,
                                                   showAlert: this.props.showAlert,
                                                   updateGlobalState: this.props.updateGlobalState });
        }}
      />
      }
      {layout === 2 &&
        <Layout2
          isLoading={this.state.isLoading}
          displayFormInputs={() =>
          {
            return this._manager.displayFormInputs({ formInputs: this.state.formInputs,
                                                     updateMasterState: this.updateMasterState,
                                                     queryMasterState: (id) => { return this.state[id] },
                                                     navigation: this.props.navigation,
                                                     updateStack: this.props.updateStack,
                                                     showAlert: this.props.showAlert,
                                                     updateGlobalState: this.props.updateGlobalState });
          }}
          user={this.props.user}
          customDetails={this.state.customDetails}
          isEditing={this.state.isEditing}
          editModeOnChange={() => this.setState({ isEditing: !this.state.isEditing })}
          openImagePicker={this.openImagePicker}
          logout={this.logout}
        />}
        {layout === 3 &&
          <Layout3
            isLoading={this.state.isLoading}
            displayFormInputs={() =>
            {
              return this._manager.displayFormInputs({ formInputs: this.state.formInputs,
                                                       updateMasterState: this.updateMasterState,
                                                       queryMasterState: (id) => { return this.state[id] },
                                                       navigation: this.props.navigation,
                                                       updateStack: this.props.updateStack,
                                                       showAlert: this.props.showAlert,
                                                       updateGlobalState: this.props.updateGlobalState });
            }}
            user={this.props.user}
            customDetails={this.state.customDetails}
            isEditing={this.state.isEditing}
            editModeOnChange={() => this.setState({ isEditing: !this.state.isEditing })}
            openImagePicker={this.openImagePicker}
            logout={this.logout}
          />}
          {layout === 4 &&
            <Layout4
              isLoading={this.state.isLoading}
              displayFormInputs={() =>
              {
                return this._manager.displayFormInputs({ formInputs: this.state.formInputs,
                                                         updateMasterState: this.updateMasterState,
                                                         queryMasterState: (id) => { return this.state[id] },
                                                         navigation: this.props.navigation,
                                                         updateStack: this.props.updateStack,
                                                         showAlert: this.props.showAlert,
                                                         updateGlobalState: this.props.updateGlobalState });
              }}
              user={this.props.user}
              customDetails={this.state.customDetails}
              isEditing={this.state.isEditing}
              editModeOnChange={() => this.setState({ isEditing: !this.state.isEditing })}
              openImagePicker={this.openImagePicker}
              saveDetails={this.saveDetails}
              updateMasterState={(state) => this.setState(state)}
              showAlert={this.props.showAlert}
              logout={this.logout}
              isPaying={this.state.isPaying}
              isUpgraded={this.state.isUpgraded}
              iapSubscription={this.state.iapSubscription}
            />}
          </>
    );
  }
}

const styles = StyleSheet.create({
  body: {
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowColor: '#000000',
    shadowOffset: { height: -4, width: 1 },
  },
  buttonText: {
    fontFamily: 'Arial',
    fontSize: 16,
    color: Colors.white,
    textAlign:'center',
  },
  saveBtn: {
    width: '100%',
    height: 45,
    backgroundColor: Colors.burnoutGreen,
    borderRadius: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 20,
  },
});
