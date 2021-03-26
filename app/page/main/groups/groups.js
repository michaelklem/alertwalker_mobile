import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

import Colors from '../../../constant/Colors';
import Styles from '../../../constant/Styles';
import AppText from '../../../constant/Text';
import AppManager from '../../../manager/appManager';
import ApiRequest from '../../../helper/ApiRequest';

import {extractValueFromPointer} from '../../../helper/coreModel';

export default class Groups extends Component
{
  _manager = null;

  // MARK: - Constructor
  constructor(props)
  {
    console.log('\tGroups()');
    super(props);

    // Get components on page
    this._manager = AppManager.GetInstance();
    const components = this._manager.getComponentsForPage('groups');

    this.state =
    {
      isLoading: false,
      components: components,
    };

    // Refresh classes
    props.navigation.addListener('didFocus', payload =>
    {
      if(payload.action.routeName === 'groups')
      {
        console.log("\tGroups.didFocus()");
        //this.loadData();
      }
      else if(payload.action.type === 'Navigation/COMPLETE_TRANSITION')
      {
        console.log("\tGroups.didFocus()");
        //this.loadData();
      }
    });
  }

  async componentDidMount()
  {

  }

  /**
    Allow another class to update our components state
    @param  {Int}  idx  Index of component to update
    @param  {String}  prop  The property to update in the component
    @param  {Any}     value   The value to update to
  */
  updateComponent = (idx, prop, value) =>
  {
    let components = [...this.state.components];
    components[idx][prop] = value;
    this.setState({ components: components });
  }


  // MARK: - Render
  shouldComponentUpdate(nextProps, nextState)
  {
    return (
      this.state.isLoading !== nextState.isLoading
    );
  }

  render()
  {
    console.log(this.state);
    console.log('\tGroups.render()');
    return (
      <View style={styles.container}>
        <View style={Styles.activityIndicator}>
          <ActivityIndicator size="large"
            color={Colors.burnoutGreen}
            animating={this.state.isLoading}
          />
        </View>
        {this.state.components &&
          this._manager.displayComponents(this.state.components,
                                          this.updateComponent,
                                          '',
                                          null,
                                          (state) => this.setState(state),
                                          this.props.showAlert,
                                          this.props.user,
                                          this.props.navigation,
                                          this.props.deepLink)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.separatorGray,
    justifyContent: 'flex-start',
  },
});
