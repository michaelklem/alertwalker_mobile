import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import DeviceInfo from 'react-native-device-info';
;
import ApiRequest from '../../helper/ApiRequest';
import {ConfirmResetPage} from './confirm-reset';
import {LoginPage} from './login';
import {RegisterPage} from './register';
import {ResetPage} from './reset';
import {VerifyPage} from './verify';
import { WelcomePage } from './welcome';

import {  AppManager,
          DataManager,
          IapManager,
          LocationManager,
          NotificationManager,
          OauthManager,
          PushManager } from '../../manager';
import {Styles} from '../../constant';
import { WebsocketClient } from '../../client';

export default class Auth extends Component
{
  _manager = null;
  _websocketClient = null;

  constructor(props)
  {
    console.log('Auth()');
    super(props);

    let activePageName = 'login';
    this._manager = AppManager.GetInstance();

    console.log(props.deepLink);

    if(props.deepLink)
    {
      let pageName = props.deepLink.substr(0, props.deepLink.indexOf('?'));
      let qs = props.deepLink.substr(props.deepLink.indexOf('?') + 1);

      activePageName = pageName;
    }
    else if(props.initialRouteName)
    {
      activePageName = props.initialRouteName;
    }

    this.state =
    {
      formInputs: this._manager.processFormInputsForPage(activePageName),
      isLoading: false,
      components: this._manager.getComponentsForPage(activePageName),
      activePageName: activePageName,
      inviteCodeRequired: false,
      inviteCode: '',
    };
  }

  async componentDidMount()
  {
    console.log(this.props);

    let activePageName = this.state.activePageName;

    // Cache current page
    const curPage = this._manager.getCachedPageValues(this.state.activePageName);
    curPage.formInputs = this.state.formInputs;
    this._manager.setCachedPageValues(this.state.activePageName, curPage);

    // Send to SMS verification screen
    const sendToVerify = await AsyncStorage.getItem('smsVerificationRequired');
    if(sendToVerify === 'true' || sendToVerify === true)
    {
      activePageName = 'verify-sms';
    }

    // Send to welcome if required and sms verification complete already
    const sendToWelcome = await AsyncStorage.getItem('inviteCodeRequired');
    if(sendToWelcome === 'true' || sendToWelcome === true && activePageName !== 'verify-sms')
    {
      activePageName = 'welcome';
    }

    else if(this.props.user && activePageName !== 'verify-sms' && activePageName !== 'welcome')
    {
      this.segue('main');
    }

    if(this.state.activePageName !== activePageName)
    {
      this.setState({
        formInputs: this._manager.processFormInputsForPage(activePageName),
        components: this._manager.getComponentsForPage(activePageName),
        activePageName: activePageName,
        inviteCodeRequired: (activePageName === 'welcome')
      });
    }

    this._websocketClient = WebsocketClient.GetInstance();
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


  segue = async(inputToPage) =>
  {
    let toPage = inputToPage;
    console.log('Auth.segue(' + toPage + ')');

    // Guest access
    if(toPage === 'main')
    {
      this.props.updateStack('main');
      return;
      //toPage = 'welcome';
    }

    let formInputs = {};
    let components = [];

    // Cache current page values
    const curPage = this._manager.getCachedPageValues(this.state.activePageName);
    curPage.formInputs = this.state.formInputs;
    this._manager.setCachedPageValues(this.state.activePageName, curPage);

    // Check if next page cached
    const nextPage = this._manager.getCachedPageValues(toPage);
    if(nextPage)
    {
      //console.log('Retrieving from cache');
      formInputs = {...nextPage.formInputs};
      components = [...nextPage.components];
    }
    // Retrieve from database
    else
    {
      formInputs = this._manager.processFormInputsForPage(toPage);
      components = this._manager.getComponentsForPage(toPage);
    }

    this.setState({activePageName: toPage, formInputs: formInputs, components: components });

    // Only display welcome screen for 3.5 seconds then send to main
    if(toPage === 'welcome')
    {
      // If invite code required do not segue to main after 4 seconds
      const inviteCodeRequired = await AsyncStorage.getItem('inviteCodeRequired');
      if(inviteCodeRequired !== true && inviteCodeRequired !== 'true')
      {
        setTimeout(() =>
        {
          this.segue('main');
        }, 4000);
      }
    }
  }

  isButtonEnabled = () =>
  {
    return (Validate.validateEmail(this.state.email) &&
              Validate.validatePassword(this.state.password) &&
                Validate.validateUsername(this.state.username) &&
                  Validate.validatePhone(this.state.phone));
  }

  /**
    Login a user who just logged in via third party service like Facebook
    @param  {String}  externalId  The ID of this user in the other system
    @param  {String}  email   The email of this user so we can identify them in our system
    @param  {String}  source  The third party service name
  */
  thirdPartyLogin = async({ accessToken, externalId, email, source, firstName, lastName, photo, password, url, cb }) =>
  {
    this.setState({ isLoading: true });

    const params =
    {
      accessToken: accessToken,
      externalId: externalId,
      email: email,
      source: source,
      firstName: firstName,
      lastName: lastName,
      photo: photo,
      password: password,
      url: url,
      isSimulator: DeviceInfo.isEmulator()
    };
    const response = await ApiRequest.sendRequest('post',
                                                  params,
                                                  'oauth/login');
    console.log(response.data);
    if(response.data.error !== null)
    {
      this.setState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    await AsyncStorage.setItem('smsVerificationRequired', response.data.smsVerificationRequired.toString());
    await AsyncStorage.setItem('tosRequired', response.data.tosRequired.toString());
    await AsyncStorage.setItem('inviteCodeRequired', response.data.inviteCodeRequired.toString());

    this.setState({ inviteCodeRequired: response.data.inviteCodeRequired });

    this._websocketClient.validateToken(response.data.token);

    // Save oauth token
    if(response.data.oauthTokens)
    {
      OauthManager.GetInstance().setOauthTokens(response.data.oauthTokens);
    }

    // Update third party accounts
    this._manager.setThirdPartyAccounts(response.data.thirdPartyAccounts);


    // Save receipt if premium user
    if(response.data.receipt)
    {
      IapManager.GetInstance().setReceipt(response.data.receipt);
    }

    // Initialize data store if user session changes
    await DataManager.GetInstance().initDataStore(response.data.token);

    // Initialize location manager
    await LocationManager.GetInstanceA(response.data.token);

    await NotificationManager.GetInstance().init(response.data.token);

    // TODO: Anything site manager.init is passing over needs to update as well
    // TODO: Widgets not updating
    // TODO: Subscription status not updating

    this.props.updateGlobalState('user', response.data.user);
    this.setState({ isLoading: false });

    if(source === 'apple')
    {
      this.props.showAlert('Info', 'Welcome! Take advantage of all Aspire has to offer. Use our chat feature to message fellow Aspire users by entering your phone number into Settings.');
    }

    PushManager.RequestPermissions();

    if(cb)
    {
      cb();
    }

    if(response.data.smsVerificationRequired === true)
    {
      this.segue('verify-sms');
      return;
    }
    this.segue('welcome');
  }

  verifyInviteCode = async() =>
  {
    this.setState({ isLoading: true });
    const response = await ApiRequest.sendRequest('post',
                                                  {code: this.state.inviteCode},
                                                  'user/verify-invite-code');
    console.log(response.data);
    if(response.data.error !== null)
    {
      this.setState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }
    this.setState({ isLoading: false });
    if(response.data.results === true)
    {
      await AsyncStorage.setItem('inviteCodeRequired', 'false');
      this.setState({ inviteCodeRequired: false });
      this.segue('main');
    }
  }

  componentDidUpdate(prevProps)
  {
    console.log(this.props.deepLink);
    if(this.props.deepLink !== prevProps.deepLink)
    {
      if(this.props.deepLink.indexOf('confirm-reset') !== -1)
      {
        this.segue('confirm-reset');
      }
    }
  }

  render()
  {
    console.log('Auth.render()');
    console.log(this.state.components);
    return (
    <>
      {this.state.activePageName === 'confirm-reset' &&
      <ConfirmResetPage
        isLoading={this.state.isLoading}
        displayFormInputs={() =>
        {
          return this._manager.displayFormInputs({ formInputs: this.state.formInputs,
                                                   updateMasterState: this.updateMasterState,
                                                   queryMasterState: (id) => { return this.state[id] },
                                                   navigation: this.props.navigation,
                                                   updateStack: this.props.updateStack,
                                                   showAlert: this.props.showAlert,
                                                   updateGlobalState: this.props.updateGlobalState,
                                                   segue: this.segue,
                                                   deepLink: this.props.deepLink });
        }}
        segue={(toPage) => this.segue(toPage)}
        guestAccessAllowed={this._manager.isGuestAccessAllowed()}
        layout={this._manager.getCachedPageValues(this.state.activePageName).layout}
      />}
      {this.state.activePageName === 'reset' &&
      <ResetPage
        isLoading={this.state.isLoading}
        displayFormInputs={() =>
        {
          return this._manager.displayFormInputs({ formInputs: this.state.formInputs,
                                                   updateMasterState: this.updateMasterState,
                                                   queryMasterState: (id) => { return this.state[id] },
                                                   navigation: this.props.navigation,
                                                   updateStack: this.props.updateStack,
                                                   showAlert: this.props.showAlert,
                                                   updateGlobalState: this.props.updateGlobalState,
                                                   segue: this.segue });
        }}
        segue={(toPage) => this.segue(toPage)}
        guestAccessAllowed={this._manager.isGuestAccessAllowed()}
        layout={this._manager.getCachedPageValues(this.state.activePageName).layout}
      />}
      {this.state.activePageName === 'register' &&
      <RegisterPage
        isLoading={this.state.isLoading}
        displayFormInputs={() =>
        {
           return this._manager.displayFormInputs({ formInputs: this.state.formInputs,
                                                    updateMasterState: this.updateMasterState,
                                                    queryMasterState: (id) => { return this.state[id] },
                                                    navigation: this.props.navigation,
                                                    updateStack: this.props.updateStack,
                                                    showAlert: this.props.showAlert,
                                                    updateGlobalState: this.props.updateGlobalState,
                                                    segue: this.segue });
        }}
        segue={(toPage) => this.segue(toPage)}
        guestAccessAllowed={this._manager.isGuestAccessAllowed()}
        layout={this._manager.getCachedPageValues(this.state.activePageName).layout}
      />}
      {this.state.activePageName === 'login' &&
      <LoginPage
        isLoading={this.state.isLoading}
        displayFormInputs={() =>
        {
          return this._manager.displayFormInputs({ formInputs: this.state.formInputs,
                                                   updateMasterState: this.updateMasterState,
                                                   queryMasterState: (id) => { return this.state[id] },
                                                   navigation: this.props.navigation,
                                                   updateStack: this.props.updateStack,
                                                   showAlert: this.props.showAlert,
                                                   updateGlobalState: this.props.updateGlobalState,
                                                   segue: this.segue,
                                                   login: this.thirdPartyLogin,
                                                   components: [...this.state.components] });
        }}
        segue={(toPage) => this.segue(toPage)}
        guestAccessAllowed={this._manager.isGuestAccessAllowed()}
        components={this.state.components}
        layout={this._manager.getCachedPageValues(this.state.activePageName).layout}
        updateMasterState={(state) => this.setState(state)}
      />}
      {this.state.activePageName === 'verify-sms' &&
      <VerifyPage
        isLoading={this.state.isLoading}
        displayFormInputs={() =>
        {
          return this._manager.displayFormInputs({ formInputs: this.state.formInputs,
                                                   updateMasterState: this.updateMasterState,
                                                   queryMasterState: (id) => { return this.state[id] },
                                                   navigation: this.props.navigation,
                                                   updateStack: this.props.updateStack,
                                                   showAlert: this.props.showAlert,
                                                   updateGlobalState: this.props.updateGlobalState,
                                                   segue: this.segue,
                                                   login: this.thirdPartyLogin });
        }}
        displayComponents={() =>
        {
          return this._manager.displayComponents(this.state.components,
                                          (idx, prop, value) =>
                                          {
                                            let components = [...this.state.components];
                                            components[idx][prop] = value;
                                            this.setState({ components: components });
                                          },
                                          '',
                                          null,
                                          (state) => this.setState(state),
                                          this.props.showAlert,
                                          this.props.user,
                                          this.props.navigation,
                                          this.props.deepLink,
                                          this.segue,
                                          this.props.updateGlobalState);
        }}
        segue={(toPage) => this.segue(toPage)}
        guestAccessAllowed={this._manager.isGuestAccessAllowed()}
        layout={this._manager.getCachedPageValues(this.state.activePageName).layout}
        updateMasterState={(state) => this.setState(state)}
      />}
      {this.state.activePageName === 'welcome' &&
      <WelcomePage
        isLoading={this.state.isLoading}
        updateGlobalState={this.props.updateGlobalState}
        user={this.props.user}
        segue={(toPage) => this.segue(toPage)}
        layout={this._manager.getCachedPageValues(this.state.activePageName).layout}
        inviteCodeRequired={this.state.inviteCodeRequired}
        updateMasterState={(state) => this.setState(state)}
        inviteCode={this.state.inviteCode}
        verifyInviteCode={this.verifyInviteCode}
      />}
      </>
    );
  }
}
