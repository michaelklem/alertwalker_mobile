import React, { Component } from 'react';
import {  Dimensions,
          PermissionsAndroid,
          Platform,
          SafeAreaView,
          StyleSheet,
          Text,
          TouchableOpacity,
          Linking,
          Image,
          View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Swipeout from 'react-native-swipeout';
import Icon from "react-native-vector-icons/MaterialIcons";
import Contacts from "react-native-contacts";

import { Toast } from '../../../component/toast';
import { AudioCall } from '../../../component/call';
import { ImageButton } from '../../../component/imageButton';
import { AppManager, HeaderManager, NotificationManager, PushManager } from '../../../manager';
import Layout1 from './layout-1';
import { Colors, Images, Styles } from '../../../constant';
import ApiRequest from '../../../helper/ApiRequest';
import { formatDateOnly, formatAMPM } from '../../../helper/datetime';

export default class Phone extends Component
{
  _layout = 1;
  _isMounted = false;
  _manager = null;
  _findUserForMessageInterval = null;
  _chatRef = null;

  constructor(props)
  {
    console.log('Phone()');
    super(props);
    let state =
    {
      dynamicLoad: false,
      isLoading: false,
      isRefreshing: false,
      contacts: [],
      filteredContacts: [],
      chat:
      {
        isOpen: false,
        users: [],
        messageText: '',
      },
      activeMode: 'chats',
      searchText: '',
      conversations: [],
      calls: [],
    };

    this._chatRef = React.createRef();

    this._manager = AppManager.GetInstance();
    this.state = state;

    // On focus check if we should be creating
    props.navigation.addListener('focus', () =>
    {
      console.log("Phone.focus()");
      console.log(this.props);

      // If message passed in
      if(this.props.route.params &&
        this.props.route.params.message)
      {
        if(this.state.contacts.length > 0)
        {
          this.findUserForMessage(this.props.route.params.message);
        }
        else
        {
          this._findUserForMessageInterval = setInterval(this.findUserForMessage, 250, this.props.route.params.message);
        }
      }
    });

    HeaderManager.GetInstance().addListener('phone', this.onHeaderBtnPressed);
  }

  async componentDidMount()
  {
    this._isMounted = true;
    this.loadData();

    // TODO: Only do this if we don't have permission yet
    PushManager.RequestPermissions();

    // Listen for new notifications
    NotificationManager.GetInstance().addObserver(this);
  }

  componentWillUnmount()
  {
    HeaderManager.GetInstance().removeListener('phone');
  }

  /*onGoBack = () =>
  {
    console.log("Refreshing onGoBack");
    if(this._isMounted !== true)
    {
      this._isMounted = true;
    }
    else
    {
      this.loadData();
    }
  }*/


  // MARK: - API
  loadData = async (isRefreshing = false) =>
  {
    console.log('Phone.loadData()');

    if(Platform.OS === 'android')
    {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: "Contacts",
        message: "This app would like to view your contacts."
      });
    }
    else if(Platform.OS === 'ios')
    {
      const hasPermission = await Contacts.checkPermission();
      console.log(hasPermission);
    }

    const contacts = await Contacts.getAll();
    console.log(contacts);


    this.setState({ [isRefreshing ? 'isLoading' : 'isRefreshing']: true });
    try
    {
      let params =
      {
        contacts: contacts
      };

      let response = await ApiRequest.sendRequest("post", params, 'chat/sync-contacts');
      console.log(response.data);

      // Success
      if(response.data.error !== null)
      {
        this.setState({ [isRefreshing ? 'isLoading' : 'isRefreshing']: false });
        this.props.showAlert('Error', response.data.error);
        return;
      }
      this.setState({
        [isRefreshing ? 'isLoading' : 'isRefreshing']: false,
        contacts: response.data.results,
        conversations: response.data.conversations,
        calls: response.data.calls
      });
    }
    catch(err)
    {
      console.log(err);
      this.setState({ [isRefreshing ? 'isLoading' : 'isRefreshing']: false });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  }


  // MARK: - Notification manager observer related
  /**
    Notification manager will notify us of new messages
    @param  {Notification}  notification The created notification assocaited with the data coming through
    @param  {Message} message The message associated with the notification
  */
  newNotification = ({ notification, message }) =>
  {
    console.log('Phone.newNotification()');
    console.log(notification);
    console.log(message);

    console.log(this.state.chat);

    // No chats open
    if(this.state.chat.users.length === 0)
    {
      // Display toast notification
      this.showToast(notification, message);
    }
    // Chat already open and it's for this message
    else if(this.state.chat.users[0]._id.toString() === message.createdBy._id.toString())
    {
      this._chatRef.current.onNewMessage(message);
    }
  }

  showToast = (notification, message) =>
  {
    Toast.show({
      type: 'info',
      position: 'top',
      text1: notification.title,
      text2: NotificationManager.GetInstance().parseNotificationBody(notification),
      visibilityTime: 5000,
      onPress: () =>
      {
        if(this.state.contacts.length > 0)
        {
          this.findUserForMessage(message);
        }
        else
        {
          this._findUserForMessageInterval = setInterval(this.findUserForMessage, 250, message);
        }
      },
      onLeadingIconPress: () =>
      {
        if(this.state.contacts.length > 0)
        {
          this.findUserForMessage(message);
        }
        else
        {
          this._findUserForMessageInterval = setInterval(this.findUserForMessage, 250, message);
        }
      },
      onTrailingIconPress: () =>
      {
        if(this.state.contacts.length > 0)
        {
          this.findUserForMessage(message);
        }
        else
        {
          this._findUserForMessageInterval = setInterval(this.findUserForMessage, 250, message);
        }
      }
    });
  }

  // MARK: - Helpers
  updateSearchText = (searchText) =>
  {
    const filteredContacts = this.state.contacts.filter(contact => (contact.firstName.toLowerCase() + ' ' + contact.lastName.toLowerCase()).indexOf(searchText.toLowerCase()) !== -1);
    this.setState({ filteredContacts: filteredContacts, searchText: searchText });
  }

  findUserForMessage = (message) =>
  {
    if(this.state.contacts.length > 0)
    {
      if(this._findUserForMessageInterval)
      {
        clearInterval(this._findUserForMessageInterval);
      }

      const chat = {...this.state.chat};

      // Find user who created it in list
      for(let i = 0; i < this.state.contacts.length; i++)
      {
        if(this.state.contacts[i].existingUser &&
          this.state.contacts[i].existingUser._id.toString() === message.createdBy._id.toString())
        {
          chat.isOpen = true;
          chat.users = [this.state.contacts[i].existingUser];
          break;
        }
      }

      // TODO: Fix this
      let found = false;
      for(let i = 0; i < this.state.chat.users.length; i++)
      {
        if(this.state.chat.users[i]._id.toString() === chat.users[0]._id.toString())
        {
          found = true;
          break;
        }
      }

      console.log(found);
      // Chat not open yet, open it
      if(!found)
      {
        this.setState({ chat: chat });
        this.props.navigation.setParams({ message: null });
      }
      // Chat already open, append message
      else
      {
        console.log('Notify chat component');
      }
    }
  }

  renderConversation = (conversation, index) =>
  {
    let contact = null;
    let createdBy = conversation.item.createdBy;
    if(!this.props.user)
    {
      return;
    }
    console.log(createdBy);
    if(createdBy._id.toString() === this.props.user._id.toString())
    {
      let found = false;
      for(let i = 0; i < conversation.item.users.length; i++)
      {
        if(conversation.item.users[i]._id.toString() !== createdBy._id.toString())
        {
          createdBy = conversation.item.users[i];
          found = true;
          break;
        }
      }
    }

    let name = createdBy.firstName ? createdBy.firstName : '';
    if(!name)
    {
      name = createdBy.username;
    }
    else
    {
      name += (' ' + createdBy.lastName);
    }

    let number = '';
    for(let i = 0; i < this.state.contacts.length; i++)
    {
      if(this.state.contacts[i].existingUser)
      {
        console.log(this.state.contacts[i].existingUser);
        if(this.state.contacts[i].existingUser._id.toString() === createdBy._id.toString())
        {
          number = this.state.contacts[i].existingUser.phone;
          contact = this.state.contacts[i];
          break;
        }
      }
    }

    console.log(conversation);
    return (
      <View
        key={`conversation-container-view-${index}`}
        style={[styles.conversation, {backgroundColor: Colors.lightBlue1}]}
      >
        <View style={styles.conversationContainer}>
          <Image
            key={`conversation-container-img-${index}`}
            source={createdBy.photo ? {uri: createdBy.photo, cache: 'force-cache'} : Images.noPhoto}
            style={styles.userPhotoOutline}
          />
          <Text
            key={`conversation-container-company-${index}`}
            style={styles.conversationName}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            ellipsizeMode={'tail'}
          >{`${name}`}</Text>
          <Text
            key={`conversation-container-number-${index}`}
            style={styles.conversationNumber}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >{`${number}`}</Text>
          <Text
            key={`conversation-container-date-${index}`}
            style={styles.conversationDate}
            numberOfLines={3}
            adjustsFontSizeToFit={true}
          >{`${formatDateOnly(conversation.item.createdOn)} ${formatAMPM(conversation.item.createdOn)}`}</Text>
          <View style={styles.conversationLine} />

          <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
            <ImageButton
              key={`conversation-container-chat-icon-${index}`}
              imgSrc={Images.phoneChatIcon}
              imageStyle={[styles.conversationPhoneIcon, {  tintColor: Colors.lightBlue1 }]}
              titleStyle={styles.conversationPhoneIconOutline}
              onPress={() =>
              {
                const chat = {...this.state.chat};
                chat.isOpen = true;
                chat.users = [createdBy];
                this.setState({ chat: chat });
              }}
            />
            <ImageButton
              key={`conversation-container-phone-icon-${index}`}
              imgSrc={Images.phoneCallIcon}
              imageStyle={[styles.conversationPhoneIcon, {  tintColor: Colors.lightBlue1 }]}
              titleStyle={styles.conversationPhoneIconOutline}
              onPress={async() =>
              {
                if(!contact)
                {
                  //this.props.showAlert('Uh-oh', 'Does this user exist in your contacts? We are having trouble locating them');
                  const call =
                  {
                    status: 'outgoingAudioCall',
                    user: createdBy
                  };
                  console.log(call);
                  await AudioCall.CreateCall(call);
                  return;
                }
                const call =
                {
                  status: 'outgoingAudioCall',
                  contact: contact
                };
                console.log(call);
                await AudioCall.CreateCall(call);
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  renderCall = (conversation, index) =>
  {
    try
    {
      console.log(conversation);
      let contact = null;
      let createdBy = conversation.item.createdBy;
      if(createdBy._id.toString() === this.props.user._id.toString())
      {
        let found = false;
        for(let i = 0; i < conversation.item.users.length; i++)
        {
          if(conversation.item.users[i]._id.toString() !== createdBy._id.toString())
          {
            createdBy = conversation.item.users[i];
            found = true;
            break;
          }
        }
      }

      let name = createdBy.firstName ? createdBy.firstName : '';
      if(!name)
      {
        name = createdBy.username;
      }
      else
      {
        name += (' ' + createdBy.lastName);
      }

      let number = '';
      for(let i = 0; i < this.state.contacts.length; i++)
      {
        if(this.state.contacts[i].existingUser)
        {
          console.log(this.state.contacts[i].existingUser);
          if(this.state.contacts[i].existingUser._id.toString() === createdBy._id.toString())
          {
            number = this.state.contacts[i].existingUser.phone;
            contact = this.state.contacts[i];
            break;
          }
        }
      }

      console.log(conversation);
      return (
        <View
          key={`conversation-container-view-${index}`}
          style={[styles.conversation, {backgroundColor: Colors.orange1}]}
        >
          <View style={styles.conversationContainer}>
            <ImageButton
              key={`conversation-container-img-${index}`}
              imgSrc={createdBy.photo ? {uri: createdBy.photo, cache: 'force-cache'} : Images.noPhoto}
              imageStyle={styles.userPhotoOutline}
            />
            <Text
              key={`conversation-container-company-${index}`}
              style={styles.conversationName}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              ellipsizeMode={'tail'}
            >{`${name}`}</Text>
            <Text
              key={`conversation-container-number-${index}`}
              style={styles.conversationNumber}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >{`${number}`}</Text>
            <Text
              key={`conversation-container-date-${index}`}
              style={styles.conversationDate}
              numberOfLines={3}
              adjustsFontSizeToFit={true}
            >{`${formatDateOnly(conversation.item.createdOn)} ${formatAMPM(conversation.item.createdOn)}`}</Text>
            <View style={styles.conversationLine} />

            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
              <ImageButton
                key={`conversation-container-chat-icon-${index}`}
                imgSrc={Images.phoneChatIcon}
                imageStyle={[styles.conversationPhoneIcon, {  tintColor: Colors.orange1 }]}
                titleStyle={styles.conversationPhoneIconOutline}
                onPress={() =>
                {
                  const chat = {...this.state.chat};
                  chat.isOpen = true;
                  chat.users = [createdBy];
                  this.setState({ chat: chat });
                }}
              />
              <ImageButton
                key={`conversation-container-phone-icon-${index}`}
                imgSrc={Images.phoneCallIcon}
                imageStyle={[styles.conversationPhoneIcon, {  tintColor: Colors.orange1 }]}
                titleStyle={styles.conversationPhoneIconOutline}
                onPress={async() =>
                {
                  if(!contact)
                  {
                    //this.props.showAlert('Uh-oh', 'Does this user exist in your contacts? We are having trouble locating them');
                    const call =
                    {
                      status: 'outgoingAudioCall',
                      user: createdBy
                    };
                    console.log(call);
                    await AudioCall.CreateCall(call);
                    return;
                  }
                  const call =
                  {
                    status: 'outgoingAudioCall',
                    contact: contact
                  };
                  console.log(call);
                  await AudioCall.CreateCall(call);
                }}
              />
            </View>
          </View>
        </View>
      );
    }
    catch(err)
    {
      console.log(err.stack);
    }
  }

  renderContact = (contact, index) =>
  {
    try
    {
      let isHeader = (contact.index === 0);
      if(this.state.searchText === '' && contact.index !== 0)
      {
        try
        {
          if(this.state.contacts[contact.index - 1].firstName.charAt(0).toLowerCase() !== contact.item.firstName.charAt(0).toLowerCase())
          {
            isHeader = true;
          }
        }
        catch(err)
        {
          if(this.state.contacts[contact.index - 1].firstName.charAt(0) !== contact.item.firstName.charAt(0))
          {
            isHeader = true;
          }
        }
      }
      else if(contact.index !== 0)
      {
        if(this.state.filteredContacts[contact.index - 1].firstName.charAt(0) !== contact.item.firstName.charAt(0))
        {
          isHeader = true;
        }
      }

      return (
      <>
        {isHeader &&
        <View style={styles.letterHeader}>
          <Text
            key={`phone-container-header-text-${index}`}
            style={styles.letterHeaderText}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >{`${contact.item.firstName.charAt(0).toUpperCase()}`}</Text>
        </View>}
        <TouchableOpacity
          key={`phone-container-view-${index}`}
          style={styles.contact}
          onPress={async() =>
          {
            if(contact.item.existingUser)
            {
              // Open conversation
              if(this.state.activeMode === 'chats')
              {
                const chat = {...this.state.chat};
                chat.isOpen = true;
                chat.users = [contact.item.existingUser];
                this.setState({ chat: chat });
              }
              // Call user
              else
              {
                const call =
                {
                  status: 'outgoingAudioCall',
                  contact: contact.item
                };
                console.log(call);
                await AudioCall.CreateCall(call);
              }
            }
            else
            {
              if(contact.item.phoneNumbers.length > 0)
              {
                await Linking.openURL('sms:&addresses=' + contact.item.phoneNumbers[0] + '&body=' + this._manager.getInviteText());
              }
            }
          }}
        >
          <View style={styles.contactContainer}>
            <ImageButton
              key={`phone-container-icon-${index}`}
              imgSrc={this.state.activeMode === 'chats' ? Images.phoneChatIcon : Images.phoneCallIcon}
              imageStyle={styles.icon}
            />
            <ImageButton
              key={`phone-container-img-${index}`}
              imgSrc={contact.item.photo ? {uri: contact.item.photo, cache: 'force-cache'} : Images.noPhoto}
              imageStyle={styles.userPhoto}
            />
            <View style={{flexDirection: 'column'}, {justifyContent: 'center', width: '46%'}}>
              <Text
                key={`phone-container-text-${index}`}
                style={styles.name}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >{`${contact.item.firstName} ${contact.item.lastName}`}</Text>
              <Text
                key={`phone-container-company-${index}`}
                style={styles.subText}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >{`${contact.item.company}`}</Text>
              <Text
                key={`phone-container-location-${index}`}
                style={styles.subText}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >{`${contact.item.url} ${contact.item.city}`}</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <ImageButton
                key={`phone-container-inv-${index}`}
                imgSrc={contact.item.existingUser ? Images.aspireIcon : Images.inviteIcon}
                imageStyle={contact.item.existingUser ? styles.aspireIcon : styles.inviteIcon}
                onPress={async() =>
                {
                  if(contact.item.existingUser)
                  {
                    // Open conversation
                    if(this.state.activeMode === 'chats')
                    {
                      const chat = {...this.state.chat};
                      chat.isOpen = true;
                      chat.users = [contact.item.existingUser];
                      this.setState({ chat: chat });
                    }
                    // Call user
                    else
                    {
                      const call =
                      {
                        status: 'outgoingAudioCall',
                        contact: contact.item
                      };
                      console.log(call);
                      await AudioCall.CreateCall(call);
                    }
                  }
                  else
                  {
                    if(contact.item.phoneNumbers.length > 0)
                    {
                      await Linking.openURL('sms:&addresses=' + contact.item.phoneNumbers[0] + '&body=' + this._manager.getInviteText());
                    }
                  }
                }}
              />
            </View>
          </View>
        </TouchableOpacity>
      </>
      );
    }
    catch(err)
    {
      console.log(err.stack);
    }
  }

  shouldComponentUpdate(nextProps, nextState)
  {
    return true;
  }

  componentDidUpdate(prevProps, prevState)
  {
  }

  render()
  {
    try
    {
      console.log('Phone.render()');

      return (
      <>
        {this._layout === 1 &&
          <Layout1
            isLoading={this.state.isLoading}
            user={this.props.user}
            updateMasterState={(state) => this.setState(state)}
            showAlert={this.props.showAlert}
            isRefreshing={this.state.isRefreshing}
            refresh={() => this.loadData(true)}
            renderContact={this.renderContact}
            contacts={this.state.searchText === '' ? this.state.contacts : this.state.filteredContacts}
            chat={this.state.chat}
            activeMode={this.state.activeMode}
            searchText={this.state.searchText}
            updateSearchText={this.updateSearchText}
            deepLink={this.props.deepLink}
            chatRef={this._chatRef}
            conversations={this.state.conversations}
            calls={this.state.calls}
            renderConversation={this.renderConversation}
            renderCall={this.renderCall}
          />}
        </>
      );
    }
    catch(err)
    {
      console.log(err);
    }
  }
}

const sixteen = Math.round(Dimensions.get('window').width * 0.04);
const twelvePercentWidth = Math.round(Dimensions.get('window').width * 0.09);
const tenWidth = Math.round(Dimensions.get('window').width * 0.027);
const twentyFive = Math.round(Dimensions.get('window').width * 0.069);

const height1 = Math.round(Dimensions.get('window').height * 0.00128);
const height8 = Math.round(Dimensions.get('window').height * 0.01025);
const height11 = Math.round(Dimensions.get('window').height * 0.0141);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height20 = Math.round(Dimensions.get('window').height * 0.0256);
const height5 = Math.round(Dimensions.get('window').height * 0.006);
const height25 = Math.round(Dimensions.get('window').height * 0.03205);

const width20 = Math.round(Dimensions.get('window').width * 0.05333);

const styles = StyleSheet.create({
  contact: {
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.1),
    borderBottomWidth: height1,
    borderBottomColor: Colors.darkBlue1,
    paddingHorizontal: width20,
    paddingVertical: Math.round(Dimensions.get('window').height * 0.0128),
    flexDirection: 'row'
  },
  conversation: {
    width: Math.round(Dimensions.get('window').width * 0.27),
    height: Math.round(Dimensions.get('window').height * 0.157),
    borderRadius: 25,
    padding: tenWidth,
    flexDirection: 'row',
    marginLeft: tenWidth,
  },
  conversationContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'flex-start',
  },
  letterHeader: {
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.0512),
    backgroundColor: Colors.lightBlue1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  contactContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    width: '100%',
    marginTop: height20,
    alignItems: 'center'
  },
  icon: {
    height: Math.round(Dimensions.get('window').height * 0.0217),
    width: Math.round(Dimensions.get('window').width * 0.047),
    resizeMode: 'contain',
    justifyContent: 'center',
  },
  conversationPhoneIcon: {
    height: tenWidth,
    width: tenWidth,
    resizeMode: 'contain',
    justifyContent: 'center',
  },
  conversationPhoneIconOutline: {
    width: height25,
    height: height25,
    borderRadius: height25 / 2,
    resizeMode: 'contain',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginTop: height5,
    marginBottom: height5,
  },
  userPhoto: {
    width: twelvePercentWidth,
    height: twelvePercentWidth,
    marginHorizontal: sixteen,
    borderRadius: twelvePercentWidth / 2,
    resizeMode: 'contain',
    backgroundColor: Colors.black,
  },
  userPhotoOutline: {
    width: height25,
    height: height25,
    borderRadius: height25 / 2,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: Colors.white,
  },
  aspireIcon: {
    width: Math.round(Dimensions.get('window').width * 0.066),
    height: Math.round(Dimensions.get('window').height * 0.043),
    marginHorizontal: sixteen,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  inviteIcon: {
    width: Math.round(Dimensions.get('window').width * 0.1416),
    height: Math.round(Dimensions.get('window').height * 0.023),
    marginHorizontal: sixteen,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  name: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height18,
    textAlign: 'left',
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.035),
    color: Colors.budget.background,
  },
  conversationName: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Bold'
      },
      android: {
        fontFamily: 'Roboto-Bold'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height11,
    textAlign: 'left',
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.012),
    color: Colors.white,
    marginVertical: height5 / 2,
  },
  conversationNumber: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Bold'
      },
      android: {
        fontFamily: 'Roboto-Bold'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height18 / 2,
    textAlign: 'left',
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.012),
    color: Colors.white,
    marginVertical: height5 / 2,
  },
  conversationLine: {
    height: 1,
    backgroundColor: Colors.white,
    opacity: 0.3,
    width: '100%',
  },
  conversationDate: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Regular'
      },
      android: {
        fontFamily: 'Roboto-Regular'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height8,
    textAlign: 'left',
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.012),
    color: Colors.white,
    marginVertical: height5 / 2,
  },
  subText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Regular'
      },
      android: {
        fontFamily: 'Roboto-Regular'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height20 / 2,
    textAlign: 'left',
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.0205),
    color: Colors.budget.background,
  },
  letterHeaderText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height18,
    textAlign: 'left',
    marginLeft: Math.round(Dimensions.get('window').width * 0.055),
    color: Colors.white,
  },
});
