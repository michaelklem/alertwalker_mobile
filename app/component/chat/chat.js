import React, {Component} from 'react';
import {  Animated,
          Dimensions,
          FlatList,
          KeyboardAvoidingView,
          LayoutAnimation,
          Platform,
          StyleSheet,
          Switch,
          Text,
          TouchableOpacity,
          UIManager,
          View,
} from "react-native";

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from "react-native-vector-icons/MaterialIcons";

import {AppText, Colors, Images, Styles} from '../../constant';
import { MessageTextField } from '.';
import ApiRequest from '../../helper/ApiRequest';
import { CommentHelper } from '../../component-helper';
import { ImageButton } from '../../component/imageButton';
import { Message } from '../message';

export default class Chat extends Component
{
  _isMounted = false;
  _commentHelper = null;

  constructor(props)
  {
    console.log("\tChat()");
    console.log(props.deepLink);
    super(props);

    let conversation = props.conversation;

    // Being invoked from deep link open
    if(props.deepLink && props.users)
    {
      const deepLinkedId  = props.deepLink.substr(props.deepLink.indexOf('/') + 1);
      const modelType     = props.deepLink.substr(0, props.deepLink.indexOf('/'));

      if(modelType === 'conversation')
      {
        // Find focused item
        for(let i = 0; i < props.data.length; i++)
        {
          if(props.data[i]._id.toString() === deepLinkedId)
          {
            conversation = props.data[i];
          }
        }
      }
    }

    this.state =
    {
      conversation: conversation ? conversation : null,
      messages: [],
      messageText: '',
    };

    if (Platform.OS === 'android')
    {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    this._commentHelper = CommentHelper.GetInstance();
  }

  async componentDidMount()
  {
    console.log('\tChat.componentDidMount()');
    this._isMounted = true;

    await this.loadData();
  }

  // MARK: - API related
  loadData = async() =>
  {
    // Fetch data
    this.props.updateMasterState({ isLoading: true });
    let params = {};
    if(this.props.component.users)
    {
      params = {users: this.props.component.users};
    }
    else
    {
      params = {conversation: this.props.component.conversation};
    }
    console.log(params);
    const response = await ApiRequest.sendRequest('post', params, 'chat/');

    console.log(response.data);
    if(response.data.error !== null)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    this.setState({ conversation: response.data.results, messages: response.data.messages });
    this.props.updateMasterState({ isLoading: false });
  }

  /**
    Send a message
  */
  sendMessage = async() =>
  {
    this.props.updateMasterState({ isLoading: true });


    const params = new FormData();
    if(this.state.conversation)
    {
      params.append('conversation', this.state.conversation._id.toString());
    }
    else
    {
      params.append('recipient', this.props.component.users[0]._id.toString());
      console.log(this.props.component.users[0]);
    }
    params.append('text', this.state.messageText);

    const response = await ApiRequest.sendRequest('post',
                                                  params,
                                                  'chat/message');
    console.log(response.data);
    if(response.data.error !== null)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    const messages = [...this.state.messages];
    messages.unshift(response.data.results);
    this.setState(
    {
      messages: messages,
      messageText: '',
    });
    this.props.updateMasterState({ isLoading: false });
  }

  onNewMessage = (message) =>
  {
    console.log('\tChat.onNewMessage');
    const messages = [...this.state.messages];

    // If websocket tells us we have a notification and push notification comes in too,
    // then don't double insert it
    let found = false;
    for(let i = 0; i < messages.length; i++)
    {
      if(messages[i]._id.toString() === message._id.toString())
      {
        found = true;
        break;
      }
    }

    if(!found)
    {
      messages.unshift(message);
      this.setState({ messages: messages });
    }
  }

  // MARK: - Render
  shouldComponentUpdate(nextProps, nextState)
	{
    return (
      this.state.conversation !== nextState.conversation ||
      this.state.messageText !== nextState.messageText ||
      this.state.messages !== nextState.messages
    );
	}

  renderMessage = (item, index) =>
  {
    console.log(item);
    return (
      <Message
        key={index}
        message={item}
        self={this.props.user._id.toString() === item.createdBy._id.toString()}
      />);
  }

  render()
  {
    console.log('\tChat.render()');

    let conversationText = 'Start a Conversation';
    if(this.state.conversation && this.state.conversation.users)
    {
      let found = false;
      let i = 0;
      while(!found && i < this.state.conversation.users.length)
      {
        if(this.state.conversation.users[i]._id.toString() !== this.props.user._id.toString())
        {
          found = true;
          conversationText = this.state.conversation.users[i].firstName + ' ' + this.state.conversation.users[i].lastName;
        }
        i++;
      }
    }
    else if(this.props.component.users)
    {
      conversationText = `Chat with ${this.props.component.users[0].firstName ? this.props.component.users[0].firstName : this.props.component.users[0].username}`;
    }
    return (
      <KeyboardAvoidingView style={styles.container}>
        <KeyboardAwareScrollView contentContainerStyle={styles.inner}>

          <View style={styles.alignLeft}>
            <View style={[Styles.row, styles.headerRow]}>
              <ImageButton
                imgSrc={Images.backArrow}
                imageStyle={styles.backBtn}
                onPress={() => this.props.updateMasterState({ isOpen: false })}
              />
              <Text style={styles.headerText}>{conversationText}</Text>
              <View style={styles.backBtn}/>
            </View>
          </View>

          <FlatList
            data={this.state.messages}
            scrollEnabled={true}
            renderItem={ ({item, index}) => this.renderMessage(item, index) }
            nestedScrollEnabled={true}
            keyExtractor={item => (item._id ? item._id.toString() : '')}
            inverted={true}
          />

          <View style={styles.bottom}>
            <MessageTextField
              animationStyle={this._commentHelper.getCommentFieldAnimationStyle()}
              messageText={this.state.messageText}
              updateMasterState={(val) => this.setState({ messageText: val })}
              sendMessage={this.sendMessage}
            />
          </View>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const height18 = Math.round(Dimensions.get('window').height * 0.02307);

const styles = StyleSheet.create({
  bottom: {
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.header.background,
    flex: 1,
  },
  backBtn: {
    width: Math.round(Dimensions.get('window').width * 0.05),
    height: Math.round(Dimensions.get('window').height * 0.02),
    resizeMode: 'contain',
  },
  alignLeft: {
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.0512),
    backgroundColor: Colors.lightBlue1,
    justifyContent: 'flex-start',
  },
  headerRow: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  headerText: {
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
    color: Colors.white,
    alignSelf: 'center',
    textAlign: 'left',
  },
  inner: {
    justifyContent: 'flex-end',
    flex: 1,
  },
});
