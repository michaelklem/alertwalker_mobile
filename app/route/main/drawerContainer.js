import React, { Component } from 'react';
import { Image, Text } from 'react-native';
import {  createDrawerNavigator,
          DrawerContentScrollView,
          DrawerItemList,
          DrawerItem  } from '@react-navigation/drawer';
import Animated from 'react-native-reanimated';
import AsyncStorage from '@react-native-community/async-storage';
import { NotificationsPage } from '../../page/main/notifications';

import { ImageButton } from '../../component/imageButton';
import { HomePage } from '../../page/main/home';

import { Colors, Styles } from '../../constant';

// Container for home screen using drawer for navigation
const Drawer = createDrawerNavigator();


function CustomDrawerContent({  updateGlobalState,
                                updateStack,
                                progress,
                                ...rest })
{
  const translateX = Animated.interpolate(progress,
  {
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  console.log(rest);

  return (
    <DrawerContentScrollView {...rest}>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <DrawerItemList {...rest} />
        <DrawerItem
          label="logout"
          onPress={async() =>
          {
            updateGlobalState('deepLink', '');
            updateGlobalState('user', null);
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
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
          name='home'
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
          name='notifications'
          drawerLabel='Notifications'
        >
          {(props) => <NotificationsPage {...props}
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
