import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginManager,
} from 'react-native-fbsdk';

import AsyncStorage from '@react-native-community/async-storage';
import CookieManager from '@react-native-community/cookies';

import ApiRequest from '../helper/ApiRequest';

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
    return this.#_oauthTokens;
  }

  setOauthTokens(tokens)
  {
    this.#_oauthTokens = tokens;
  }

  addOauthToken(source, token)
  {
    this.#_oauthTokens[source] = token;
    this.notifyListeners({ source: source.replace('Token', ''), token: token });
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
        console.log(result);
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
    console.log(`[oauthManager:saveToken] calling API`);

    const response = await ApiRequest.sendRequest('post',
                                                  params,
                                                  'oauth/save-token');
    
    console.log(`[oauthManager:saveToken] API result: ${response.data}`);
    
    if(response.data.error !== null)
    {
      //this.setState({ isLoading: false });
      this.#_showAlert('Un-oh', response.data.error);
      return;
    }

    this.#_oauthTokens[params.source + 'Token'] = response.data.result;

    this.notifyListeners({ source: 'facebook', token: response.data.result });
  }

  async removeToken(params)
  {
    console.log(`[oauthManager:removeToken] calling API`);

    const response = await ApiRequest.sendRequest('post',
                                                  params,
                                                  'oauth/remove-token');

    console.log(`[oauthManager:removeToken] API result: ${response.data}`);

    if(response.data.error !== null)
    {
      //this.setState({ isLoading: false });
      this.#_showAlert('Un-oh', response.data.error);
      return false;
    }

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
    this.#_listeners.push({ id: id, cb: cb });
  }

  removeListener(listenerId)
  {
    for(let i = 0; i < this.#_listeners.length; i++)
    {
      if(this.#_listeners[i].id === listenerId)
      {
        this.#_listeners.splice(i, 1);
        break;
      }
    }
  }

  notifyListeners(message)
  {
    for(let i = 0; i < this.#_listeners.length; i++)
    {
      console.log('OauthManager.notifyListeners(' + this.#_listeners[i].id + ')');
      this.#_listeners[i].cb(message);
    }
  }
}
