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


Running on Android
====
- ./node_modules/@mauron85/react-native-background-geolocation/android/common/gradle.properties
  - Set android.enableUnitTestBinaryResources to false


- .node_modules/@mauron85/react-native-background-geolocation/android/common/VERSIONS.gradle
  - Replace
```
if (findProject('..:app') != null) {
    applicationId = project('..:app').android.defaultConfig.applicationId
} else if (findProject(':app') != null) {
    applicationId = project(':app').android.defaultConfig.applicationId
}
```
  - With
```
if (findProject('..:app') != null && project('..:app').hasProperty('android')) {
    applicationId = project('..:app').android.defaultConfig.applicationId
} else if (findProject(':app') != null && project(':app').hasProperty('android')) {
    applicationId = project(':app').android.defaultConfig.applicationId
}
  ```

- Run the command: npx jetify && npm start

- Then you should be able to build and run from Android Studio
