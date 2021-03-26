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
import ApiRequest from '../../helper/ApiRequest';
import { ImageButton } from '../imageButton';

export default class Groups extends Component
{
  _isMounted = false;
  _commentHelper = null;

  constructor(props)
  {
    console.log("\tConversations()");
    console.log(props.deepLink);
    super(props);

    this.state =
    {
      data: props.data,
    };

    if (Platform.OS === 'android')
    {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  async componentDidMount()
  {
    console.log('\tConversations.componentDidMount()');
    this._isMounted = true;

    console.log(this.props);
    if(this.props.component.dynamicData)
    {
      await this.loadData();
    }
  }

  // MARK: - API related
  loadData = async() =>
  {
    // Fetch data
    this.props.updateMasterState({ isLoading: true });
    let params =
    {
      model: 'conversation',
      params:
      {
        users: this.props.user._id
      }
    }
    const response = await ApiRequest.sendRequest('post', params, 'data/query');
    console.log(params);
    console.log(response.data);

    if(response.data.error !== null)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    this.setState({ data: response.data.results });
    this.props.updateMasterState({ isLoading: false });
  }

  // MARK: - Render
  shouldComponentUpdate(nextProps, nextState)
	{
    return (
      this.state.data !== nextState.data
    );
	}

  renderConversation = (item, index) =>
  {
    let titleText = '';
    let user = null;
    let found = false;
    let i = 0;
    while(!found && i < item.users.length)
    {
      if(item.users[i]._id.toString() !== this.props.user._id.toString())
      {
        found = true;
        titleText = item.users[i].firstName + ' ' + item.users[i].lastName;
        user = item.users[i];
      }
      i++;
    }
    return (
        <TouchableOpacity
          key={`groups-post-touch-${index}`}
          onPress={()=> this.props.navigation.navigate('chat', { conversation: item._id }) }
        >
        <View style={[styles.conversationContainer, Styles.paper]}>
          <View style={styles.conversationContent}>
            <ImageButton
              imgSrc={user.photo ? {uri: user.photo} : Images.noPhoto}
              imageStyle={Styles.userPhotoImgSmall}
            />
            <Text align='left' style={styles.username}>
              {titleText}
            </Text>
          </View>
        </View>
        </TouchableOpacity>
      );
  }

  render()
  {
    console.log('\tConversations.render()');
    return (
      <KeyboardAvoidingView style={styles.container}>
        <KeyboardAwareScrollView contentContainerStyle={styles.inner}>
          <FlatList
            data={this.state.data}
            numColumns={1}
            scrollEnabled={true}
            renderItem={ ({item, index}) => this.renderConversation(item, index) }
            ItemSeparatorComponent={this.separator}
            nestedScrollEnabled={true}
            keyExtractor={item => (item._id ? item._id.toString() : '')}
          />
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({

  container: {
    backgroundColor: Colors.separatorGray,
    flex: 1,
  },
  inner: {
    justifyContent: 'flex-end',
    flex: 1,
    marginTop: 10,
  },
  username: {
    marginLeft: 10,
    textAlignVertical: 'center',
    alignSelf: 'center',
  },
  conversationContainer: {
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    width: Math.round(Dimensions.get('window').width) - 20,
    height: 'auto',
    flex: 1,
  },
  conversationContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});
