import React, { Component } from 'react';
import { Dimensions, Image, Text, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from "react-native-vector-icons/MaterialIcons";

import { ImageButton } from '../../component/imageButton';

import { CalendarPage } from '../../page/main/calendar';
import { EmailPage } from '../../page/main/email';
import { NotesPage } from '../../page/main/notes';
import { HomePage } from '../../page/main/home';
import { GroupsPage } from '../../page/main/groups';
import { SearchPage } from '../../page/main/search';
import { PhonePage } from '../../page/main/phone';
import AdditionalContainer from './additionalContainer';
import { AppText, Colors, Images, Styles } from '../../constant';


// Container for home screen using tabs for navigation
const Tab = createBottomTabNavigator();
export default class TabBarContainer extends Component
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
      <Tab.Navigator
        initialRouteName='home'
        screenOptions={({ navigation, route }) => (
        {
          headerShown: true,
          tabBarIcon: ({ focused,tintColor }) =>
          {
            if(route.name === 'home')
            {
              return <Icon name={'home'} size={28} color={focused ? Colors.white : Colors.lightBlue1} />
            }
            return <Image
                      style={[Styles.tabBarIcon, focused ? {tintColor: Colors.white} : {}]}
                      source={Images[route.name + 'Icon']}
                    />
          },
          tabBarLabel: ({ focused, tintColor }) =>
          {
            let name = route.name;
            if(route.name === 'additional')
            {
              name = 'Addtl Feat';
            }
            return <Text
                      adjustsFontSizeToFit={true}
                      style={focused ? Styles.activeTabBarBtn : Styles.inactiveTabBarBtn}
                    >{name.charAt(0).toUpperCase() + name.slice(1)}</Text>
          }
        })}
        tabBarOptions={{
          style: {backgroundColor: Colors.header.background, flexDirection: 'column', height: Math.round(Dimensions.get('window').height * 0.08)},
          activeBackgroundColor: Colors.lightBlue1,
          labelPosition: 'below-icon',
        }}
      >
        <Tab.Screen
          name='home'
        >
          {(props) => <HomePage {...props}
                        ref={this.props.activeScreenRef}
                        deepLink={this.props.deepLink}
                        showAlert={this.props.showAlert}
                        user={this.props.user}
                      />}
        </Tab.Screen>

        <Tab.Screen
          name='phone'
        >
          {(props) => <PhonePage {...props}
                        ref={this.props.activeScreenRef}
                        deepLink={this.props.deepLink}
                        showAlert={this.props.showAlert}
                        user={this.props.user}
                      />}
        </Tab.Screen>

        <Tab.Screen
          name='email'
        >
          {(props) => <EmailPage {...props}
                        ref={this.props.activeScreenRef}
                        deepLink={this.props.deepLink}
                        showAlert={this.props.showAlert}
                        user={this.props.user}
                      />}
        </Tab.Screen>

        <Tab.Screen
          name='calendar'
        >
          {(props) => <CalendarPage {...props}
                        ref={this.props.activeScreenRef}
                        deepLink={this.props.deepLink}
                        showAlert={this.props.showAlert}
                        user={this.props.user}
                      />}
        </Tab.Screen>

        <Tab.Screen
          name='notes'
        >
          {(props) => <NotesPage {...props}
                        ref={this.props.activeScreenRef}
                        deepLink={this.props.deepLink}
                        showAlert={this.props.showAlert}
                        user={this.props.user}
                      />}
        </Tab.Screen>

        <Tab.Screen
          name='search'
        >
          {(props) => <SearchPage {...props}
                        ref={this.props.activeScreenRef}
                        deepLink={this.props.deepLink}
                        showAlert={this.props.showAlert}
                        user={this.props.user}
                      />}
        </Tab.Screen>

        <Tab.Screen
          name='additional'
        >
          {(props) => <AdditionalContainer {...props}
                        ref={this.props.activeScreenRef}
                        initialRouteName={'additional'}
                        deepLink={this.props.deepLink}
                        showAlert={this.props.showAlert}
                        user={this.props.user}
                      />}
        </Tab.Screen>

      </Tab.Navigator>
    );
  }
}
