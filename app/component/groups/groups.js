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

import {AppText, Colors, Styles} from '../../constant';
import Group from './group';
import { MessageTextField } from '.';
import ApiRequest from '../../helper/ApiRequest';
import { CommentHelper } from '../../component-helper';
import { SearchBar } from '../searchBar';
import { Message } from '../message';
import { FormInput } from '../formInput';

export default class Groups extends Component
{
  _isMounted = false;
  _commentHelper = null;
  _focusedPostRef = null;

  constructor(props)
  {
    console.log("\tGroups()");
    console.log(props.deepLink);
    super(props);

    let focusedItem = props.focusedItem;

    // Being invoked from deep link open
    if(props.deepLink && props.data)
    {
      const deepLinkedId  = props.deepLink.substr(props.deepLink.indexOf('/') + 1);
      const modelType     = props.deepLink.substr(0, props.deepLink.indexOf('/'));

      if(modelType === 'group')
      {
        // Find focused item
        for(let i = 0; i < props.data.length; i++)
        {
          if(props.data[i]._id.toString() === deepLinkedId)
          {
            focusedItem = props.data[i];
          }
        }
      }
    }

    this.state =
    {
      creatingGroup: false,
      data: props.data,
      focusedItem: focusedItem ? focusedItem : null,
      groupNameToCreate: '',
      onlyGroupsUserIsIn: true,
      messageText: '',
      searchText: '',
    };

    if (Platform.OS === 'android')
    {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    this._commentHelper = CommentHelper.GetInstance();
    this._focusedRef = React.createRef()
  }

  async componentDidMount()
  {
    console.log('\tGroups.componentDidMount()');
    this._isMounted = true;

    await this.loadData();
  }

  // MARK: - API related
  loadData = async() =>
  {
    if(this.props.dynamicData)
    {
      // Fetch data
      this.props.updateMasterState({ isLoading: true });
      const response = await ApiRequest.sendRequest('post', {onlyGroupsUserIsIn: this.state.onlyGroupsUserIsIn}, 'component/groups');

      if(response.data.error !== null)
      {
        this.props.updateMasterState({ isLoading: false });
        this.props.showAlert('Un-oh', response.data.error);
        return;
      }

      // Being invoked from deep link
      // need to find item to focus after loading them
      let focusedItem = this.props.focusedItem;
      if(this.props.deepLink && response.data.results)
      {
        const deepLinkedId = this.props.deepLink.substr(this.props.deepLink.indexOf('/') + 1);
        const modelType    = this.props.deepLink.substr(0, this.props.deepLink.indexOf('/'));

        if(modelType === 'group')
        {
          // Find focused item
          for(let i = 0; i < response.data.results.length; i++)
          {
            if(response.data.results[i]._id.toString() === deepLinkedId)
            {
              focusedItem = response.data.results[i];
            }
          }
        }
      }

      if(focusedItem)
      {
        this.props.navigation.setOptions({ tabBarVisible: false });
      }

      console.log(response.data.results);
      // Update parent
      this.setState({ data: response.data.results, focusedItem: focusedItem });
      this.props.updateMasterState({ isLoading: false });
    }
  }

  /**
    Comment on a document
    @param  {JSON}  params  The params to put into formdata
    @param  {Int} index   The index to append to
    @params {Array.<String>}  reverseOrderParents The parents to reverse
    @param  {Int} depth The depth of the comment
  */
  comment = async(params,
                  index,
                  reverseOrderParents,
                  depth) =>
  {
    // Fetch data
    this.props.updateMasterState({ isLoading: true });
    const idx = this.state.data.findIndex(detail => detail._id.toString() === params.entityId.toString());

    const formData = new FormData();
    formData.append('model', 'comment');
    formData.append('message', params.message);
    formData.append('entityType', params.entityType);
    formData.append('entityId', params.entityId);
    formData.append('parent', params.parent);
    formData.append('likedBy', params.likedBy);
    formData.append('dislikedBy', params.dislikedBy);

    const response = await ApiRequest.sendRequest('post',
                                                  formData,
                                                  'data/create',
                                                  'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');

    if(response.data.error !== null)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    // Update post comments
    const data = [...this.state.data];
    data[idx].comments.push(response.data.results);

    /*let focusedItem = null;
    if(this.state.focusedItem)
    {
      focusedItem = {...this.state.focusedItem};
      focusedItem.comments.push(response.data.results);
    }*/

    this.setState({ data: data, messageText: ''/*, focusedItem: focusedItem*/ });

    // Update parent loading
    this.props.updateMasterState({ isLoading: false });
    return response.data.results;
  }

  loadConversation = async(conversation) =>
  {
    try
		{
			console.log('\tGroups.loadConversation()');
			this.props.updateMasterState({ isLoading: true });
      const params =
      {
        model: 'message',
        params:
        {
          conversation: conversation._id.toString()
        }
      };
			const response = await ApiRequest.sendRequest('post',
                                                    params,
                                                    'data/query');
			if(response.data.error !== null)
			{
				this.props.updateMasterState({ isLoading: false });
				this.props.showAlert(true, 'Un-oh', response.data.error);
				return;
			}

      this.props.updateMasterState({ isLoading: false });

			this.setState({ messages: response.data.results });
		}
		catch(err)
		{
			this.setState({ isLoading: false });
			this.props.showAlert('Un-oh', 'An error has occurred, please try again or contact support.\nError: ' + err);
		}
  }

  /**
    Send a message
  */
  sendMessage = async() =>
  {
    this.props.updateMasterState({ isLoading: true });

    console.log(this.state.focusedItem);

    const params = new FormData();
    params.append('conversation', this.state.focusedItem.conversation._id.toString());
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
    messages.push(response.data.results);
    this.setState(
    {
      messages: messages,
      messageText: '',
    });
    this.props.updateMasterState({ isLoading: false });
  }

  joinGroup = async() =>
  {
    this.props.updateMasterState({ isLoading: true });

    const response = await ApiRequest.sendRequest('post',
                                                  {group: this.state.focusedItem._id.toString()},
                                                  'chat/join');
    console.log(response.data);
    if(response.data.error !== null)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    let groups = [...this.state.data];
    for(let i = 0; i < groups.length; i++)
    {
      if(groups[i]._id.toString() === response.data.results._id.toString())
      {
        groups[i] = response.data.results;
      }
    }


    this.setState({ focusedItem: response.data.results, data: groups });
    this.props.updateMasterState({ isLoading: false });
  }

  createGroup = async() =>
  {
    this.props.updateMasterState({ isLoading: true });

    const response = await ApiRequest.sendRequest('post',
                                                  {name: this.state.groupNameToCreate},
                                                  'chat/group');
    console.log(response.data);
    if(response.data.error !== null)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    this.props.updateMasterState({ isLoading: false });
    this.setState({ creatingGroup: false, groupNameToCreate: '' }, () => this.loadData());
  }

  // MARK: - Render
  shouldComponentUpdate(nextProps, nextState)
	{
    return (
      this.state.focusedItem !== nextState.focusedItem ||
      this.state.messageText !== nextState.messageText ||
      this.state.data !== nextState.data ||
      this.state.searchText !== nextState.searchText ||
      this.state.messages !== nextState.messages ||
      this.state.onlyGroupsUserIsIn !== nextState.onlyGroupsUserIsIn ||
      this.state.creatingGroup !== nextState.creatingGroup ||
      this.state.groupNameToCreate !== nextState.groupNameToCreate
    );
	}

  renderGroup = (item, index) =>
  {
    const isFocused = this.state.focusedItem ? item._id.toString() === this.state.focusedItem._id.toString() : false;
    return (
        <TouchableOpacity
          key={`groups-post-touch-${index}`}
          onPress={()=>
          {
            this.props.navigation.setOptions({ tabBarVisible: false });
            this.loadConversation(item.conversation);
            this.setState({ focusedItem: {...item} });
          }}
        >
          <Group
            key={`groups-post-${index}`}
            navigation={this.props.navigation}
            component={this.props.component}
            group={item}
            updateComment={(commentId, messageText) => this.update({ post: { id: item._id }, model: 'comment', comment: { id: commentId, message: messageText } })}
            deleteComment={(commentId) => this.delete({ post: { id: item._id }, model: 'comment', comment: { id: commentId } })}
            comment={this.comment}
            user={this.props.user}
            updateMasterState={(state) => this.setState(state)}
            isFocused={isFocused}
            ref={isFocused ? this._focusedPostRef : null}
          />
        </TouchableOpacity>
      );
  }

  renderMessage = (item, index) =>
  {
    return (
      <Message
        key={index}
        message={item}
        self={this.props.user._id.toString() === item.createdBy._id.toString()}
      />);
  }

  render()
  {
    console.log('\tGroups.render()');

    let isInGroup = false;

    let data = this.state.data;
    if(this.state.focusedItem)
    {
      data = this.state.focusedItem;
      for(let i = 0; i < data.members.length; i++)
      {
        if(data.members[i]._id.toString() === this.props.user._id.toString())
        {
          isInGroup = true;
        }
      }
    }
    else if(this.state.searchText)
    {
      data = data.filter(record => record.name.toLowerCase().indexOf(this.state.searchText.toLowerCase()) !== -1);
    }

    //console.log(this.props.component);
    return (
      <KeyboardAvoidingView style={styles.container}>

        {this.state.creatingGroup &&
        <View style={[styles.nameContainer, Styles.paperNoPadding]}>
          <FormInput
            id={'groupNameToCreate'}
            updateMasterState={(id, value) => this.setState({ [id]: value })}
            value={this.state.groupNameToCreate}
            label={''/*this.props.value ? '' : this.props.placeholder*/}
            placeholder={'Enter new group name'}
            style={styles.textInput}
          />
          <TouchableOpacity
            onPress={() =>
            {
              this.createGroup();
            }}
            style={styles.commentImg}
          >
            <Icon
              name={'add-circle'}
              size={Math.round(Dimensions.get('window').height * 0.04)}
              color={Colors.black}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
            {
              this.setState({ creatingGroup: false });
            }}
            style={styles.commentImg}
          >
            <Icon
              name={'arrow-back'}
              size={Math.round(Dimensions.get('window').height * 0.04)}
              color={Colors.black}
            />
          </TouchableOpacity>
        </View>}

        <KeyboardAwareScrollView contentContainerStyle={styles.inner}>
          {this.props.component.search.isEnabled &&
          !this.state.focusedItem &&
          !this.state.creatingGroup &&
          <>
            <View style={[Styles.rowOfContent, styles.searchRow]}>
              <Animated.View style={{width: '100%'}} key={`search-animation`}>
                 <SearchBar
                   id='searchText'
                   layout={1}
                   placeholder={AppText.homeSearchPlaceholderText}
                   updateMasterState={(id, value) =>
                   {
                     this.setState({ [id]: value });
                   }}
                   value={this.state.searchText}
                />
              </Animated.View>
            </View>

            <View style={[Styles.rowOfContent, {marginTop: 5}, {flex: 0.08}, {justifyContent: 'space-between'}, {marginLeft: 10}, {marginRight: 10}]}>
              <View style={[Styles.row, {justifyContent: 'flex-start'}]}>
                <Text style={styles.filterText}>{AppText.groups.filterLabel}</Text>
                <Switch
                  trackColor={{ false: "#767577", true: Colors.blue1 }}
                  thumbColor={this.state.onlyGroupsUserIsIn ? "#f5dd4b" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() =>
                  {
                    this.setState({ onlyGroupsUserIsIn: !this.state.onlyGroupsUserIsIn }, () => this.loadData());
                  }}
                  value={this.state.onlyGroupsUserIsIn}
                />
              </View>
              <TouchableOpacity
                onPress={() =>
                {
                  this.setState({ creatingGroup: true });
                }}
                style={styles.commentImg}
              >
                <Text style={styles.newGroupText}>{AppText.groups.newGroup}</Text>
              </TouchableOpacity>
            </View>

            <View style={[Styles.rowOfContent, {marginBottom: 5}, {flex: 0.08}, {justifyContent: 'flex-start'}, {marginLeft: 10}]}>
              <Text style={styles.filterSubText}>{`(${this.state.onlyGroupsUserIsIn ? AppText.groups.onlyGroupsUserIsIn : AppText.groups.notOnlyGroupsUserIsIn})`}</Text>
            </View>

            <FlatList
              data={data}
              numColumns={1}
              scrollEnabled={true}
              renderItem={ ({item, index}) => this.renderGroup(item, index) }
              ItemSeparatorComponent={this.separator}
              nestedScrollEnabled={true}
              keyExtractor={item => (item._id ? item._id.toString() : '')}
            />
          </>}


          {this.state.focusedItem &&
          !this.state.creatingGroup &&
          <>
            <View style={[Styles.row, Styles.paper]}>
              <TouchableOpacity
                onPress={() =>
                {
                  this.props.navigation.setOptions({ tabBarVisible: true });
                  this.setState({ focusedItem: null });
                }}
                style={styles.commentImg}
              >
                <Icon
                  name={'arrow-back'}
                  size={Math.round(Dimensions.get('window').height * 0.04)}
                  color={Colors.black}
                />
              </TouchableOpacity>
              <Text style={styles.groupTitleText}>{`${this.state.focusedItem.name} (${this.state.focusedItem.members.length})`}</Text>
              {isInGroup && <View />}
              {!isInGroup &&
              <TouchableOpacity
                onPress={() =>
                {
                  this.joinGroup();
                }}
              >
                <Icon
                  name={'exposure-plus-1'}
                  size={Math.round(Dimensions.get('window').height * 0.04)}
                  color={Colors.descriptionGray}
                />
              </TouchableOpacity>}
            </View>


            {this.state.messages &&
            <FlatList
              data={this.state.messages}
              scrollEnabled={true}
              renderItem={ ({item, index}) => this.renderMessage(item, index) }
              nestedScrollEnabled={true}
              keyExtractor={item => (item._id ? item._id.toString() : '')}
            />}

            <View style={styles.bottom}>
              <MessageTextField
                animationStyle={this._commentHelper.getCommentFieldAnimationStyle()}
                messageText={this.state.messageText}
                updateMasterState={(val) => this.setState({ messageText: val })}
                sendMessage={this.sendMessage}
              />
            </View>
          </>}

        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  bottom: {
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.separatorGray,
    flex: 1,
  },
  groupTitleText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: 20
  },
  filterText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: 16
  },
  newGroupText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    color: Colors.linkBlue,
    fontSize: 16
  },
  filterSubText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: 12
  },
  inner: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  textInput: {
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: Colors.white,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.separatorGray,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
  },
  searchRow: {
    marginTop: 10,
    marginBottom: 5,
    flex: 0.08,
    minHeight: Math.round(Dimensions.get('window').height * 0.04)
  }
});
