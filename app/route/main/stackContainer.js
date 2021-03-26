import React from 'react';
import { Image, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import { ImageButton } from '../../component/imageButton';
import { HomePage } from '../../page/main/home';

import { Colors, Styles } from '../../constant';

// Container for home screen using tabs for navigation
const Stack = createStackNavigator();
function StackContainer()
{
  return (
    <Stack.Navigator
      initialRouteName='home'
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen
        name='home'
        component={HomePage}
      />
    </Stack.Navigator>
  );
}

export default StackContainer;
