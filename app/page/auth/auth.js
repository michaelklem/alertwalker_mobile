import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import DeviceInfo from 'react-native-device-info';
;
import ApiRequest from '../../helper/ApiRequest';
import {LoginPage} from './login';

import {  AppManager,
          DataManager,
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
    console.log('[Auth.constructor]');
    super(props);

    let activePageName = 'login';
    this._manager = AppManager.GetInstance();

    console.log(`[Auth.constructor] props.deepLink: ${props.deepLink}`);

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
    };
  }

  async componentDidMount()
  {
    console.log(`[Auth.componentDidMount] props: ${JSON.stringify(this.props)}`);

    let activePageName = this.state.activePageName;

    // Cache current page
    const curPage = this._manager.getCachedPageValues(this.state.activePageName);
    curPage.formInputs = this.state.formInputs;
    this._manager.setCachedPageValues(this.state.activePageName, curPage);

    if(this.props.user)
    {
      this.segue('main');
    }

    if(this.state.activePageName !== activePageName)
    {
      this.setState({
        formInputs: this._manager.processFormInputsForPage(activePageName),
        components: this._manager.getComponentsForPage(activePageName),
        activePageName: activePageName,
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

    // this.props.showAlert('Un-oh', toPage);

    // 666
    // Guest access
    if(toPage === 'main')
    {
      this.props.updateStack('main');
      return;
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

    console.log( `[Auth.thirdPartyLogin] calling API with params ${JSON.stringify(params)}`);

    // calls server oauth-controller.login method
    const response = await ApiRequest.sendRequest('post',
                                                  params,
                                                  'oauth/login');

    console.log( `[Auth.thirdPartyLogin] response.data: ${JSON.stringify(response.data)}`);

    if(response.data.error !== null)
    {
      this.setState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

      // this.props.showAlert('Error', "thirdpartylogin 1");

    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(response.data.user));

    this._websocketClient.validateToken(response.data.token);

    // Save oauth token
    if(response.data.oauthTokens)
    {
      OauthManager.GetInstance().setOauthTokens(response.data.oauthTokens);
    }

      // this.props.showAlert('Error', "thirdpartylogin 2");

    // Update third party accounts
    this._manager.setThirdPartyAccounts(response.data.thirdPartyAccounts);

    // Initialize data store if user session changes
    await DataManager.GetInstance().initDataStore(response.data.token);

    // Initialize location manager
    await LocationManager.GetInstanceA(response.data.token);

    await NotificationManager.GetInstance().init(response.data.token);

      // this.props.showAlert('Error', "thirdpartylogin 3");

    this.props.updateGlobalState('user', response.data.user);
    this.setState({ isLoading: false });

    PushManager.RequestPermissions();

    if(cb)
    {
      // this.props.showAlert('Error', "thirdpartylogin 3aaaaa");
      cb();
    }

      // this.props.showAlert('Error', "thirdpartylogin 4");
    this.segue('main');
  }

  render()
  {
    console.log(`[OauthManager:render] ${JSON.stringify(this.state.components)}`);

    return (
    <>
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
      </>
    );
  }
}
