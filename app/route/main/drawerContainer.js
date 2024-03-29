import React, { Component } from 'react';
import { Dimensions, Image, StyleSheet, Text, View, Platform } from 'react-native';
import {  createDrawerNavigator,
          DrawerContentScrollView,
          DrawerItemList,
          DrawerItem  } from '@react-navigation/drawer';
import Animated from 'react-native-reanimated';
import AsyncStorage from '@react-native-community/async-storage';
import VersionNumber from 'react-native-version-number';

import { MyAlerts } from '../../page/main/my_alerts';
import { NotificationsPage } from '../../page/main/notifications';
import { SettingsPage } from '../../page/main/settings';

import { AppManager, OauthManager } from '../../manager';
import { ImageButton } from '../../component/imageButton';
import { HomePage } from '../../page/main/home';

import { Colors, Styles } from '../../constant';
import AppJson from '../../../app.json';

// Container for home screen using drawer for navigation
const Drawer = createDrawerNavigator();


function CustomDrawerContent({  updateGlobalState,
                                updateStack,
                                showAlert,
                                ...rest })
{
  // const translateX = Animated.interpolate(progress,
  // {
  //   inputRange: [0, 1],
  //   outputRange: [-100, 0],
  // });

  console.log('[CustomDrawerContent.render] ' + rest);

  let emailAddress = (OauthManager.GetInstance().getOauthTokens() !== null) ?
    OauthManager.GetInstance().getOauthTokens().googleToken.createdBy.email
    :
    ''

  return (
    <DrawerContentScrollView {...rest}>
      <Animated.View>

        <View style={styles.headerContainer}>
          <Text
            style={styles.emailLabel}
            adjustsFontSizeToFit={true}
            numberOfLines={1}
          >{`${emailAddress}`}</Text>
          <Text style={styles.versionLabel}>{`version ${VersionNumber.appVersion}`}</Text>
        </View>

        <DrawerItemList {...rest} />
        <DrawerItem
          label="Logout"
          onPress={async() =>
          {
            try {
              console.log('XXXX user logging out...')
              updateGlobalState('deepLink', '');
              updateGlobalState('user', null);
              await OauthManager.GetInstance().logout()
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
              console.log('XXXX user logging out done')
            } catch(err) {
              showAlert("Error","logging out error: " + err.message)
            }
            updateStack('auth');

          }}
        />
      </Animated.View>
    </DrawerContentScrollView>
  );
}

export default class DrawerContainer extends Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
    }
  }

  render()
  {
    // using this to prevent showing ui for notification settings
    let useSecondAlertType = AppManager.GetInstance().getUseSecondAlertType()

    return (
      <Drawer.Navigator
        initialRouteName='home'
        screenOptions={{ headerShown: false }}
        drawerContent={props =>
          <CustomDrawerContent
            updateGlobalState={this.props.updateGlobalState}
            updateStack={this.props.updateStack}
            showAlert={this.props.showAlert}
            {...props}
          />}
      >
        <Drawer.Screen
          name='Home'
          drawerLabel='Home'
        >
          {(props) => <HomePage {...props}
                        ref={this.props.activeScreenRef}
                        deepLink={this.props.deepLink}
                        showAlert={this.props.showAlert}
                        user={this.props.user}
                      />}
        </Drawer.Screen>
        
        <Drawer.Screen
          name='Received Alerts'
          drawerLabel='Notifications'
        >
          {(props) => <NotificationsPage {...props}
                        ref={this.props.activeScreenRef}
                        deepLink={this.props.deepLink}
                        showAlert={this.props.showAlert}
                        user={this.props.user}
                      />}
        </Drawer.Screen>

        {useSecondAlertType === 'true' &&
          <Drawer.Screen
            name='Alert preferences'
            drawerLabel='Alert preferences'
          >
            {(props) => <SettingsPage {...props}
                          ref={this.props.activeScreenRef}
                          deepLink={this.props.deepLink}
                          showAlert={this.props.showAlert}
                          user={this.props.user}
                        />}
          </Drawer.Screen>
        }

        <Drawer.Screen
          name='My Alerts'
          drawerLabel='MyAlerts'
        >
          {(props) => <MyAlerts {...props}
                        ref={this.props.activeScreenRef}
                        deepLink={this.props.deepLink}
                        showAlert={this.props.showAlert}
                        user={this.props.user}
                      />}
        </Drawer.Screen>        
      </Drawer.Navigator>
    );
  }
}


const h18 = Math.round(Dimensions.get('window').height * 0.02307);
const h15 = Math.round(Dimensions.get('window').height * 0.01923);
const h25 = Math.round(Dimensions.get('window').height * 0.03205);
const h27 = Math.round(Dimensions.get('window').height * 0.03461);

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: h15,
    paddingVertical: Platform.OS === 'ios' ? h15 : 20,
    backgroundColor: '#E5E7E9',
    marginTop: Platform.OS === 'ios' ? (-1 * h27) : -4, /* -4 makes it align with the map */
  },
  label: {
    fontFamily: 'Arial',
    fontSize: h18,
    textAlign: 'left',
    color: 'rgba(0, 0, 0, .87)',
  },
  emailLabel: {
    fontFamily: 'Arial',
    fontSize: 18,
    textAlign: 'left',
    color: 'rgba(0, 0, 0, .87)',
  },
  versionLabel: {
    fontFamily: 'Arial',
    fontSize: 14,
    textAlign: 'left',
    color: 'rgba(0, 0, 0, .87)',
  },
});
