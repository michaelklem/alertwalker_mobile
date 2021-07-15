import { Toast } from '../component/toast';
import ApiRequest from '../helper/ApiRequest';
import * as RootNavigation from '../component/rootNavigation.js';

export default class NotificationManager
{
  static #instance = null;

  // User's notifications
  #notifications = [];
  #observers = [];

  /**
    Singleton accessor
    @param  {String}  apiToken   So we cna interact with API
    @returns {NotificationManager}
   */
  static async GetInstanceA(apiToken)
  {
    // Initialize
    if(NotificationManager.#instance == null)
    {
      NotificationManager.#instance = new NotificationManager();

      // Get details from backend
      await NotificationManager.#instance.init(apiToken);
    }
    return NotificationManager.#instance;
  }

  /**
     Singleton accessor
    @returns {NotificationManager}
   */
  static GetInstance()
  {
    return NotificationManager.#instance;
  }


  // Retrieve information from backend
  async init(apiToken)
  {
    console.log('\t\tNotificationManager.init()');
    if(!apiToken)
    {
      this.#notifications = [];
      return;
    }
    try
    {
      var response = await ApiRequest.sendRequest("post", {}, "notification/init", apiToken);
      if(response.data.error !== null)
      {
        console.error('[NotificationManager.init] error: ' + response.data.error);
        return false;
      }
      
      console.log(`[NotificationManager.init] notifications found for token ${apiToken}: ${ JSON.stringify(response.data.results) }`);

      this.#notifications = response.data.results;
      return true;
    }
    catch(err)
    {
      console.log('NotificationManager.init error2: ' + err + '\nError stack: ' + err.stack);
      return false;
    }
  }

  /**
    Get notifications
  */
  getNotifications()
  {
    return this.#notifications;
  }

  /**
    Set notifications
    @param  {Array.<Notification>}  notifications   Notifications
  */
  setNotifications(notifications)
  {
    this.#notifications = notifications;
    this.dataReloaded();
  }

  /**
    Mark notification as read internally only
  */
  markRead(notification)
  {
    console.log('\t\tNotificationManager.markRead()');
    // Find notification and mark it read
    let dataChanged = false;
    for(let i = 0; i < this.#notifications.length; i++)
    {
      if(this.#notifications[i]._id.toString() === notification._id.toString())
      {
        dataChanged = true;
        this.#notifications[i].status = 'read';
        break;
      }
    }

    // Notify observers
    if(dataChanged)
    {
      this.dataReloaded();
    }
  }


  /**
    Notify observers that data reloaded
  */
  dataReloaded()
  {
    console.log('\t\tNotificationManager.dataReloaded()');
    for(let i = 0; i < this.#observers.length; i++)
    {
      if(typeof this.#observers[i].dataReloaded === "function")
      {
        this.#observers[i].observer.dataReloaded();
      }
    }
  }

  /**
    Add new observer to list
  */
  addObserver(observer, id)
  {
    let found = false;
    for(let i = 0; i < this.#observers.length; i++)
    {
      if(this.#observers[i].id === id)
      {
        found = true;
        break;
      }
    }

    if(!found)
    {
      this.#observers.push({ id: id, observer: observer });
    }
  }

  removeObserver(id)
  {
    for(let i = 0; i < this.#observers.length; i++)
    {
      if(this.#observers[i].id === id)
      {
        this.#observers.splice(i, 1);
        break;
      }
    }
  }



  /**
    Parse out notification body and substitute pointers with actual values
    @param  {Notification}  notification  The notification to parse
    @returns  {String}  parsed body
  */
  parseNotificationBody(notification)
  {
    let parsedBody = '';
    let processingBody = notification.body;
    let index = processingBody.indexOf('{{');
    let ptrValue = '';
    while(index !== -1)
    {
      if(index !== 0)
      {
        parsedBody += processingBody.substr(0, index);
      }
      ptrValue = processingBody.substr(index + 2, processingBody.indexOf('}}') - 2);
      processingBody = processingBody.substr(processingBody.indexOf('}}'), processingBody.length);
      parsedBody += this.extractValueFromPointer(ptrValue, notification);
      index = processingBody.indexOf('{{');
    }
    if(processingBody.length > 0)
    {
      parsedBody += processingBody.replace('}}', '');
    }
    return parsedBody;
  }

  base64EncodeUnicode(str)
  {
    // First we escape the string using encodeURIComponent to get the UTF-8 encoding of the characters,
    // then we convert the percent encodings into raw bytes, and finally feed it to btoa() function.
    let utf8Bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
            return String.fromCharCode('0x' + p1);
    });

    return btoa(utf8Bytes);
  }

  extractValueFromPointer(iFieldName, iRow)
  {
    //console.log(iFieldName);

    var visibleText = "";
    var fieldName = iFieldName;
    var fieldNameInPtr = "";
    var row = iRow;

    // Get total pointers in key
    let occurrences = (fieldName.match(/\./g) || []).length;
    if(occurrences === 0)
    {
      return iRow[iFieldName];
    }

    // Iterate all pointers
    var splitIndex = -1;
    for(var i = 0; i < occurrences; i++)
    {
      splitIndex = fieldName.indexOf('.');
      try
      {
        // Extract pointer
        fieldNameInPtr  = fieldName.substring(splitIndex + 1);
        fieldName = fieldName.substring(0, splitIndex);

        // Slowly parse down the data
        if(fieldNameInPtr.indexOf('.') !== -1)
        {
          row = row[fieldName];
        }
        else
        {
          return row[fieldName][fieldNameInPtr];
        }
        fieldName = fieldNameInPtr;
      }
      catch(err)
      {
        console.log("Pointer: " + fieldNameInPtr + " not found in property " + fieldName)
        return "";
      }
    }
  }

  /**
    Add new notification and read it/show it
    @param  {Notification}  notification  New notification to add
  */
  newNotification(notification)
  {
    this.#notifications.unshift(notification);
    this.showNotification(notification);
  }

  /**
    Show notification
  */
  showNotification = (notification) =>
  {
    console.log('\t\tNotificationManager.showNotification()');

    let routeName = RootNavigation.getCurrentRoute();


    Toast.show({
      type: 'info',
      position: 'top',
      text1: notification.title,
      text2: this.parseNotificationBody(notification),
      visibilityTime: 5000,
      autoHide: true,
      onPress: () =>
      {
        this.readNotification(notification);
      },
      onLeadingIconPress: () =>
      {
        this.readNotification(notification);
      },
      onTrailingIconPress: () =>
      {
        this.readNotification(notification);
      }
    });
  }

  /**
    Read a notification
  */
  readNotification = async (notification) =>
	{
		console.log('NotificationManager.readNotification()');
		try
		{
      const params =
      {
        id: notification._id
      };
      const response = await ApiRequest.sendRequest("post", params, "notification/read");

			if(response.data.error !== null)
			{
				//this.setState({ isLoading: false });
				//this.showAlert('Un-oh', response.data.error);
        console.log(response.data.error);
				return;
			}

      console.log('NotificationManager.readNotification response: ' + JSON.stringify(response.data) );

      // Tell notification manager we read this
      this.markRead(response.data.results.document);

      // Add to list if we need to
      let needToAdd = true;
      for(let i = 0; i < this.#notifications.length; i++)
      {
        if(this.#notifications[i]._id.toString() === notification._id.toString())
        {
          needToAdd = false;
          break;
        }
      }
      if(needToAdd)
      {
        this.#notifications.unshift(response.data.results.document);
      }

      if(response.data.results.type === 'message')
      {
        let routeName = RootNavigation.getCurrentRoute();
        for(let i = 0; i < this.#observers.length; i++)
        {
          if(typeof this.#observers[i].observer.newNotification === "function")
          {
            this.#observers[i].observer.newNotification({ notification: notification, message: response.data.results.document });
          }
        }
      }
      else if(response.data.results.type === 'geofencearea')
      {
        console.log('going to show the alert ' + JSON.stringify(response.data.results.document))
        RootNavigation.navigate('map', { geofenceArea: response.data.results.document });
      }
		}
		catch(err)
		{
      console.log(err);
			//this.props.updateMasterState({ isLoading: false });
			//this.props.showAlert(true, 'Un-oh', 'An error has occurred, please try again or contact support.\nError: ' + err);
		}
	}
}
