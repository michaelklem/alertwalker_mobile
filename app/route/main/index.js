import React from 'react';
import { Dimensions } from 'react-native';
import { AddPage } from '../../page/main/add';
import { MapPage } from '../../page/main/map';
import { Api } from '../../page/main/api';
import DrawerContainer from './drawerContainer';
import { Colors, Styles } from '../../constant/';
import { Header } from '../../component/header';
import LinearGradient from 'react-native-linear-gradient'
import { createStackNavigator } from '@react-navigation/stack';

// This is the stack we see if they are logged in
const Stack = createStackNavigator();
export function MainStack(props)
{
  const { deepLink,
          user,
          navigation,
          initialRouteName,
          route,
          showAlert,
          updateGlobalState,
          moreDetailVisible,
          updateStack,
          headerBtnPressed,
          activeScreenRef
        } = props;

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      headerMode='screen'
      screenOptions={{
        headerTitle: (props) => <Header
                                  navigation={navigation}
                                  headerBtnPressed={headerBtnPressed}
                                  user={user}
                                  route={route}
                                  updateGlobalState={updateGlobalState}
                                  moreDetailVisible={moreDetailVisible}
                                  updateStack={updateStack}
                                  showAlert={showAlert}
                                />,
        headerStyle:
        {
          /*height: Math.round(Dimensions.get('window').height * 0.15),
          shadowOffset: { height: 0 }*/
        },
        headerBackground: () => (
          <LinearGradient
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            colors={[Colors.white, Colors.white]}
            style={{ flex: 1 }}
          />
        )
      }}
    >
      <Stack.Screen
        name='homeContainer'
      >
        {(props) =>
        {
            return (<DrawerContainer
                      {...props}
                      deepLink={deepLink}
                      showAlert={showAlert}
                      user={user}
                      updateGlobalState={updateGlobalState}
                      updateStack={updateStack}
                      activeScreenRef={activeScreenRef}
                    />);
        }}
      </Stack.Screen>
      <Stack.Screen
        name="api"
        options={{
            headerStyle: { height: Math.round(Dimensions.get('window').height * 0.15), shadowOffset: { height: 0 }, backgroundColor: Colors.white }
        }}
      >
        {(props) => <Api {...props}
                      deepLink={deepLink}
                      showAlert={showAlert}
                      user={user}
                      updateGlobalState={updateGlobalState}
                      moreDetailVisible={moreDetailVisible}
                    />}
      </Stack.Screen>
      <Stack.Screen
        name="add"
        options={{
          headerLeft: ()=> null,
        }}
      >
        {(props) => <AddPage {...props}
                      ref={activeScreenRef}
                      showAlert={showAlert}
                      user={user}
                      updateGlobalState={updateGlobalState}
                      updateStack={updateStack}
                    />}
      </Stack.Screen>
      <Stack.Screen
        name="map"
        options={{
          headerLeft: () => (<></>)
        }}
      >
        {(props) => <MapPage {...props}
                      ref={activeScreenRef}
                      showAlert={showAlert}
                      user={user}
                      updateGlobalState={updateGlobalState}
                      updateStack={updateStack}
                    />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
