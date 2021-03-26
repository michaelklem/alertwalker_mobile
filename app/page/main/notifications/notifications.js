import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';

import { AppText, Colors, Images, Styles } from '../../../constant';
import ApiRequest from '../../../helper/ApiRequest';
import Layout1 from './layout-1';
import { ImageButton } from '../../../component/imageButton';
import { Toast } from '../../../component/toast';
import { NotificationManager } from '../../../manager';

import {formatAMPM, formatDateOnly} from '../../../helper/datetime';
import {extractValueFromPointer} from '../../../helper/coreModel';

export default class Notifications extends Component
{
  _notificationMgr = null;

  // MARK: - Constructor
  constructor(props)
  {
    console.log('Notifications()');
    super(props);

    this._notificationMgr = NotificationManager.GetInstance();

    this.state =
    {
      isLoading: false,
      notifications: this._notificationMgr.getNotifications()
    };

    console.log(this.state.notifications);
  }

  async componentDidMount()
  {
    console.log('Conversations.componentDidMount()');
    this._isMounted = true;

    // Listen for new notifications
    NotificationManager.GetInstance().addObserver(this, 'notifications');
  }

  componentWillUnmount()
  {
    NotificationManager.GetInstance().removeObserver('notifications');
  }

  // Called from notification manager when notifications change
  dataReloaded = () =>
  {
    this.setState({ notifications: this._notificationMgr.getNotifications() });
  }

  // MARK: - Notification manager observer related
  /**
    Notification manager will notify us of new messages
    @param  {Notification}  notification The created notification assocaited with the data coming through
    @param  {Message} message The message associated with the notification
  */
  newNotification = ({ notification, message }) =>
  {
    console.log('Notifications.newNotification()');
    console.log(notification);
    console.log(message);

    console.log(this.state.chat);
    // If chat already open check if it's for this conversation
    if(this.state.chat.conversation &&
      this.state.chat.conversation._id.toString() === message.conversation._id.toString())
    {
      this._chatRef.current.onNewMessage(message);
    }
    // Otherwise show toast
    else
    {
      this.showToast(notification, message);
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
        const chat = {...this.state.chat};
        chat.isOpen = true;
        chat.conversation = message.conversation;
        this.setState({ chat: chat });
      },
      onLeadingIconPress: () =>
      {
        const chat = {...this.state.chat};
        chat.isOpen = true;
        chat.conversation = message.conversation;
        this.setState({ chat: chat });
      },
      onTrailingIconPress: () =>
      {
        const chat = {...this.state.chat};
        chat.isOpen = true;
        chat.conversation = message.conversation;
        this.setState({ chat: chat });
      }
    });
  }


  // MARK: - Render
  shouldComponentUpdate(nextProps, nextState)
  {
    return true;
  }

  renderNotification = (item, index) =>
  {
    console.log(item);
    let titleText = item.title + ' - ' + item.body;
    return (
        <TouchableOpacity
          key={`groups-post-touch-${index}`}
          onPress={()=>
          {
            this._notificationMgr.readNotification(item);
          }}
        >
          <View style={[styles.conversationContainer, Styles.paper, { borderColor: Colors.red }, {borderWidth: item.status === 'unread' ? 1 : 0}]}>
            <View style={styles.conversationContent}>
              <Text align='left' style={styles.username}>
                {titleText}
              </Text>
              <Text align='left' style={styles.username}>
                {`${formatDateOnly(new Date(item.createdOn))} ${formatAMPM(new Date(item.createdOn))}`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
  }

  render()
  {
    console.log('\tNotifications.render()');
    return (
      <Layout1
        isLoading={this.state.isLoading}
        user={this.props.user}
        updateMasterState={(state) => this.setState(state)}
        showAlert={this.props.showAlert}
        notifications={this.state.notifications}
        renderNotification={this.renderNotification}
      />
    );
  }
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  container: {
    backgroundColor: Colors.separatorGray,
    flex: 1,
  },
  inner: {
    justifyContent: 'flex-end',
    flex: 1,
    marginTop: 10,
  },
  conversationContainer: {
   marginBottom: 10,
   marginLeft: 10,
   marginRight: 10,
   width: Math.round(Dimensions.get('window').width) - 20,
   height: 'auto',
   flex: 1,
 },
});