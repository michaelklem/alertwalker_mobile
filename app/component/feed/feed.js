import React, {Component} from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  View,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { MenuProvider } from 'react-native-popup-menu';

import {Colors, Styles} from '../../constant';
import Post from './post';
import { CommentTextField } from '../comment';
import ApiRequest from '../../helper/ApiRequest';
import { CommentHelper } from '../../component-helper';

export default class Feed extends Component
{
  _isMounted = false;
  _commentHelper = null;
  _focusedPostRef = null;

  constructor(props)
  {
    console.log("\tFeed()");
    console.log(props.deepLink);
    super(props);

    let focusedItem = props.focusedItem;

    // Being invoked from deep link open
    if(props.deepLink && props.data)
    {
      const deepLinkedId  = props.deepLink.substr(props.deepLink.indexOf('/') + 1);
      const modelType     = props.deepLink.substr(0, props.deepLink.indexOf('/'));

      if(modelType === 'post')
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
      data: props.data,
      focusedItem: focusedItem ? focusedItem : null,
      commentText: '',
      isRefreshing: false,
    };

    if (Platform.OS === 'android')
    {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    this._commentHelper = CommentHelper.GetInstance();
    this._focusedPostRef = React.createRef()
  }

  async componentDidMount()
  {
    console.log('\tFeed.componentDidMount()');
    this._isMounted = true;

    await this.loadData({ isRefreshing: true, forcedReload: false });
  }



  // MARK: - API related
  /**
    Load posts from backend
    @param  {Object}  params
      @param   {Bool}  isRefreshing Controls if the flat list is refreshing or not
      @param  {Bool}  forcedReload  Force the feed to reload regardless if item focused
  */
  loadData = async(params) =>
  {
    console.log('\tFeed.loadData()');
    console.log(params);
    if(this.props.dynamicData && (!this.state.focusedItem || params.forcedReload))
    {
      if(params.isRefreshing)
      {
        this.setState({ isRefreshing: true });
      }

      // Fetch data
      this.props.updateMasterState({ isLoading: true });
      const response = await ApiRequest.sendRequest('post', {}, 'component/posts');

      if(response.data.error !== null)
      {
        this.props.updateMasterState({ isLoading: false });
        this.props.showAlert('Un-oh', response.data.error);
        this.setState({ isRefreshing: false });
        return;
      }

      // Being invoked from deep link
      // need to find item to focus after loading them
      let focusedItem = null;
      if(this.props.deepLink && response.data.results)
      {
        const deepLinkedId = this.props.deepLink.substr(this.props.deepLink.indexOf('/') + 1);
        const modelType    = this.props.deepLink.substr(0, this.props.deepLink.indexOf('/'));

        if(modelType === 'post')
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

      // Update parent
      this.setState({ data: response.data.results, focusedItem: focusedItem });
      this.props.updateMasterState({ isLoading: false });

      this.setState({ isRefreshing: false });
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

    this.setState({ data: data, commentText: ''/*, focusedItem: focusedItem*/ });

    // Update parent loading
    this.props.updateMasterState({ isLoading: false });
    return response.data.results;
  }

  /**
    Delete a document for particular model
    @note Parameters come in an object named params
    @param {String}  params.model is the model type being created
    @param  {JSON}  params.post   {id: postId}
    @param  {JSON}    params.comment  {id: commentId, message: commentText} (Optional if updating post)
  */
  delete = async(params) =>
  {
    console.log(params);

    // Fetch data
    this.props.updateMasterState({ isLoading: true });

    //const postIdx = component.details.findIndex(detail => detail._id.toString() === params.post.id.toString());
    const data = [...this.state.data];
    const postIdx = data.findIndex(detail => detail._id.toString() === params.post.id.toString());

    const deleteParams =
    {
      model: params.model,
      id: (params.comment ? params.comment.id : params.post.id)
    };
    const response = await ApiRequest.sendRequest('post', deleteParams, 'data/delete');
    if(response.data.error !== null)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    let focusedItem = {...this.state.focusedItem};

    if(params.comment)
    {
      //const commentIdx = component.details[postIdx].comments.findIndex(comment => comment._id.toString() === params.comment.id.toString());
      //component.details[postIdx].comments.splice(commentIdx, 1);
      const commentIdx = data[postIdx].comments.findIndex(comment => comment._id.toString() === params.comment.id.toString());
      data[postIdx].comments.splice(commentIdx, 1);

      if(this.state.focusedItem)
      {
        let comments = [...focusedItem.comments];
        comments.splice(commentIdx, 1);
        focusedItem.comments = comments;
      }
    }
    else
    {
      component.details.splice(postIdx, 1);
    }

    //this.props.updateMasterState({ isLoading: false, postsComponent: component });
    console.log('Setting focused item');
    this.setState({  data: data, focusedItem: focusedItem });
    this.props.updateMasterState({ isLoading: false });
  }

  /**
    Like a document for particular model
    @param  {String}  id  The id of the document
    @param  {String}  model   The model document belongs to
  */
  like = async(id, model) =>
  {
    // Fetch data
    this.props.updateMasterState({ isLoading: true });

    const data = [...this.state.data];
    const idx = data.findIndex(detail => detail._id.toString() === id.toString());

    const params =
    {
      model: 'post',
      id: id
    };
    const response = await ApiRequest.sendRequest('post', params, 'social/like');
    console.log(response);
    if(response.data.error !== null)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    // Update parent
    const oldPost = data[idx];
    data[idx] = response.data.results;
    data[idx].comments = oldPost.comments;

    let focusedItem = null;
    if(this.state.focusedItem)
    {
      focusedItem = response.data.results;
      focusedItem.comments = oldPost.comments;
    }
    this.setState({ data: data, focusedItem: focusedItem });
    this.props.updateMasterState({ isLoading: false });
  }

  /**
    Report a document for particular model
    @param  {String}  id  The id of the document
    @param  {String}  model   The model document belongs to
  */
  report = async(id, model) =>
  {
    // Fetch data
    this.props.updateMasterState({ isLoading: true });

    const component = {...this.props.component};
    const idx = component.details.findIndex(detail => detail._id.toString() === id.toString());

    const params =
    {
      model: model,
      id: id
    };
    const response = await ApiRequest.sendRequest('post', params, 'social/report');
    if(response.data.error !== null)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    this.props.showAlert('Information', response.data.message);
    this.props.updateMasterState({ isLoading: false });
  }

  /**
    Update document
    @note Parameters come in an object named params
    @param {String}  params.model is the model type being created
    @param  {JSON}  params.post   {id: postId}
    @param  {JSON}    params.comment  {id: commentId, message: commentText} (Optional if updating post)
  */
  update = async(params) =>
  {
    this.props.updateMasterState({ isLoading: true });

    //
    const component = {...this.props.component};
    const postIdx = component.details.findIndex(detail => detail._id.toString() === params.post.id.toString());

    let updateParams = {};
    if(params.comment)
    {
      updateParams =
      {
        message: params.comment.message
      };
    }
    else
    {
      updateParams =
      {
        text: params.post.text
      }
    }

    const apiParams =
    {
      model: params.model,
      id: params.comment ? params.comment.id : params.post.id,
      params: updateParams
    };
    const response = await ApiRequest.sendRequest('post', apiParams, 'data/update');
    if(response.error !== null)
    {
      this.props.updateMasterState({ isLoading: false });
      this.props.showAlert('Un-oh', response.data.error);
      return;
    }

    // Update parent
    if(params.comment)
    {
      const commentIdx = component.details[postIdx].comments.findIndex(comment => comment._id.toString() === params.comment.id.toString());
      component.details[postIdx].comments[commentIdx] = response.results;
      console.log(component.details[postIdx].comments[commentIdx]);
    }
    else
    {
      const oldPost = component.details[postIdx];
      component.details[postIdx] = response.results;
      component.details[postIdx].comments = oldPost.comments;
    }
    updateParams =
    {
      postsComponent: component,
      isLoading: false
    }

    this.props.updateMasterState(updateParams);
    return response.results;
  }

  // MARK: - Render
  shouldComponentUpdate(nextProps, nextState)
	{
    return (
      this.props.component.create.isOpen !== nextProps.component.create.isOpen ||
      this.props.component.create.detail.text !== nextProps.component.create.detail.text ||
      this.props.component.create.detail.files !== nextProps.component.create.detail.files ||
      this.state.focusedItem !== nextState.focusedItem ||
      this.state.commentText !== nextState.commentText ||
      this.state.data !== nextState.data ||
      this.state.isRefreshing !== nextState.isRefreshing
    );
	}

  renderItem = (item, index) =>
  {
    const isFocused = this.state.focusedItem ? item._id.toString() === this.state.focusedItem._id.toString() : false;
    return (
        <TouchableOpacity
          key={`feed-post-touch-${index}`}
          onPress={()=>
          {
            this.props.navigation.setOptions({ tabBarVisible: false });
            this.setState({ focusedItem: {...item}, editMode: false });
          }}
        >
          <Post
            key={`feed-post-${index}`}
            navigation={this.props.navigation}
            component={this.props.component}
            post={item}
            updatePost={(postText) => this.update({ post: { id: item._id, text: postText }, model: 'post' })}
            deletePost={() => this.delete({ post: { id: item._id }, model: 'post' })}
            reportPost={() => this.report(item._id, 'post')}
            like={() => this.like(item._id, 'post')}
            updateComment={(commentId, commentText) => this.update({ post: { id: item._id }, model: 'comment', comment: { id: commentId, message: commentText } })}
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

  render()
  {
    console.log('\tFeed.render()');
    //console.log(this.props.component);
    return (
      <MenuProvider>
       <KeyboardAvoidingView
          style={styles.container}
        >
        <KeyboardAwareScrollView contentContainerStyle={styles.inner}>
          <View style={Styles.row}>
            {this.state.focusedItem &&
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
            </TouchableOpacity>}
            {this.state.focusedItem &&
            this.state.focusedItem.createdBy._id.toString() === this.props.user._id.toString() &&
            <TouchableOpacity
              onPress={() =>
              {
                console.log('Sending');
                console.log(this.state.focusedItem);
                this.props.navigation.setOptions({ tabBarVisible: true });
                this.props.navigation.navigate('create',
                {
                  onGoBack: () => this.loadData({ isRefreshing: false, forcedReload: true }),
                  post: this.state.focusedItem
                });
              }}
              style={styles.commentImg}
            >
              <Icon
                name={'edit'}
                size={Math.round(Dimensions.get('window').height * 0.04)}
                color={Colors.black}
              />
            </TouchableOpacity>}
          </View>

          <FlatList
            data={this.state.focusedItem ? [this.state.focusedItem]: this.state.data}
            numColumns={1}
            scrollEnabled={true}
            renderItem={ ({item, index}) => this.renderItem(item, index) }
            ItemSeparatorComponent={this.separator}
            nestedScrollEnabled={true}
            onRefresh={() =>
            {
              this.loadData({ isRefreshing: true, forcedReload: false });
            }}
            refreshing={this.state.isRefreshing}
            keyExtractor={item => (item._id ? item._id.toString() : '')}
          />

          {this.state.focusedItem &&
          <View style={styles.bottom}>
            <CommentTextField
              animationStyle={this._commentHelper.getCommentFieldAnimationStyle()}
              commentText={this.state.commentText}
              updateMasterState={(val) => this.setState({ commentText: val })}
              comment={null}
              entityId={this.state.focusedItem._id}
              depth={0}
              createComment={this.comment}
            />
          </View>}

        </KeyboardAwareScrollView>

      </KeyboardAvoidingView>
    </MenuProvider>
  );
  }
}

const styles = StyleSheet.create({
  bottom: {
    justifyContent: 'flex-end'
  },
  container: {
    backgroundColor: Colors.separatorGray,
    flex: 1,
    marginTop: 10,
  },
  inner: {
    justifyContent: 'flex-end',
    flex: 1,
  }

});
