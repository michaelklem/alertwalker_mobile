Backend Server
====
- Update app.json with backend URL

Push Notifications
====
- https://console.aws.amazon.com/pinpoint/home?region=us-east-1
  - Android specific
    - https://console.firebase.google.com/
      - Download google-services.json and place in ./android/app/
  - Update environment variable on backend for AWS_PIN_POINT_PROJECT_ID

Google Maps
====
- iOS
  - Replace GMSServices API key in ./ios/CoreMobile/AppDelegate.m
- Android
  - Replace API key in Androidmanifest.xml
