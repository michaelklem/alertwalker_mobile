import { createStackNavigator } from '@react-navigation/stack';
import {AuthPage} from '../../page/auth';
import { Api } from '../../page/main/api';
import React from 'react';

const Stack = createStackNavigator();
export function AuthStack(props)
{
  const {deepLink, initialRouteName, updateStack, showAlert, updateGlobalState, user} = props;
  return (
    <Stack.Navigator
      initialRouteName='auth'
      screenOptions={{headerShown: false}}
    >
      <Stack.Screen name="auth">
        {(props) => <AuthPage {...props}
                      updateStack={updateStack}
                      user={user}
                      showAlert={showAlert}
                      updateGlobalState={updateGlobalState}
                      deepLink={deepLink}
                      initialRouteName={initialRouteName}
                    />}
      </Stack.Screen>
      <Stack.Screen
        name="api"
        options={{
              headerShown: false
        }}
      >
        {(props) => <Api {...props}
                      deepLink={deepLink}
                      showAlert={showAlert}
                      user={user}
                      updateGlobalState={updateGlobalState}
                    />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
