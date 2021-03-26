import React, { Component } from 'react';
import AsyncStorage from '@react-native-community/async-storage';

import Layout1 from './layout-1';
import Layout2 from './layout-2';
import Layout3 from './layout-3';
import Layout4 from './layout-4';

import { Images } from '../../constant';
import { HeaderManager, OauthManager } from '../../manager';

export default class Header extends Component
{
  _layout = 4;
  _oauthMgr = null;
  _headerMgr = null;

  constructor(props)
  {
    super(props);
    console.log('\tHeader()');
    this._oauthMgr = OauthManager.GetInstance();
    const tokens = this._oauthMgr.getOauthTokens();

    this._headerMgr = HeaderManager.GetInstance();
    this._headerMgr.setHeader(this);

    this.state =
    {
      menu:
      {
        isOpen: false,
        selectedIndex: -1,
        options:
        [
          {
            title: 'Note',
            route: 'notes',
            image: Images.menuNotes,
            style: 'menuNotes'
          },
          {
            title: 'Calendar',
            route: 'calendar',
            image: Images.menuCalendar,
            style: 'menuCalendar'
          },
          {
            title: tokens && tokens.facebookToken ? 'Unlink Facebook' : 'Link Facebook',
            route: 'settings',
            image: Images.menuFacebook,
            style: 'menuFacebook',
            onClick: async() =>
            {
              const iTokens = this._oauthMgr.getOauthTokens();
              //console.log(iTokens);
              if(iTokens.facebookToken && iTokens.facebookToken !== null)
              {
                //console.log("Logging out");
                const result = await OauthManager.GetInstance().removeToken({ source: 'facebook' });
                if(result)
                {
                  const menu = {...this.state.menu};
                  menu.options[2].title = 'Link Facebook';
                  this.setState({ menu: menu });
                }
              }
              else
              {
                //console.log("Logging in");
                const result = await OauthManager.GetInstance().facebookLogin();
                if(result)
                {
                  const menu = {...this.state.menu};
                  menu.options[2].title = 'Unlink Facebook';
                  this.setState({ menu: menu });
                }
              }
            }
          },
          {
            title: tokens && tokens.instagramToken ? 'Unlink Instagram' : 'Link Instagram',
            route: 'settings',
            image: Images.menuInstagram,
            style: 'menuInstagram',
            onClick: async() =>
            {
              const iTokens = this._oauthMgr.getOauthTokens();
              //console.log(iTokens);
              if(iTokens.instagramToken && iTokens.instagramToken !== null)
              {
                const result = await OauthManager.GetInstance().removeToken({ source: 'instagram' });
                if(result)
                {
                  const menu = {...this.state.menu};
                  menu.options[3].title = 'Link Instagram';
                  this.setState({ menu: menu });
                }
              }
              else
              {
                this.setState({ instagramModalVisible: true });
              }
            }
          },
          {
            title: 'Email',
            route: 'email',
            image: Images.menuEmail,
            style: 'menuEmail'
          },
          {
            title: 'Additional Features',
            route: 'additional',
            image: Images.menuAdditional,
            style: 'menuAdditional'
          }
        ]
      },
      instagramModalVisible: false,
      leftBtnShowing: true,
      rightBtnShowing: true,
      activeAdditionalPage: '',
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

  setActiveAdditionalPage = (page) =>
  {
    console.log('\tHeader.setActiveAdditionalPage(' + page + ')');
    this.setState({ activeAdditionalPage: page });
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
      <>
        {this._layout === 1 &&
          <Layout1
            user={this.props.user}
            route={this.props.route}
            navigation={this.props.navigation}
            moreDetailVisible={this.props.moreDetailVisible}
            updateGlobalState={this.props.updateGlobalState}
            updateStack={this.props.updateStack}
            showAlert={this.props.showAlert}
          />}
          {this._layout === 2 &&
            <Layout2
              user={this.props.user}
              route={this.props.route}
              navigation={this.props.navigation}
              moreDetailVisible={this.props.moreDetailVisible}
              updateGlobalState={this.props.updateGlobalState}
              updateStack={this.props.updateStack}
              showAlert={this.props.showAlert}
            />}
          {this._layout === 3 &&
            <Layout3
              user={this.props.user}
              route={this.props.route}
              navigation={this.props.navigation}
              moreDetailVisible={this.props.moreDetailVisible}
              updateGlobalState={this.props.updateGlobalState}
              updateStack={this.props.updateStack}
              showAlert={this.props.showAlert}
              headerBtnPressed={this.props.headerBtnPressed}
              menu={this.state.menu}
              instagramModalVisible={this.state.instagramModalVisible}
              updateMasterState={async (state) => { return this.setState(state) }}
              manager={this._headerMgr}
              leftBtnShowing={this.state.leftBtnShowing}
              rightBtnShowing={this.state.rightBtnShowing}
              activeAdditionalPage={this.state.activeAdditionalPage}
            />}
          {this._layout === 4 &&
            <Layout4
              user={this.props.user}
              route={this.props.route}
              navigation={this.props.navigation}
              moreDetailVisible={this.props.moreDetailVisible}
              updateGlobalState={this.props.updateGlobalState}
              updateStack={this.props.updateStack}
              showAlert={this.props.showAlert}
              headerBtnPressed={this.props.headerBtnPressed}
              menu={this.state.menu}
              instagramModalVisible={this.state.instagramModalVisible}
              updateMasterState={async (state) => { return this.setState(state) }}
              manager={this._headerMgr}
              leftBtnShowing={this.state.leftBtnShowing}
              rightBtnShowing={this.state.rightBtnShowing}
              activeAdditionalPage={this.state.activeAdditionalPage}
              logout={this.logout}
            />}
      </>
    );
  }
};
