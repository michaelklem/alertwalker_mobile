import React, { Component } from 'react';
import { Linking, View } from 'react-native';
import { LayoverMenu } from '../../../component/layoverMenu';
import { AppText, Colors, Images, Styles } from '../../../constant';

export default class Email extends Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      menu:
      {
        isOpen: true,
        selectedIndex: -1,
        options:
        [
          {
            title: 'Google',
            onClick: async() =>
            {
              this.openEmailApp('googlegmail://?path=co');
            }
          },
          {
            title: 'Outlook',
            onClick: async() =>
            {
              this.openEmailApp('ms-outlook://?path=compose');
            }
          },
          {
            title: 'Apple',
            onClick: async() =>
            {
              this.openEmailApp('message://');
            }
          }
        ]
      },
    };

    // On focus check if we should be creating
    props.navigation.addListener('focus', () =>
    {
      console.log("Email.focus()");
      console.log(this.props);
      if(this.props.route.params && this.props.route.params.create)
      {
        this.openMenu();
      }
    });

    props.navigation.addListener('tabPress', (e) =>
    {
      // Prevent default behavior
      //e.preventDefault();
      this.openMenu();
    });
  }

  openMenu = () =>
  {
    let tempMenu = {...this.state.menu};
    tempMenu.isOpen = true;
    this.setState({ menu: tempMenu });
  }

  openEmailApp = async(prefix) =>
  {
    console.log(prefix);
    const isSupported = await Linking.canOpenURL(prefix);
    if(isSupported)
    {
      await Linking.openURL(`${prefix}`);
    }
    else
    {
      this.props.showAlert('Uh-oh', 'It looks like you do not have this mail app installed on your device. Download it from the App Store and try again');
    }
  }

  render()
  {
    return (
      <View style={[{width: '100%', height:'100%'}, {backgroundColor: Colors.darkBlue2}]}>
        {this.state.menu.isOpen &&
        <LayoverMenu
          title={AppText.emailPage.layoverMenuTitle.text}
          options={this.state.menu.options}
          showTopLeftIcon={false}
          selectedIndex={this.state.menu.selectedIndex}
          onSelect={(selected) =>
          {
            let tempMenu = {...this.state.menu};
            tempMenu.selectedIndex = selected;
            tempMenu.isOpen = false;
            this.setState({ menu: tempMenu });

            if(tempMenu.selectedIndex !== -1)
            {
              if(tempMenu.options[selected].onClick)
              {
                tempMenu.options[selected].onClick();
                this.props.navigation.goBack();
              }
            }
          }}
          onClose={() =>
          {
            let tempMenu = {...this.state.menu};
            tempMenu.isOpen = false;
            this.setState({ menu: tempMenu });
            this.props.navigation.goBack();
          }}
        />}
      </View>);
  }
};
