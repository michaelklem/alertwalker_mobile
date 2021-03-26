import React from 'react';
import { Dimensions, Image, Platform, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { ImageButton } from '../imageButton';
import {AppText, Colors, Images, Styles} from '../../constant';
import Icon from "react-native-vector-icons/MaterialIcons";

const Layout1 = ({ user, route, navigation, moreDetailVisible, updateGlobalState, updateStack, showAlert }) =>
{
  let routeName = route.state?.routes[route.state.index].name ?? 'main';
  if(routeName === 'homeContainer')
  {
    routeName = 'main';
  }

  // Default styling for main route
  let bgColor = {backgroundColor: Colors.orange};
  let titleText = AppText.cHeaderCreateNewText;
  let rightBtnNavigation = () =>
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
  let rightImg = (<>
    <Image
      source={(user && user.photo) ? {uri: user.photo} : Images.noPhoto}
      style={styles.profileImg}
    />
    <Text style={styles.name} adjustsFontSizeToFit={true} numberOfLines={1}>{user ? user.name : ''}</Text>
  </>);

  // MARK: - Custom
  // Settings route
  if(routeName === 'settings')
  {
    bgColor.backgroundColor = Colors.cAccordionRowInactive;
    titleText = AppText.cHeaderSettingsText;
    rightBtnNavigation = () =>
    {
      navigation.goBack();
    };
    rightImg = (<Icon
                name={'arrow-back'}
                size={40}
                color={Colors.white}
              />);
  }
  // Detail view
  else if(routeName === 'detail')
  {
    bgColor.backgroundColor = Colors.cAccordionRowInactive;
    if(!moreDetailVisible)
    {
      titleText = AppText.cHeaderDetailText;
      rightBtnNavigation = () =>
      {
        navigation.goBack();
      };
      rightImg = (<Icon
                  name={'arrow-back'}
                  size={40}
                  color={Colors.white}
                />);
    }
    else
    {
      titleText = "";
      rightBtnNavigation = () =>
      {
        updateGlobalState('moreDetailVisible', false);
      };
      rightImg = (<Icon
                  name={'close'}
                  size={40}
                  color={Colors.white}
                />);
    }
  }
  // Create view
  else if(routeName === 'create')
  {
    bgColor.backgroundColor = Colors.purple;
    titleText = AppText.cHeaderCreateText;
  }

  return (
    <View style={[styles.header, bgColor]}>
      <View style={styles.row}>
        <Image
          source={Images.logo}
          style={styles.headerLogo}
        />
        {
          routeName !== 'main' &&
          <Text style={[styles.headerText, {marginLeft: 10}]}>{titleText}</Text>
        }
      </View>
      {routeName === 'main' &&
        <View style={styles.row}>
          <Text style={styles.headerText}>{titleText}</Text>
          <TouchableOpacity onPress={() =>
          {
            if(user)
            {
              navigation.navigate('create');
            }
            else
            {
              showAlert(AppText.cHeaderLoginRequiredText, '');
            }
          }}>
            <View style={styles.createNewBtn}>
              <Text style={styles.addText}>+</Text>
            </View>
          </TouchableOpacity>
        </View>
      }
      {
        routeName === 'create' &&
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon
            name={'arrow-back'}
            size={40}
            color={Colors.white}
          />
        </TouchableOpacity>
      }
      <TouchableOpacity style={styles.profileSection} onPress={rightBtnNavigation}>
        {rightImg}
      </TouchableOpacity>
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
    color: Colors.white,
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
    marginLeft: 10,
    width: Math.round(Dimensions.get('window').width * 0.11),
    height: Math.round(Dimensions.get('window').height * 0.0279),
  },
  createNewBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 25,
    width: 25,
    height: 25,
    alignItems: 'center',
    marginLeft: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  addText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: 'bold',
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
  profileSection: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 10,
  },
  profileImg: {
    height: Math.round(Dimensions.get('window').height * 0.07),
    width: Math.round(Dimensions.get('window').width * 0.192),
    borderRadius: 10,
    resizeMode: 'cover',
  },
  name: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
    width: Math.round(Dimensions.get('window').width * 0.192),
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
  }
});

export default Layout1;
