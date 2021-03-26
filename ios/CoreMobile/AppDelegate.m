/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// MARK: - For Push notifications
#import <UserNotifications/UserNotifications.h>
#import <RNCPushNotificationIOS.h>

// MARK: - For deep linking
// https://reactnavigation.org/docs/deep-linking/
#import <React/RCTLinkingManager.h>

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

// MARK: - For Facebook login
#import <FBSDKCoreKit/FBSDKCoreKit.h>

// MARK: - For Google Maps
#import <GoogleMaps/GoogleMaps.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // MARK: - For Google Maps
  [GMSServices provideAPIKey:@"AIzaSyB1qBa4Fo-5_v3GcPR5BZzKkDrG4V9MWTA"]; // API key obtained from Google Console
  
  // MARK: - For deep links (passing initial URL as prop)
  NSString *deepLink = nil;
  NSDictionary *notification = [launchOptions objectForKey:UIApplicationLaunchOptionsRemoteNotificationKey];
  if(notification)
  {
    NSDictionary *data = [notification objectForKey:@"data"];
    if(data)
    {
      deepLink = [data valueForKey:@"pinpoint"];
    }
  }
  
  deepLink = [NSString stringWithFormat:@"%@", launchOptions];
  
  // Check local scheduled notification
  NSDictionary *localNotification = [launchOptions objectForKey:UIApplicationLaunchOptionsLocalNotificationKey];
  if(localNotification)
  {
    deepLink= [localNotification valueForKey:@"userInfo"];
    //deepLink = [NSString stringWithFormat:@"%@", data];
  }

  // MARK: - For Facebook login
  [[FBSDKApplicationDelegate sharedInstance] application:application
                           didFinishLaunchingWithOptions:launchOptions];

  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"CoreMobile"
                                            initialProperties:@{@"deepLink": deepLink ? deepLink : @""}];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  // MARK: - For Push notifications
  // Define UNUserNotificationCenter
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  center.delegate = self;

  return YES;
}

// MARK: - For Push notifications
//Called when a notification is delivered to a foreground app.
-(void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions options))completionHandler
{
  completionHandler(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge);
}

// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
 [RNCPushNotificationIOS didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
 [RNCPushNotificationIOS didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  [RNCPushNotificationIOS didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
 [RNCPushNotificationIOS didFailToRegisterForRemoteNotificationsWithError:error];
}
// IOS 10+ Required for localNotification event
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  [RNCPushNotificationIOS didReceiveNotificationResponse:response];
  completionHandler();
}
// IOS 4-10 Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
 [RNCPushNotificationIOS didReceiveLocalNotification:notification];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// MARK: - For deep linking (iOS 9.x or newer)
- (BOOL)application:(UIApplication *)application
   openURL:(NSURL *)url
   options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  //return [RCTLinkingManager application:application openURL:url options:options];
  NSString *myUrl = url.absoluteString;
  NSString *facebookAppId = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"FacebookAppID"];
  if ([myUrl containsString:facebookAppId])
  {
    return [[FBSDKApplicationDelegate sharedInstance]application:application
                                                       openURL:url
                                                       options:options];
  }
  else
  {
    return [RCTLinkingManager application:application openURL:url options:options];
  }
}

@end
