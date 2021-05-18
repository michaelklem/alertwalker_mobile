import React from 'react';
import { Dimensions, Image, Platform, Text, SafeAreaView, StyleSheet, View , Button} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-community/async-storage';
import { StackActions } from '@react-navigation/native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import {
  TouchableOpacity,
} from 'react-native-gesture-handler';

import { AppManager, OauthManager } from '../../manager';
import { ImageButton } from '../imageButton';
import {AppText, Colors, Images, Styles} from '../../constant';
//import * as DrawerNavigation from '../drawerNavigation.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faBars, faArrowLeft } from '@fortawesome/free-solid-svg-icons'



const Layout4 = ({  user,
                    route,
                    navigation,
                    updateGlobalState,
                    updateStack,
                    showAlert,
                    updateMasterState,
                    isCreateMode,
                    headerMgr,
                    logout }) =>
{
  let navigationState = navigation.dangerouslyGetState();
  let routeName = navigationState.routes[navigationState.index].name ?? 'main';

  // Find route in nested navigator
  let subRoute = navigationState.routes[navigationState.index];
  //let subRoute = route.state?.routes[route.state.index];
  while(subRoute && subRoute.state)
  {
    subRoute = subRoute.state.routes[subRoute.state.index];
  }

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
  let leftBtnText = '';
  let rightBtnText = '';
  let leftBtnIcon = faBars;
  let rightBtnIcon = '';

  if(routeName === 'homeContainer' || routeName === 'main')
  {
    routeName = 'main';
    if(subRoute.name === 'add' || subRoute.name === 'map' || isCreateMode)
    {
      console.log('isCreateMode: ' + isCreateMode)
      // only need to display the save/add alert icon when in create mode
      rightBtnIcon = isCreateMode ? 'post-add' : '';
      leftBtnIcon = faArrowLeft;
      leftBtnNavigation = async() =>
      {
        headerMgr.notifyListeners({ route: 'view-map', side: 'left' });
        headerMgr.notifyListeners({ route: 'create-map', side: 'left' });
      };
      rightBtnNavigation = async() =>
      {
        headerMgr.notifyListeners({ route: 'create-map', side: 'right' });
      };
      rightBtnText = '';
      leftBtnText = ''
    }
    else
    {
      leftBtnNavigation = async() =>
      {
        navigation.dispatch(DrawerActions.openDrawer());
      };
    }
  }

  return (
    <View style={[styles.headerContainer]}>

      {/* Left side space */}
      {(leftBtnIcon === '' && leftBtnText === '') &&
      <View style={styles.barBtnContainer}>
        <View style={styles.barBtnImage} />
        <Text style={styles.hidden}>{routeName === 'settings' || subRoute.name === 'settings' ? AppText.header.logout.text : AppText.header.settings.text}</Text>
      </View>}

      {/* Left btn/text */}
      {(leftBtnIcon !== '' || leftBtnText !== '') &&
        <TouchableOpacity style={styles.barBtnContainer} onPress={leftBtnNavigation}>
          {leftBtnIcon !== '' &&
          <FontAwesomeIcon
            icon={ leftBtnIcon }
            size={h20}
          />
          }
          {leftBtnText !== '' &&
          <Text
            adjustsFontSizeToFit={true}
            style={styles.barBtnText}>{leftBtnText}</Text>}
        </TouchableOpacity>
      }

      {/* Title text */}
      <Text style={styles.text}>{isCreateMode ? 'New Alert' : 'Alert Walker'}</Text>

      {/* Right btn/text */}
      {(rightBtnIcon !== '' || rightBtnText !== '') &&
      <TouchableOpacity style={styles.saveButtonContainer} onPress={rightBtnNavigation}>
        {rightBtnIcon !== '' &&
        <Button 
          title='Save'
          color='green'
        />
        }
        {rightBtnText !== '' &&
        <Text
          adjustsFontSizeToFit={true}
          style={styles.barBtnText}>{rightBtnText}</Text>}
      </TouchableOpacity>}

      {/* Right side space */}
      {(rightBtnIcon === '' && rightBtnText === '') &&
      <View style={styles.barBtnContainer2} />}

    </View>
  );
}

const height11 = Math.round(Dimensions.get('window').height * 0.0141);
const h22 = Math.round(Dimensions.get('window').height * 0.0282);
const h20 = Math.round(Dimensions.get('window').height * 0.0256);
const h8 = Math.round(Dimensions.get('window').height * 0.0102);

const styles = StyleSheet.create({
  text: {
    height: Math.round(Dimensions.get('window').height * 0.04),
    textAlign: 'center',
    fontSize: h22,
  },
  barBtnText: {
    height: Math.round(Dimensions.get('window').height * 0.04),
    fontSize: h22,
    textAlign: 'center',
    color: Colors.black,
  },
  headerContainer: {
    backgroundColor: Colors.header.layout4.background,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    borderBottomWidth: 1,
    width: Math.round(Dimensions.get('window').width),
    borderBottomColor: Colors.darkBlue1,
    width: '100%',
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
    height: Math.round(Dimensions.get('window').height * 0.04),
    marginTop: h8,
  },
  saveButtonContainer: {
    borderRadius: 6,
    borderWidth:1,
    borderColor: 'darkgreen'

  },  
  hidden: {
    fontSize: height11,
    textAlign: 'center',
    color: Colors.header.layout4.background,
  },
});

export default Layout4;
