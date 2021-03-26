import React from 'react';
import { Dimensions, Image, Platform, Text, TouchableOpacity, SafeAreaView, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-community/async-storage';
import { StackActions } from '@react-navigation/native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';

import { AppManager, OauthManager } from '../../manager';
import { LayoverMenu } from '../layoverMenu';
import { ImageButton } from '../imageButton';
import { InstagramLoginButton } from '../loginButton';
import {AppText, Colors, Images, Styles} from '../../constant';
//import * as DrawerNavigation from '../drawerNavigation.js';

const Layout4 = ({  user,
                    route,
                    navigation,
                    headerBtnPressed,
                    moreDetailVisible,
                    updateGlobalState,
                    updateStack,
                    showAlert,
                    oauthTokens,
                    menu,
                    updateMasterState,
                    manager,
                    instagramModalVisible,
                    leftBtnShowing,
                    rightBtnShowing,
                    activeAdditionalPage,
                    logout }) =>
{
  let navigationState = navigation.dangerouslyGetState();
  let routeName = navigationState.routes[navigationState.index].name ?? 'main';

  //console.log(navigationState.routes[navigationState.index]);

  // Find route in nested navigator
  let subRoute = navigationState.routes[navigationState.index];
  //let subRoute = route.state?.routes[route.state.index];
  while(subRoute && subRoute.state)
  {
    subRoute = subRoute.state.routes[subRoute.state.index];
  }

  console.log('Sub route: ' + subRoute.name + '\nRoute name: ' + routeName + '\nActiveAdditionalPage: ' + activeAdditionalPage + '\nRight btn showing: ' + rightBtnShowing);

  let titleText = '';
  // Default styling for main route
  let leftBtnNavigation = async() =>
  {
    navigation.navigate('settings', { shouldPop: true });
  };
  let rightBtnNavigation = () =>
  {
    navigation.navigate('add', { });
  }
  let rightBtnText = AppText.header.add.text;
  let leftBtnIcon = 'more-horiz';
  let rightBtnIcon = 'add';

  //console.log(route);
  if(routeName === 'homeContainer' || routeName === 'main')
  {
    routeName = 'main';

    if(subRoute.name === 'notes')
    {
      rightBtnNavigation = async() =>
      {

      };
      rightBtnText = AppText.header.newNote.text;
    }
    else if(subRoute.name === 'add' || subRoute.name === 'map')
    {
      rightBtnIcon = '';
      leftBtnIcon = 'arrow-left';
      leftBtnNavigation = async() =>
      {
        navigation.dispatch(StackActions.pop(1));
      };
      rightBtnText = '';
    }
    else
    {
      leftBtnNavigation = async() =>
      {
        navigation.dispatch(DrawerActions.openDrawer());
      };
      rightBtnText = '';
    }
  }
  if(routeName === 'settings')
  {
    leftBtnNavigation = async() =>
    {
      updateGlobalState('deepLink', '');
      updateGlobalState('user', null);
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      updateStack('auth');
    };
  }



  return (
  <View style={{backgroundColor: Colors.white, width: Math.round(Dimensions.get('window').width)}}>
    <View style={[styles.headerContainer]}>

      {!leftBtnShowing &&
      <View style={styles.barBtnContainer}>
        <View style={styles.barBtnImage} />
        <Text style={styles.hidden}>{routeName === 'settings' || subRoute.name === 'settings' ? AppText.header.logout.text : AppText.header.settings.text}</Text>
      </View>
      }

      {leftBtnShowing &&
      <TouchableOpacity style={styles.barBtnContainer} onPress={leftBtnNavigation}>
        <Icon
          name={leftBtnIcon}
          size={h20}
          color={Colors.black}
        />
      </TouchableOpacity>}

      <Text style={styles.text}>{'Alert Walker'}</Text>

      {rightBtnShowing &&
      rightBtnIcon !== '' &&
      <TouchableOpacity style={styles.barBtnContainer} onPress={rightBtnNavigation}>
        {false &&
        <Image
          style={[styles.barBtnImage]}
          source={Images.addIcon}
        />}
        <Icon
          name={rightBtnIcon}
          size={h20}
          color={Colors.black}
        />
        {rightBtnText !== '' &&
        <Text
          adjustsFontSizeToFit={true}
          style={styles.barBtnText}>{rightBtnText}</Text>}
      </TouchableOpacity>}

      {(!rightBtnShowing || rightBtnIcon === '') &&
      <View style={styles.barBtnContainer}>
        <View style={styles.barBtnImage} />
        <Text style={styles.hidden}>{rightBtnText}</Text>
      </View>
      }

    </View>

    {menu.isOpen &&
    <LayoverMenu
      title={AppText.header.layoverMenu.title.text}
      options={menu.options}
      selectedIndex={menu.selectedIndex}
      onSelect={async(selected) =>
      {
        let tempMenu = {...menu};
        tempMenu.selectedIndex = selected;
        tempMenu.isOpen = false;
        await updateMasterState({ menu: tempMenu });

        if(tempMenu.selectedIndex !== -1)
        {
          if(tempMenu.options[selected].onClick)
          {
            tempMenu.options[selected].onClick()
            //setTimeout(() => tempMenu.options[selected].onClick(), 2000);
          }
          else
          {
            navigation.navigate(tempMenu.options[selected].route, { create: true });
          }
        }
      }}
      onClose={() =>
      {
        let tempMenu = {...menu};
        tempMenu.isOpen = false;
        updateMasterState({ menu: tempMenu });
      }}
    />}
    <InstagramLoginButton
      formInput={{name: 'instagram-login-btn'}}
      key={'instagram-login-btn-container'}
      updateMasterState={updateMasterState}
      appId={AppManager.GetInstance().getInstagramParams().appId}
      redirectUrl={AppManager.GetInstance().getInstagramParams().redirectUrl}
      managed={true}
      showAlert={showAlert}
      modalVisible={instagramModalVisible}
      onLoginSuccess={() =>
      {
        const tempMenu = {...menu};
        tempMenu.options[3].title = 'Unlink Instagram';
        updateMasterState({ menu: tempMenu });
      }}
    />
  </View>
  );
}

const height11 = Math.round(Dimensions.get('window').height * 0.0141);
const h22 = Math.round(Dimensions.get('window').height * 0.0282);
const h20 = Math.round(Dimensions.get('window').height * 0.0256);
const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.13),
    alignItems: 'center',
  },
  text: {
    width: Math.round(Dimensions.get('window').width * 0.4),
    height: Math.round(Dimensions.get('window').height * 0.04),
    textAlign: 'center',
    fontSize: h22,
  },
  barBtnText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height11,
    textAlign: 'center',
    color: Colors.white,
    marginTop: 5,
  },
  headerContainer: {
    backgroundColor: Colors.header.layout4.background,
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: '100%',
    borderBottomWidth: 1,
    width: '100%',
    borderBottomColor: Colors.darkBlue1,
  },
  barBtnImage: {
    width: Math.round(Dimensions.get('window').width * 0.05),
    height: Math.round(Dimensions.get('window').height * 0.023),
    overflow: 'visible',
    resizeMode: 'contain',
    padding: 0,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    alignContent: 'flex-start',
  },
  barBtnContainer: {
    alignSelf: 'center',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    alignContent: 'flex-start',
  },
  hidden: {
    fontSize: height11,
    textAlign: 'center',
    marginTop: 5,
    color: Colors.header.layout4.background,
  },
});

export default Layout4;
