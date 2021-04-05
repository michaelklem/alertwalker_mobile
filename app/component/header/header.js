import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';

import Layout4 from './layout-4';
import { Images } from '../../constant';
import { HeaderManager } from '../../manager';

export default class Header extends Component
{
  _headerMgr = null;

  constructor(props)
  {
    super(props);
    console.log('\tHeader()');

    this._headerMgr = HeaderManager.GetInstance();
    this._headerMgr.setHeader(this);

    this.state =
    {
      leftBtnShowing: true,
      rightBtnShowing: true,
    };
  }

  setSideShowing = (side) =>
  {
    if(side === 'left')
    {
      this.setState({ leftBtnShowing: true });
    }
    else
    {
      this.setState({ rightBtnShowing: true });
    }
  }

  setSideHiding = (side) =>
  {
    if(side === 'left')
    {
      this.setState({ leftBtnShowing: false });
    }
    else
    {
      this.setState({ rightBtnShowing: false });
    }
  }

  isShowing = (side) =>
  {
    if(side === 'right')
    {
      return this.state.rightBtnShowing;
    }
    else
    {
      return this.state.leftBtnShowing;
    }
  }


  logout = async() =>
  {
    await this.props.updateGlobalState('deepLink', '');
    this.props.updateGlobalState('user', null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    this.props.updateStack('auth');
  }

  render()
  {
    console.log('\tHeader.render()');
    return (
      <Layout4
        user={this.props.user}
        route={this.props.route}
        navigation={this.props.navigation}
        updateGlobalState={this.props.updateGlobalState}
        updateStack={this.props.updateStack}
        showAlert={this.props.showAlert}
        updateMasterState={async (state) => { return this.setState(state) }}
        leftBtnShowing={this.state.leftBtnShowing}
        rightBtnShowing={this.state.rightBtnShowing}
        logout={this.logout}
      />
    );
  }
};
