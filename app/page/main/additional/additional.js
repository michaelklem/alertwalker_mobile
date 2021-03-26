import React, { Component } from 'react';
import { View } from 'react-native';
import { LayoverMenu } from '../../../component/layoverMenu';
import { Budget } from './budget';
import { Fitness } from './fitness';
import { Grocery } from './grocery';
import { Meal } from './meal';
import { SubscriptionPayModal } from '../../../component/pay';
import { AppText, Colors, Images, Styles } from '../../../constant';
import { HeaderManager, IapManager } from '../../../manager';

export default class Additional extends Component
{
  _iapMgr = null;
  _headerMgr = null;
  _activePageRef = null;

  constructor(props)
  {
    super(props);

    // Setup IAP manager so we can get notifications when receipt is updated
    this._iapMgr = IapManager.GetInstance();
    const receipt = this._iapMgr.getReceipt();
    this._iapMgr.addListener('additional', (rcpt) =>
    {
      const isUpgraded = (rcpt !== null && rcpt.status === 'active');
      console.log(rcpt);
      if(isUpgraded)
      {
        this.setState({ isUpgraded: isUpgraded, subscriptionPayModalIsOpen: false });
      }
      else
      {
        this.setState({ isUpgraded: isUpgraded });
      }
    });

    this.state =
    {
      menu:
      {
        isOpen: true,
        selectedIndex: -1,
        options:
        [
          { title: 'Budget', id: 'budget' },
          { title: 'Meal', id: 'meal' },
          { title: 'Grocery List', id: 'grocery' },
          { title: 'Fitness Log', id: 'fitness' }
        ]
      },
      isUpgraded: (receipt !== null && receipt.status === 'active'),
      subscriptionPayModalIsOpen: (receipt === null || receipt.status !== 'active'),
      iapSubscription: null,
    };

    this._activePageRef = React.createRef();

    this._headerMgr = HeaderManager.GetInstance();

    // On focus check if we should be creating
    props.navigation.addListener('focus', () =>
    {
      console.log("Additional.focus()");
      if(this.state.menu.selectedIndex !== -1)
      {
        this._headerMgr.setActiveAdditionalPage(this.state.menu.options[this.state.menu.selectedIndex].id);
      }
      this.openMenu();
    });

    props.navigation.addListener('tabPress', (e) =>
    {

    });
  }

  async componentDidMount()
  {
    console.log('Additional.componentDidMount()');
    let subscriptions = await this._iapMgr.getSubscriptions();
    if(subscriptions.length > 0)
    {
      console.log(subscriptions);
      this.setState({ iapSubscription: subscriptions[0] });
    }
  }

  openMenu = () =>
  {
    if(!this.state.isUpgraded && !this.state.subscriptionPayModalIsOpen)
    {
      this.setState({ subscriptionPayModalIsOpen: true });
    }
    else if(!this.state.menu.isOpen && this.state.isUpgraded)
    {
      let tempMenu = {...this.state.menu};
      tempMenu.isOpen = true;
      this.setState({ menu: tempMenu });
    }
  }

  /*openPayMenu = () =>
  {
    if(!this.state.isUpgraded && !this.state.subscriptionPayModalIsOpen)
    {
      this.setState({ subscriptionPayModalIsOpen: true });
    }
  }*/

  render()
  {
    return (
      <View style={[{width: '100%', height:'100%'}, {backgroundColor: Colors.darkBlue2}]}>
        {!this.state.isUpgraded &&
        <SubscriptionPayModal
          isOpen={this.state.subscriptionPayModalIsOpen}
          close={() =>
          {
            this.setState({ subscriptionPayModalIsOpen: false });
            this.props.navigation.goBack();
          }}
          iapSubscription={this.state.iapSubscription}
        />}
        {this.state.menu.isOpen &&
        this.state.isUpgraded &&
        <LayoverMenu
          title={AppText.additionalPage.layout1.layoverMenuTitle}
          options={this.state.menu.options}
          selectedIndex={this.state.menu.selectedIndex}
          onSelect={async(selected) =>
          {
            let tempMenu = {...this.state.menu};
            tempMenu.selectedIndex = selected;
            tempMenu.isOpen = false;
            if(this._activePageRef.current)
            {
              await this._activePageRef.current.saveData();
            }
            this.setState({ menu: tempMenu }, () =>
            {
              this._headerMgr.setActiveAdditionalPage(tempMenu.options[selected].id);
            });
          }}
          onClose={() =>
          {
            let tempMenu = {...this.state.menu};
            tempMenu.isOpen = false;
            this.setState({ menu: tempMenu });
            this.props.navigation.goBack();
          }}
        />}
        {this.state.menu.selectedIndex === 0 &&
          this.state.isUpgraded &&
        <Budget
          ref={this._activePageRef}
          showAlert={this.props.showAlert}
          user={this.props.user}
          navigation={this.props.navigation}
        />}
        {this.state.menu.selectedIndex === 1 &&
          this.state.isUpgraded &&
        <Meal
          ref={this._activePageRef}
          showAlert={this.props.showAlert}
          user={this.props.user}
          navigation={this.props.navigation}
        />}
        {this.state.menu.selectedIndex === 2 &&
          this.state.isUpgraded &&
        <Grocery
          ref={this._activePageRef}
          showAlert={this.props.showAlert}
          user={this.props.user}
          navigation={this.props.navigation}
        />}
        {this.state.menu.selectedIndex === 3 &&
          this.state.isUpgraded &&
        <Fitness
          ref={this._activePageRef}
          showAlert={this.props.showAlert}
          user={this.props.user}
          navigation={this.props.navigation}
        />}
      </View>);
  }
};
