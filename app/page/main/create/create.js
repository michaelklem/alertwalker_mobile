import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Colors from '../../../constant/Colors';
import Styles from '../../../constant/Styles';
import AppText from '../../../constant/Text';
import AppManager from '../../../manager/appManager';
import ApiRequest from '../../../helper/ApiRequest';
import {CreatePost} from '../../../component/feed';

import {extractValueFromPointer} from '../../../helper/coreModel';

export default class Groups extends Component
{
  _manager = null;

  // MARK: - Constructor
  constructor(props)
  {
    console.log('\tCreate()');
    super(props);

    // Get components on page
    this._manager = AppManager.GetInstance();

    this.state =
    {
      isLoading: false,
    };

    // Refresh classes
    props.navigation.addListener('didFocus', payload =>
    {
      if(payload.action.routeName === 'create')
      {
        console.log("\tCreate.didFocus()");
        //this.loadData();
      }
      else if(payload.action.type === 'Navigation/COMPLETE_TRANSITION')
      {
        console.log("\tCreate.didFocus()");
        //this.loadData();
      }
    });
  }

  async componentDidMount()
  {

  }

  updateMasterState = (state) =>
  {
    this.setState(state);
  }

  // MARK: - Render
  shouldComponentUpdate(nextProps, nextState)
  {
    return (
      this.state.isLoading !== nextState.isLoading ||
      this.props.route !== nextProps.route 
    );
  }

  render()
  {
    console.log(this.props);
    console.log('\tCreate.render()');
    return (
      <View style={styles.container}>
        <View style={Styles.activityIndicator}>
          <ActivityIndicator size="large"
            color={Colors.burnoutGreen}
            animating={this.state.isLoading}
          />
        </View>
        <CreatePost
          updateMasterState={(state) => this.setState(state)}
          showAlert={this.props.showAlert}
          navigation={this.props.navigation}
          route={this.props.route}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.separatorGray,
  },
});
