import AppJson from '../../app.json';
import { DataManager, NotificationManager } from '../manager';
import AsyncStorage from '@react-native-community/async-storage';

export default class WebsocketClient
{
  static #instance = null;
  #client = null;
  #pingTimeout = null;
  #idMsg = {};
  #connectionAttempt = 0;
  apiToken = null;
  #dbgMode = true;

  // Singleton accessor
  /**
    @param  {String}  apiToken  API Token so we can identify ourselves
    @returns {WebsocketClient}
   */
  static async GetInstanceA(apiToken)
  {
      console.log('[WebsocketClient.GetInstanceA] called')
    // Initialize
    // console.log('**** websocket A instance: ' + (WebsocketClient.#instance === null))
    if(WebsocketClient.#instance === null)
    {
      console.log('[WebsocketClient.GetInstanceA] instantiating new WebsocketClient...')
      WebsocketClient.#instance = new WebsocketClient();
    }

    // Always save token passed in on each call
    WebsocketClient.#instance.apiToken = apiToken;

    // Establish connection
    // console.log('**** websocket A instance client: ' + (WebsocketClient.#instance.#client === null))
    if(WebsocketClient.#instance.#client === null)
    {
      console.log('[WebsocketClient] GetInstanceA connecting...')
      WebsocketClient.LogMsg('[websocket] instantiated');
      WebsocketClient.#instance.connect();
      WebsocketClient.#instance.#connectionAttempt = 0;

      // We will send this on all messages so we can be identified
      WebsocketClient.#instance.#idMsg =
      {
        token: apiToken ? apiToken : ''
      };

      //console.log('\t\tClient.<Websocket> using token: ' + apiToken);
    }

    console.log('[WebSocket.validateToken.GetInstanceA] connectionAttempt: ' + WebsocketClient.#instance.#connectionAttempt);

    return WebsocketClient.#instance;
  }

  static GetInstance()
  {
    // console.log('**** websocket instance: ' + (WebsocketClient.#instance === null))
    if(WebsocketClient.#instance === null)
    {
      throw new Error('WebsocketClient not instantiated');
    }
    console.log('[WebSocket.GetInstance] connectionAttempt: ' + WebsocketClient.#instance.#connectionAttempt);
    return WebsocketClient.#instance;
  }

  static LogMsg(msg)
  {
    if(WebsocketClient.#instance.#dbgMode)
    {
      console.log('\t\t[websocket] Client.<Websocket> ' + msg);
    }
  }

  close() {
    console.log('[Websocket.close] called')
    WebsocketClient.#instance.#client.close();
    // clearTimeout(this.#pingTimeout);
    WebsocketClient.#instance.#connectionAttempt = 0
    WebsocketClient.#instance.#client = null
  }
  
  connect()
  {
    let url = 'wss' + AppJson.backendUrl.replace('https', '')
    // let url = 'ws' + AppJson.backendUrl.replace('http', '')
    WebsocketClient.LogMsg('[websocket] creating new connection url: ' + url);
    WebsocketClient.#instance.#client = new WebSocket(url);

    // Setup message handlers
    WebsocketClient.#instance.#client.onopen = WebsocketClient.#instance.onOpen;
    WebsocketClient.#instance.#client.onmessage = WebsocketClient.#instance.onMessage;
    WebsocketClient.#instance.#client.onerror = WebsocketClient.#instance.onError;
    WebsocketClient.#instance.#client.onclose = WebsocketClient.#instance.onClose;
  }

  reconnect() {
    // console.log('[Websocket.reconnect] reconnect called')
    // console.log('xxxxxxx ' + WebsocketClient.#instance.#client )
    // let that = this
    // setTimeout(function() {
    //   // if (WebsocketClient.#instance.#client === null) {
    //     console.log('[Websocket.reconnect] reconnecting...')
    //     WebsocketClient.#instance.connect()
    //   // }
    // }, 3000);      
    
  }
  
  
  // MARK: Token related
  validateToken(apiToken)
  {
    console.log('[WebSocket.validateToken] called with token: ' + this.apiToken + ' and : ' + apiToken);
    
    if (WebsocketClient.#instance.#client === null) {
      console.log('[WebSocket.validateToken] socket client is null')
    }
    
    if(!apiToken)
    {
      WebsocketClient.LogMsg('[websocket] closing connection');
      WebsocketClient.#instance.#client.close();
    }
    if(apiToken !== this.apiToken)
    {
      try {
        WebsocketClient.LogMsg('[websocket] updating API token: ' + apiToken);
        WebsocketClient.#instance.apiToken = apiToken;
        const msg = WebsocketClient.#instance.#idMsg;
        msg.type = 'token';
        msg.token = apiToken;
        this.apiToken = apiToken;

        console.log('[WebSocket.validateToken] update new token with: ' + apiToken)
        console.log('[WebSocket.validateToken] connectionAttempt: ' + this.#connectionAttempt)

        if(WebsocketClient.#instance.#client.readyState === WebsocketClient.#instance.#client.OPEN)
        {
          WebsocketClient.#instance.#client.send(JSON.stringify(msg));
          this.#connectionAttempt = 0;
          console.log('[WebSocket.validateToken] connectionAttempt after success: ' + this.#connectionAttempt)
        }
        else
        {
          // this happens when you logout, we reconnect the socket.
          WebsocketClient.LogMsg('[WebSocket.validateToken] connection not open ');
          // Try to reconnect 3 times max
          if(this.#connectionAttempt < 3)
          {
            this.#connectionAttempt += 1;
            this.connect();
            this.validateToken(apiToken);
          }
          else
          {
            WebsocketClient.LogMsg('[WebSocket.validateToken] max connection attempts reached. Goodbye.');
          }
        }
      }
      catch(err) {
        console.log('[WebSocket.validateToken] exception: ' + err + ' stack: ' + err.stack)
      }
    }
  }



  // MARK: Message handlers
  onOpen = () =>
  {
    WebsocketClient.LogMsg('[websocket.onOpen]');

    // Tell the server who we are
    const msg = WebsocketClient.#instance.#idMsg;
    msg.type = 'token';
    console.log('[websocket.onOpen] token: ' + msg.id);
    WebsocketClient.#instance.#client.send(JSON.stringify(msg));

    // Kick off heart beat ping loop
    WebsocketClient.#instance.#pingTimeout = setTimeout( () =>
    {
      WebsocketClient.LogMsg('[websocket] pingTimeout() reconecting token: ' + msg.id);
      WebsocketClient.#instance.#client.close();

      // Reconnect
      WebsocketClient.#instance.connect();
    }, 8000 + 5000);
  }

  onMessage = (message) =>
  {
    console.log('\t\t[websocket] Client.<Websocket>onMessage(' + message.data + ')');
    const msg = JSON.parse(message.data);

    // Keeping connection alive
    if(msg.type === 'heartbeat')
    {
      this.heartbeat(JSON.parse(message.data));
    }
    // Notification from server
    else if(msg.type === 'notification')
    {
      NotificationManager.GetInstance().newNotification(msg.notification);
    }
    // Geofence area
    else if(msg.type === 'geofenceArea')
    {
      DataManager.GetInstance().manualInsert('geofenceAreas', 'geofenceAreas', msg.geofenceArea);
    }
    //WebsocketClient.LogMsg('message: ' + message.data);
  }

  onError = (err) =>
  {
    WebsocketClient.LogMsg('[websocket] onError(' + JSON.stringify(err, ['message', 'arguments', 'type', 'name']) + ')');
  }

  onClose = (evt) =>
  {
    console.log('[Websocket.cleanup] called')
    WebsocketClient.LogMsg('[websocket] onClose(' + JSON.stringify(evt) + ')');
    // clearTimeout(this.#pingTimeout);
    // this.reconnect()
  }


  // MARK: - Heartbeat related
  // Keep connection alive
  heartbeat(message)
  {
    WebsocketClient.LogMsg('heartbeat(' + message.id + ')');

    // Clear timeout
    clearTimeout(this.#pingTimeout);

    // Ping server
    const msg = WebsocketClient.#instance.#idMsg;
    msg.type = 'heartbeat';
    msg.id = message.id;
    this.#client.send(JSON.stringify(msg));

    this.#pingTimeout = setTimeout(() =>
    {
      WebsocketClient.LogMsg('[websocket] pingTimeout() reconnect');
      // WebsocketClient.#instance.#client.close();
      WebsocketClient.#instance.connect();
    }, 8000 + 5000);
  }
}
