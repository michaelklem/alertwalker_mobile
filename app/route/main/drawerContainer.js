import React, { Component } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';
import {  createDrawerNavigator,
          DrawerContentScrollView,
          DrawerItemList,
          DrawerItem  } from '@react-navigation/drawer';
import Animated from 'react-native-reanimated';
import AsyncStorage from '@react-native-community/async-storage';
import { NotificationsPage } from '../../page/main/notifications';

import { OauthManager } from '../../manager';
import { ImageButton } from '../../component/imageButton';
import { HomePage } from '../../page/main/home';

import { Colors, Styles } from '../../constant';
import AppJson from '../../../app.json';

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

        <View style={styles.headerContainer}>
          <Text style={styles.label}>{`${OauthManager.GetInstance().getOauthTokens().googleToken.createdBy.email}`}</Text>
          <Text style={styles.label}>{`version ${AppJson.version}`}</Text>
        </View>

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
          name='previously received alerts'
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
    paddingVertical: h15,
    marginTop: -1 * h27,
    backgroundColor: '#E5E7E9',
  },
  label: {
    fontFamily: 'Arial',
    fontSize: h18,
    textAlign: 'left',
    color: 'rgba(0, 0, 0, .87)',
  },
});
