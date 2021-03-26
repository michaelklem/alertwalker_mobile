import React from 'react';
import { Dimensions } from 'react-native';
import { Settings } from '../../page/main/settings';
import { AddPage } from '../../page/main/add';
import { MapPage } from '../../page/main/map';
//import {Conversations} from '../../page/main/conversations';
//import {Chat} from '../../page/main/chat';
import TabBarContainer from './tabBarContainer';
//import { Detail, CreateDetail } from '../../page/main/home/detail';
import { Tos } from '../../page/main/tos';
import { Api } from '../../page/main/api';
import StackContainer from './stackContainer';
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
            // (DrawerContainer|TabBarContainer|StackContainer) would work too
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
            headerStyle: { height: Math.round(Dimensions.get('window').height * 0.15), shadowOffset: { height: 0 }, backgroundColor: Colors.cAccordionRowInactive }
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
        name="settings"
        options={{
          headerLeft: () => (<></>)
        }}
      >
        {(props) => <Settings {...props}
                      ref={activeScreenRef}
                      showAlert={showAlert}
                      user={user}
                      updateGlobalState={updateGlobalState}
                      updateStack={updateStack}
                    />}
      </Stack.Screen>
      <Stack.Screen
        name="add"
        options={{
          headerLeft: () => (<></>)
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
      <Stack.Screen
        name="tos"
        options={{
            headerShown: false
        }}
      >
        {(props) => <Tos {...props}
                      ref={activeScreenRef}
                      showAlert={showAlert}
                      user={user}
                      updateGlobalState={updateGlobalState}
                      updateStack={updateStack}
                      stack={'main'}
                    />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}


/*<Stack.Screen
  name="chat"
  options={{
    headerLeft: () => (<></>)
  }}
>
  {(props) => <Chat {...props}
                showAlert={showAlert}
                user={user}
                updateGlobalState={updateGlobalState}
                ref={activeScreenRef}
              />}
</Stack.Screen>
<Stack.Screen
  name="conversations"
  options={{
    headerLeft: () => (<></>)
  }}
>
  {(props) => <Conversations {...props}
                showAlert={showAlert}
                user={user}
                updateGlobalState={updateGlobalState}
                ref={activeScreenRef}
              />}
</Stack.Screen>
<Stack.Screen
  name="create"
  options={{
      headerStyle: { height: Math.round(Dimensions.get('window').height * 0.15), shadowOffset: { height: 0 }, backgroundColor: Colors.purple }
  }}
>
  {(props) => <CreateDetail {...props}
                ref={activeScreenRef}
                showAlert={showAlert}
                user={user}
                updateGlobalState={updateGlobalState}
              />}
</Stack.Screen>
<Stack.Screen
  name="detail"
  options={{
      headerStyle: { height: Math.round(Dimensions.get('window').height * 0.15), shadowOffset: { height: 0 }, backgroundColor: Colors.cAccordionRowInactive }
  }}
>
  {(props) => <Detail {...props}
                ref={activeScreenRef}
                showAlert={showAlert}
                user={user}
                updateGlobalState={updateGlobalState}
                moreDetailVisible={moreDetailVisible}
              />}
</Stack.Screen>*/
