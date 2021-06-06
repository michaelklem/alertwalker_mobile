import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager,
} from 'react-native-fbsdk';

import AsyncStorage from '@react-native-community/async-storage';
import CookieManager from '@react-native-community/cookies';
import ApiRequest from '../helper/ApiRequest';
import { WebsocketClient } from '../client';
import BackgroundGeolocation from '@mauron85/react-native-background-geolocation';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';


export default class OauthManager
{
  static singleton = null;
  #_oauthTokens = null;
  #_facebookPermissions = ['email', 'public_profile', 'user_photos', 'user_posts', 'user_link'];
  #_showAlert = null;
  #_updateGlobalState = null;
  // Holds {id: name, cb: callback}
  #_listeners = [];

  // Singleton
  /**
    @returns {OAuthManager}
   */
  static GetInstance()
  {
    // Initialize
    if(OauthManager.singleton == null)
    {
      OauthManager.singleton = new OauthManager();
    }
    return OauthManager.singleton;
  }

  setAlertHandler(handler)
  {
    this.#_showAlert = handler;
  }

  setGlobalStateHandler(handler)
  {
    this.#_updateGlobalState = handler;
  }

  /**
    Retrieve oauth tokens
  */
  getOauthTokens()
  {
    console.log(`[oauthManager:getOauthToken] tokens: ${ JSON.stringify(this.#_oauthTokens) }`);
    return this.#_oauthTokens;
  }

  setOauthTokens(tokens)
  {
    if (tokens !== null) {
      console.log(`[oauthManager:setOauthToken] tokens: ${ JSON.stringify(tokens) }`);
      this.#_oauthTokens = tokens;
    }
    else {
      console.log(`[oauthManager:setOauthToken] trying to add null tokens`);
    }
  }

  addOauthToken(source, token)
  {
    if (token !== null) {
      console.log(`[oauthManager:addOauthToken] source: ${source} token: ${token}`);
      this.#_oauthTokens[source] = token;
      this.notifyListeners({ source: source.replace('Token', ''), token: token });
    }
    else {
      console.log(`[oauthManager:addOauthToken] trying to add null token`);
    }
  }

  getFacebookPermissions()
  {
    return this.#_facebookPermissions;
  }

  hasOauthToken()
  {
    const keys = Object.keys(this.#_oauthTokens);
    console.log(`[oauthManager:hasOauthToken] keys: ${keys}`);
    for(let i = 0; i < keys.length; i++)
    {
      if(this.#_oauthTokens[keys[i]] !== null)
      {
        return true;
      }
    }
    return false;
  }


  async facebookLogin()
  {
    const result = await LoginManager.logInWithPermissions(this.#_facebookPermissions);
    if(!result.isCancelled)
    {
      let userData = await AccessToken.getCurrentAccessToken();
      let accessToken = userData.accessToken.toString()
      this.getInformationFromFacebookToken(accessToken);
      return true;
    }
    return false;
  }


  getInformationFromFacebookToken = (accessToken) =>
  {
    let params =
    {
      accessToken,
      parameters:
      {
        fields:
        {
          string: 'email, first_name, last_name, picture.type(large), id, link',
        },
      }
    };

    let meRequestHandler = (error, result) =>
    {
      if(error)
      {
        console.log('login info has error: ' + error);
      }
      else
      {
        console.log( 'oauthManager meRequestHandler result: ' + result);
        this.saveToken({
          accessToken: accessToken,
          externalId: result.id,
          url: result.link,
          source: 'facebook',
        });
      }
    };

    const myProfileRequest = new GraphRequest('/me',
                                              params,
                                              meRequestHandler);

    new GraphRequestManager().addRequest(myProfileRequest).start();
  }


  async saveToken(params)
  {
    console.log(`[oauthManager:saveToken] calling API oauth/save-token with params ${JSON.stringify( params )}`);

    const response = await ApiRequest.sendRequest('post',
                                                  params,
                                                  'oauth/save-token');
    
    console.log(`[oauthManager:saveToken] API result: ${response.data}`);
    
    if(response.data.error !== null)
    {
      this.#_showAlert('Un-oh', response.data.error);
      return;
    }

    console.log(`[oauthManager:saveToken] setting token: ${response.data.result} for source: ${params.source}`);
    this.#_oauthTokens[params.source + 'Token'] = response.data.result;

    this.notifyListeners({ source: params.source, token: response.data.result });
  }

  async logout() {

      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      await auth()
        .signOut()
        .then(
          console.log('[oauthManager.logout] user is logged out')
          // () => alert('Your are signed out!')
          );

    const keys = Object.keys(this.#_oauthTokens);
    console.log(`[oauthManager:logout] keys: ${keys}`);
    for(let i = 0; i < keys.length; i++) {
      if(this.#_oauthTokens[keys[i]] !== null)
      {
        let token = this.#_oauthTokens[keys[i]]
        console.log(`[oauthManager:logout] removing token index: ${i} : ${JSON.stringify(token)} from source: ${keys[i]}`);
        await this.removeToken( {source: keys[i]} ) 
      }
    }
    this.removeListeners()
    WebsocketClient.GetInstance().close()
    BackgroundGeolocation.stop()
  }
  
  async removeToken(params)
  {
    console.log(`[oauthManager:removeToken] calling API oauth/remove-token with params ${JSON.stringify(params)}`);

    const response = await ApiRequest.sendRequest('post',
                                                  params,
                                                  'oauth/remove-token');

    console.log(`[oauthManager:removeToken] API result: ${ JSON.stringify(response.data) }`);

    if(response.data.error !== null)
    {
      //this.setState({ isLoading: false });
      this.#_showAlert('Un-oh', response.data.error);
      return false;
    }

    console.log(`[oauthManager:removeToken] removing token for source: ${params.source}`);
    this.#_oauthTokens[params.source + 'Token'] = null;

    if(params.source === 'facebook')
    {
      await LoginManager.logOut();
    }
    else if(params.source === 'instagram')
    {
      const cookies = await CookieManager.getAll();
      console.log(`[oauthManager:removeToken] cookies: ${cookies}`);
    }

    this.notifyListeners({ source: params.source, token: null });
    return true;
  }


  // MARK: - Listener related
  addListener(id, cb)
  {
    console.log('[OauthManager.addListener] listenerId:' + id);
    this.#_listeners.push({ id: id, cb: cb });
    console.log('[OauthManager.addListener] _listeners size:' + this.#_listeners.length);
    console.log('[OauthManager.addListener] _listeners ' + JSON.stringify(this.#_listeners));
  }

  removeListener(listenerId)
  {
    console.log('[OauthManager.removeListener] listenerId:' + listenerId);
    for(let i = 0; i < this.#_listeners.length; i++)
    {
      if(this.#_listeners[i].id === listenerId)
      {
        console.log('[OauthManager.removeListener] listenerId:' + listenerId + ' removed');
        this.#_listeners.splice(i, 1);
        break;
      }
    }
  }

  removeListeners() {
    console.log('[OauthManager.removeListeners] called with size: ' + this.#_listeners.length);
    
    this.#_listeners.length = 0
    // for(let i = 0; i < this.#_listeners.length; i++)
    // {
    //   console.log('[OauthManager.removeListeners] remove listener #' + i + '(' + this.#_listeners[i].id + ')');
    //   this.#_listeners.splice(i, 1);
    // }  
    console.log('[OauthManager.removeListeners] finished with size: ' + this.#_listeners.length);
  }
  
  notifyListeners(message)
  {
    for(let i = 0; i < this.#_listeners.length; i++)
    {
      console.log('[OauthManager.notifyListeners] Notifying listener #' + i + '(' + this.#_listeners[i].id + ') with message: ' + JSON.stringify(message));
      this.#_listeners[i].cb(message);
    }
  }
}
