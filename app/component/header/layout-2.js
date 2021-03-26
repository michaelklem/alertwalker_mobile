import React from 'react';
import { Dimensions, Image, Platform, Text, TouchableOpacity, StyleSheet, View } from 'react-native';

import Icon from "react-native-vector-icons/MaterialIcons";

import { ImageButton } from '../imageButton';
import {AppText, Colors, Images, Styles} from '../../constant';

const Layout2 = ({ user, route, navigation, moreDetailVisible, updateGlobalState, updateStack, showAlert }) =>
{
  let routeName = route.state?.routes[route.state.index].name ?? 'main';

  // Find route in nested navigator
  let subRoute = route.state?.routes[route.state.index];
  while(subRoute && subRoute.state)
  {
    subRoute = subRoute.state.routes[subRoute.state.index];
  }

  let titleText = '';
  console.log(routeName);
  if(routeName === 'homeContainer')
  {
    routeName = 'main';

    if(subRoute.name === 'groups')
    {
      titleText = AppText.cHeaderTextVillageL2;
    }
    else /*if(subRoute.name === 'home')*/
    {
      titleText = AppText.cHeaderTextParentFeedL2;
    }
  }
  else if(routeName === 'main')
  {
    titleText = AppText.cHeaderTextParentFeedL2;
  }

  // Default styling for main route
  let leftBtnNavigation = () =>
  {
    if(user)
    {
      navigation.navigate('settings');
    }
    else
    {
      updateStack('auth');
    }
  };

  let rightBtnNavigation = () =>
  {
    if(user)
    {
      navigation.navigate('conversations');
    }
    else
    {
      updateStack('auth');
    }
  }

  // Settings route
  let btn = 'settings';
  if(routeName === 'settings')
  {
    titleText = AppText.cHeaderSettingsText;
    leftBtnNavigation = () =>
    {
      navigation.goBack();
    };
    btn = 'arrow-back';
  }
  else if(routeName === 'chat')
  {
    titleText = AppText.cHeaderChatText;
    leftBtnNavigation = () =>
    {
      navigation.goBack();
    };
    btn = 'arrow-back';
  }
  else if(routeName === 'conversations')
  {
    titleText = AppText.cHeaderConversationsText;
    rightBtnNavigation = () =>
    {

    };
    leftBtnNavigation = () =>
    {
      navigation.goBack();
    };
    btn = 'arrow-back';
  }

  return (
    <View style={[styles.header]}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.settingsBtn} onPress={leftBtnNavigation}>
          <Icon
            name={btn}
            size={26}
            color={Colors.black}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <Image
          source={Images.logo}
          style={styles.headerLogo}
        />
        <Text style={styles.headerText}>{titleText}</Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.inboxBtn} onPress={rightBtnNavigation}>
          <Icon
            name={'forum'}
            size={26}
            color={Colors.black}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: Math.round(Dimensions.get('window').width),
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'right',
    justifyContent:'space-between',
    borderBottomWidth: 0,
  },
  headerText: {
    color: Colors.black,
    fontSize: 26,
    textAlignVertical: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    })
  },
  headerLogo: {
    width: Math.round(Dimensions.get('window').width * 0.11),
    height: Math.round(Dimensions.get('window').height * 0.0279),
    resizeMode: 'contain'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  settingsBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 10,
  },
  inboxBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 10,
  },
});

export default Layout2;
