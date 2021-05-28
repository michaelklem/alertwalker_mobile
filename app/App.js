import React, { Component }  from 'react';
import { Alert, Linking, Image, NativeModules } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-community/async-storage';

import {  AppManager,
          DataManager,
          LocationManager,
          OauthManager,
          NotificationManager,
          PushManager
        } from './manager';
import { WebsocketClient } from './client';
import ApiRequest from './helper/ApiRequest';
import {AuthStack} from './route/auth';
import {MainStack} from './route/main';
import {LoadingPage} from './page/loading';

import { Images } from './constant';

import { NavigationRef } from './component/rootNavigation';
import * as RootNavigation from './component/rootNavigation.js';
import { Toast } from './component/toast';

import { getVariableValue } from './helper/querystring';

const Stack = createStackNavigator();


export default class App extends Component
{
  // MARK: - Data fields
  _pushManager = null;
  _notificationManager = null;
  _oauthManager = null;
  _dataManager = null;
  _appMgr = null;
  _activeScreenRef = null;
  _websocketClient = null;

  // MARK: - Initalizer
  constructor(props)
  {
    console.log('App()');
    super(props);
    let deepLink = null;
    if(props.deepLink)
    {
      if(props.deepLink.deeplink)
      {
        deepLink = props.deepLink.deeplink;
      }
      else if(typeof props.deepLink === 'object')
      {
        try
        {
          if(props.deepLink.calendarEventId)
          {
            deepLink = props.deepLink;
          }
          else
          {
            deepLink = null;
          }
        }
        catch(err)
        {
          console.log(err);
        }
      }
    }

    this.state =
    {
      activeStack: '',
      moreDetailVisible: false,
      user: null,
      isLoading: false,
      siteManager: null,
      pageComponents: null,
      deepLink: deepLink,
      initialRouteName: 'homeContainer',
      dataStoreInitialized: false,
    };

    // Setup data manager
    this._dataManager = DataManager.GetInstanceA(this.showAlert);

    this._activeScreenRef = React.createRef();

    console.log('Deep link: ' + props.deepLink);
  }

  // async componentWillMount()
  // {
  //   console.log('App.componentWillMount()');

  //   // await this.init();
  // }

  async componentDidMount()
  {
    console.log('App.componentDidMount()');

    // Add deep link listener
    Linking.addEventListener('url', this.handleOpenURL);

    await this.init();
  }

  componentWillUnmount()
  {
    // Remove deep link listern
    Linking.removeEventListener('url', this.handleOpenURL);
  }

  // Fetch the token from storage then navigate to our appropriate place
  init = async () =>
  {
    // Load session
    this._appMgr = await AppManager.GetInstanceAsync();
    const userToken = await AsyncStorage.getItem('token');
    let user = await AsyncStorage.getItem('user');
    user = JSON.parse(user);
    const smsVerificationRequired = await AsyncStorage.getItem('smsVerificationRequired');
    const inviteCodeRequired = await AsyncStorage.getItem('inviteCodeRequired');

    let activeStack = ((userToken && smsVerificationRequired === 'false' && inviteCodeRequired === 'false') ? 'main' : 'auth');

    let initialRouteName = this.state.initialRouteName;
    if(user && user.firstName === '' && activeStack === 'main')
    {
      initialRouteName = 'settings';
    }
    else if(user && activeStack === 'auth' && inviteCodeRequired === 'true')
    {
      initialRouteName = 'welcome';
    }
    else if(!user && activeStack === 'auth')
    {
      initialRouteName = 'login';
    }

    this.setState(
    {
      activeStack: activeStack,
      initialRouteName: initialRouteName,
      user: user,
      isLoading: true,
    });

    // Initialize data store
    await this._dataManager.initDataStore(userToken);

    if(user)
    {
      console.log('User:' + user);
      // Broke this out so we don't have to wait for it
      //await this._dataManager.execute(await new LoadCalendarEventsCommand());
      LocationManager.GetInstanceA(userToken);
    }

    // Setup push notification handler
    this._pushManager = await PushManager.GetInstance(this.onPushRegister, this.onPushNotification);

    /*PushManager.ScheduleNotification({
      message: 'Calendar event occurring in 30 minutes',
      date: new Date(),
      id: '123',
      delaySeconds: 10,
    });*/

    // Setup oauthManager handlers
    this._oauthManager = OauthManager.GetInstance();
    this._oauthManager.setAlertHandler(this.showAlert);
    this._oauthManager.setGlobalStateHandler(this.updateGlobalState);

    // Notification manager
    this._notificationManager = await NotificationManager.GetInstanceA(userToken);
    this._notificationManager.addObserver(this, 'app');

    // TODO: Make a cookie manager wrapper around AsyncStorage so we can have observers notified when something changed

    // Websockets handle system notifications and chats
    this._websocketClient = await WebsocketClient.GetInstanceA(userToken);

    this.setState({ isLoading: false, dataStoreInitialized: true }, () =>
    {
      // Handle deep link
      if(this.state.deepLink !== null)
      {
        if(this.state.deepLink.calendarEventId)
        {
          // Wait a second for stacks to update
          setTimeout(() =>
          {
            RootNavigation.navigate('calendar', { _id: this.state.deepLink.calendarEventId });
          }, 1500);
        }
        else
        {
          this._notificationManager.readNotification(({_id: this.state.deepLink }));
        }
      }
    });
  }


  // MARK: - Allow children to update state
  updateGlobalState = (id, value) =>
  {
    // TODO: If user being updated, update AsyncStorage so caller doesn't have to
    this.setState({ [id]: value });
  }

  updateStack = async (newStack) =>
  {
    let initialRouteName = 'homeContainer';
    let user = await AsyncStorage.getItem('user');
    if(user)
    {
      user = JSON.parse(user);
      if(user.firstName === '' && newStack === 'main')
      {
        initialRouteName = 'settings';
      }
    }
    this.setState({ activeStack: newStack, user: user, initialRouteName: initialRouteName });
  }

  // MARK: - Alerts
  showAlert = (title, message, onPress = null) =>
  {
    Alert.alert(title.toString(),
                message.toString(),
                [ { text: 'OK', onPress: () => onPress === null ? '' : onPress() } ],
                {cancelable: false});
  }

  // MARK: - Push
  onPushRegister = async(token) =>
  {
    console.log('App.onPushRegister() token: ' + token);

    // If guest access isn't allowed and we're not registered yet,
    // don't do anything
    if(!this._appMgr.isGuestAccessAllowed() &&
        !this.state.user)
    {
      return;
    }

    // Otherwise tell backend
    this.setState({ isLoading: true });

    try
    {
      let params = { token: token };
      let response = await ApiRequest.sendRequest("post", params, "push/token");

      console.log('App response: ' + response.data);

      // Success
      if(response.data.error === null)
      {
        this.setState({ isLoading: false });
      }
      else
      {
        this.setState({ isLoading: false  });
        this.showAlert('Error', response.data.error);
      }
    }
    catch(err)
    {
      this.setState({ isLoading: false  });
      this.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 1 ' + err, 'danger');
    }
  }

  onPushNotification = (notification) =>
  {
    console.log('App.onPushNotification() notification: ' + notification);
    //this.showAlert("Success", "Push notification was received!");

    try
    {

      let body = '';
      let deeplink = '';
      let isForeground = false;
      let isUserInteraction = false;

      // iOS
      if(notification.data && notification.data.data)
      {
        body = notification.data.data.pinpoint.body;
        deeplink = notification.data.data.pinpoint.deeplink;
        isForeground = notification.data.foreground;
        isUserInteraction = notification.data.userInteraction;
      }
      // Android comes in with just data node (if in foreground)
      else if(notification.data)
      {
        body = notification.data.body;
        deeplink = notification.data.deeplink;
        isForeground = notification.foreground;
        isUserInteraction = notification.userInteraction;
      }
      // Android from background is missing data node for some odd reason
      else
      {
        body = notification.body;
        deeplink = notification.deeplink;
        isForeground = notification.foreground;
        isUserInteraction = true;
      }

      if(isUserInteraction)
      {
        this._notificationManager.readNotification(({_id: deeplink }));
      }
      // If app is foreground show toast pop up
      /*if(isForeground)
      {
        */ //this._notificationManager.newNotification({ _id: deeplink, body: body });
      /*}
      // Otherwise read notification immediately
      else
      {
        this._notificationManager.readNotification(({_id: deeplink }));
      }*/
    }
    catch(err)
    {
      console.error(err);
    }
  }

  // MARK: - Deep linking
  /**
    This is called when the app is already open and we open a deep link
  */
  handleOpenURL = (evt) =>
  {
    const route = evt.url.replace(/.*?:\/\//g, '');
    console.log('Route: ' + route);
    this.setState({ deepLink: route });
  }

  componentDidUpdate(prevProps, prevState)
  {
    console.log('Deep link: ' + this.state.deepLink);
    if(this.state.deepLink !== prevState.deepLink)
    {
      console.log('Deep link changed');
      if(this.state.deepLink.indexOf('api') !== -1)
      {
        let qs = this.state.deepLink.substr(this.state.deepLink.indexOf('?') + 1);
        let code = getVariableValue(qs, 'code');
        let source = getVariableValue(qs, 'source');
        RootNavigation.navigate('api',
        {
          onGoBack: () => this._activeScreenRef.current.onGoBack(),
          code: code,
          source: source
        });
      }
    }
  }

  // MARK: - Render
  render()
  {
    console.log('App.render()');
    return (
    <>
      <NavigationContainer ref={NavigationRef}>
        <Stack.Navigator screenOptions={{headerShown: false}}>

          {this.state.activeStack === 'main' &&
          this.state.dataStoreInitialized &&
          <Stack.Screen name='main'>
          {(props) => <MainStack {...props}
                         updateStack={(stack) => this.updateStack(stack)}
                         user={this.state.user}
                         showAlert={this.showAlert}
                         updateGlobalState={this.updateGlobalState}
                         moreDetailVisible={this.state.moreDetailVisible}
                         deepLink={this.state.deepLink}
                         initialRouteName={this.state.initialRouteName}
                         activeScreenRef={this._activeScreenRef}
                         headerBtnPressed={() =>
                         {
                           console.log(this._activeScreenRef.current);
                           if(this._activeScreenRef.current && this._activeScreenRef.current.headerBtnPressed)
                           {
                             this._activeScreenRef.current.headerBtnPressed();
                           }
                         }}
                        />}
          </Stack.Screen>}

          {this.state.activeStack === 'auth' &&
          this.state.dataStoreInitialized &&
          <Stack.Screen name='auth'>
           {(props) => <AuthStack {...props}
                          updateStack={(stack) => this.updateStack(stack)}
                          user={this.state.user}
                          showAlert={this.showAlert}
                          updateGlobalState={this.updateGlobalState}
                          deepLink={this.state.deepLink}
                          activeScreenRef={this._activeScreenRef}
                        />}
          </Stack.Screen>}

          {(this.state.activeStack === '' ||
          !this.state.dataStoreInitialized) &&
          <Stack.Screen name='loading'>
          {(props) => <LoadingPage {...props}
                         showText={false}
                        />}
          </Stack.Screen>}

        </Stack.Navigator>
      </NavigationContainer>
      <Toast
        ref={(ref) => Toast.setRef(ref)}
      />
    </>
    );
  }
}
