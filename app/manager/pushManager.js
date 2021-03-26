import PushNotificationIOS from "@react-native-community/push-notification-ios";
var PushNotification = require("react-native-push-notification");

export default class PushManager
{
  static singleton = null;

  // Singleton
  /**
    @returns {PushManager}
   */
  static async GetInstance(onPushRegister, onPushNotification)
  {
    // Initialize
    if(PushManager.singleton == null)
    {
      PushManager.singleton = new PushManager();
      PushManager.singleton.init(onPushRegister, onPushNotification);
    }
    return PushManager.singleton;
  }

  init(onPushRegister, onPushNotification)
  {
    PushNotification.configure(
    {
      // Called when Token is generated (iOS and Android)
      onRegister: onPushRegister,

      // (required) Called when a remote or local notification is opened or received
      onNotification: onPushNotification,

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions:
      {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /*
       (optional) default: true
        - Specified if permissions (ios) and token (android and ios) will requested or not,
        - if not, you must call PushNotificationsHandler.requestPermissions() later */
      requestPermissions: /*true*/false,
    });
    // TODO: Request permission only after registering


    // Clear badge number at start
    PushNotification.getApplicationIconBadgeNumber((number) =>
    {
      if(number > 0)
      {
        PushNotification.setApplicationIconBadgeNumber(0);
      }
    });
  }

  abandonPermissions()
  {
    PushNotification.abandonPermissions();
  }

  checkPermission(cbk)
  {
    return PushNotification.checkPermissions(cbk);
  }

  static CheckPermission(cbk)
  {
    return PushNotification.checkPermissions(cbk);
  }

  static RequestPermissions()
  {
    return PushNotification.requestPermissions();
  }

  static ScheduleNotification({ message, date, id, delaySeconds })
  {
    PushNotificationIOS.getScheduledLocalNotifications((notifications) =>
    {
      //console.log(notifications);

      let scheduleDate = new Date(date.setSeconds(date.getSeconds() - delaySeconds));
      console.log('Scheduled date: ' + scheduleDate.toString());

      // Iterate scheduled notifications and make sure not already scheduled
      let found = false;
      for(let i = 0; i < notifications.length; i++)
      {
        if(notifications[i].userInfo.calendarEventId.toString() === id)
        {
          found = true;

          // If fire date is different then update it
          let fireDate = new Date(notifications[i].fireDate).getTime();
          if(fireDate !== date.getTime())
          {
            // Need to cancel previous
            PushNotificationIOS.cancelLocalNotifications({ calendarEventId: id });

            // Schedule again
            PushNotification.localNotificationSchedule({
              message: message,
              date: scheduleDate,
              allowWhileIdle: true,
              userInfo: { calendarEventId: id }
            });
          }

          break;
        }
      }

      // Not scheduled yet
      if(!found)
      {
        PushNotification.localNotificationSchedule({
          message: message,
          date: scheduleDate,
          allowWhileIdle: true,
          userInfo: { calendarEventId: id }
        });
      }
    });
  }

  static CancelNotification(id)
  {
    PushNotificationIOS.getScheduledLocalNotifications((notifications) =>
    {
      // Iterate scheduled notifications and make sure not already scheduled
      for(let i = 0; i < notifications.length; i++)
      {
        if(notifications[i].userInfo.calendarEventId.toString() === id)
        {
          // Need to cancel previous
          PushNotificationIOS.cancelLocalNotifications({ calendarEventId: id });
          return;
        }
      }
    });
  }
}
