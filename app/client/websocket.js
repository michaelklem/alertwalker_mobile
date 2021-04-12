import AppJson from '../../app.json';
import { DataManager, NotificationManager } from '../manager';

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
    // Initialize
    if(WebsocketClient.#instance == null)
    {
      WebsocketClient.#instance = new WebsocketClient();
    }

    // Always save token passed in on each call
    WebsocketClient.#instance.apiToken = apiToken;

    // Establish connection
    if(WebsocketClient.#instance.#client === null)
    {
      WebsocketClient.LogMsg('instantiated');
      WebsocketClient.#instance.connect();

      // We will send this on all messages so we can be identified
      WebsocketClient.#instance.#idMsg =
      {
        token: apiToken ? apiToken : ''
      };

      //console.log('\t\tClient.<Websocket> using token: ' + apiToken);
    }

    return WebsocketClient.#instance;
  }

  static GetInstance()
  {
    if(WebsocketClient.#instance == null)
    {
      throw new Error('WebsocketClient not instantiated');
    }
    return WebsocketClient.#instance;
  }

  static LogMsg(msg)
  {
    if(WebsocketClient.#instance.#dbgMode)
    {
      console.log('\t\tClient.<Websocket> ' + msg);
    }
  }

  connect()
  {
    WebsocketClient.LogMsg('creating new connection');
    WebsocketClient.#instance.#client = new WebSocket('wss' + AppJson.backendUrl.replace('https', ''));

    // Setup message handlers
    WebsocketClient.#instance.#client.onopen = WebsocketClient.#instance.onOpen;
    WebsocketClient.#instance.#client.onmessage = WebsocketClient.#instance.onMessage;
    WebsocketClient.#instance.#client.onerror = WebsocketClient.#instance.onError;
    WebsocketClient.#instance.#client.onclose = WebsocketClient.#instance.onClose;
  }

  // MARK: Token related
  validateToken(apiToken)
  {
    if(!apiToken)
    {
      WebsocketClient.LogMsg('closing connection');
      WebsocketClient.#instance.#client.close();
    }
    if(apiToken !== this.apiToken)
    {
      WebsocketClient.LogMsg('updating API token: ' + apiToken);
      WebsocketClient.#instance.apiToken = apiToken;
      const msg = WebsocketClient.#instance.#idMsg;
      msg.type = 'token';
      msg.token = apiToken;
      this.apiToken = apiToken;
      if(WebsocketClient.#instance.#client.readyState === WebsocketClient.#instance.#client.OPEN)
      {
        WebsocketClient.#instance.#client.send(JSON.stringify(msg));
      }
      else
      {
        WebsocketClient.LogMsg('connection not open: ' + WebsocketClient.#instance.#client.OPEN);
        // Try to reconnect 3 times max
        if(this.#connectionAttempt < 3)
        {
          this.#connectionAttempt += 1;
          this.connect();
          this.validateToken(apiToken);
        }
        else
        {
          WebsocketClient.LogMsg('max connection attempts reached. Goodbye.');
        }
      }
    }
  }



  // MARK: Message handlers
  onOpen = () =>
  {
    WebsocketClient.LogMsg('onOpen()');

    // Tell the server who we are
    const msg = WebsocketClient.#instance.#idMsg;
    msg.type = 'token';
    console.log(msg.token);
    WebsocketClient.#instance.#client.send(JSON.stringify(msg));

    // Kick off heart beat ping loop
    WebsocketClient.#instance.#pingTimeout = setTimeout( () =>
    {
      WebsocketClient.LogMsg('pingTimeout()');
      WebsocketClient.#instance.#client.close();

      // Reconnect
      WebsocketClient.#instance.connect();
    }, 8000 + 5000);
  }

  onMessage = (message) =>
  {
    console.log('\t\tClient.<Websocket>onMessage(' + message.data + ')');
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
    WebsocketClient.LogMsg('onError(' + JSON.stringify(err, ['message', 'arguments', 'type', 'name']) + ')');
  }

  onClose = (evt) =>
  {
    WebsocketClient.LogMsg('onClose(' + JSON.stringify(evt) + ')');
    clearTimeout(WebsocketClient.#instance.#pingTimeout);
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
      WebsocketClient.LogMsg('pingTimeout()');
      this.#client.close();
    }, 8000 + 5000);
  }
}
