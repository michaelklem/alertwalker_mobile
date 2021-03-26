import React, { Component } from 'react';
import { Dimensions } from 'react-native';
import { AdditionalPage } from '../../page/main/additional';
import { Colors, Styles } from '../../constant/';
import { Header } from '../../component/header';
import LinearGradient from 'react-native-linear-gradient'
import { createStackNavigator } from '@react-navigation/stack';

// This is the stack we see if they are logged in
const Stack = createStackNavigator();
export default class AdditionalContainer extends Component
{
  _activeScreenRef = null;

  constructor(props)
  {
    super(props);
    this.state = {};

    this._activeScreenRef = React.createRef();
    props.navigation.addListener('tabPress', (e) =>
    {
      // Prevent default behavior
      //e.preventDefault();
      if(this._activeScreenRef.current)
      {
        this._activeScreenRef.current.openMenu();
      }
    });
  }

  render()
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
          } = this.props;

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
              colors={[Colors.darkBlue2, Colors.darkBlue2]}
              style={{ flex: 1 }}
            />
          ),
          headerShown: false
        }}
      >
        <Stack.Screen
          name="additional"
          options={{
              headerStyle: { height: Math.round(Dimensions.get('window').height * 0.15), shadowOffset: { height: 0 }, backgroundColor: Colors.cAccordionRowInactive }
          }}
        >
          {(props) => <AdditionalPage {...props}
                        ref={this._activeScreenRef}
                        deepLink={deepLink}
                        showAlert={showAlert}
                        user={user}
                        updateGlobalState={updateGlobalState}
                        moreDetailVisible={moreDetailVisible}
                      />}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }
}
