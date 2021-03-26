Backend Server
====
- Update app.json with backend URL (currently in app/constant/config)

Push Notifications
====
- https://console.aws.amazon.com/pinpoint/home?region=us-east-1
  - Android specific
    - https://console.firebase.google.com/
      - Download google-services.json and place in ./android/app/
  - Update environment variable on backend for AWS_PIN_POINT_PROJECT_ID

Admob Setup  
====
- iOS
  - Replace GADApplicationIdentifier in Info.plist
- Android
  - https://developers.google.com/admob/android/quick-start#update_your_androidmanifestxml

Google Maps
====
- iOS
  - Replace GMSServices API key in ./ios/CoreMobile/AppDelegate.m
- Android
  - Replace API key in Androidmanifest.xml
