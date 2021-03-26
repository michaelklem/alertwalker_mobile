import React, {Component} from 'react';
import
{
  Animated,
  Dimensions,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  Share,
  LayoutAnimation,
  Platform,
  UIManager
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {
  Menu,
  MenuProvider,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';
const { Popover } = renderers

import {AppText, Colors, DateTime, Extensions, Images, Styles} from '../../constant';
import ApiRequest from '../../helper/ApiRequest';
import { ImageButton } from '../imageButton';

import { Actions } from '.';
import { CommentContainer } from '../comment';
import { CommentHelper } from '../../component-helper';
import { AppManager } from '../../manager';


/**
*/
export default class Post extends Component
{
  // MARK: - Data fields
  _commentHelper = null;
  _commentContainerRef = null;
  _commentLength = 0;
  _manager = null;

  // MARK: - Constructor
  constructor(props)
  {
    console.log("\tPost()");
    super(props);

    this.state =
    {
      comments:
      {
        isShowing: false,
        text: '',
        isValid: false,
        isEnabled: true,
        nestedComments: false,
      },
      commentText: '',
      subCommentText: '',
      activeCommentCellIdx: -1,
      activeCommentCellId: '',

      menuOpen: false,

      isEditMode: false,
      editText: '',
    };

    if(this.state.comments.isEnabled)
    {
      this._commentHelper = CommentHelper.GetInstance(this.state.comments);
      this._commentContainerRef = React.createRef();
    }

    this._commentLength = props.post.comments.length;

    this._manager = AppManager.GetInstance();
  }

  // MARK: - Component comments
  /**
    Toggle the keyboard for a comment component
    @param  {Int} newActiveCell The new cell that is active (-1 signifies nothing is)
    @param  {Int} depth   The depth of the cell in a nested container
    @param  {String}  id  The ID of the cell we want the animation of
  */
  toggleCommentKeyboard = (newActiveCell, depth, id) =>
  {
    //console.log(newActiveCell + " prev " + this.state.activeCommentCellIdx );
    // Clear comment text if changing active cell
    if(newActiveCell !== this.state.activeCommentCellIdx)
    {
      const animations = this._commentHelper.getAnimations(newActiveCell,
                                                          this.state.activeCommentCellIdx,
                                                          depth,
                                                          id,
                                                          this.state.activeCommentCellId,
                                                          this.props.post.comments);
      Animated.parallel(animations);
      this.setState({ activeCommentCellIdx: newActiveCell, activeCommentCellId: newActiveCell === -1 ? '' : id, subCommentText: '' });
    }
  }

  share = async() =>
  {
    try
    {
      let message = this._manager.getShareText().replace('{{id}}', this.props.post._id.toString());

      let subject = 'Check out this app';

      const result = await Share.share({
        message:  message,
        subject: subject,
        title: subject
      });

      if (result.action === Share.sharedAction)
      {
        console.log(result.activityType);
        if (result.activityType)
        {
           // shared with activity type of result.activityType
        }
        else
        {
           // shared
        }
      }
    }
    catch(err)
    {
      console.log(err);
    }
  }


  // MARK: - Render
  shouldComponentUpdate(nextProps, nextState)
  {
    let newComment = (this.props.post.comments.length !== nextProps.post.comments.length);
    if(!newComment)
    {
      for(let i = 0; i < nextProps.post.comments.length; i++)
      {
        if(this.props.post.comments[i].message !== nextProps.post.comments[i].message)
        {
          //console.log(this.props.post.comments[i].message + '==' + nextProps.post.comments[i].message);
          newComment = true;
          break;
        }
      }
    }

    if(!newComment)
    {
      if(this.props.post.comments && nextProps.post.comments)
      {
        //console.log(this._commentLength + '<' + nextProps.post.comments.length);
        newComment = this._commentLength < nextProps.post.comments.length || this._commentLength > nextProps.post.comments.length;
      }
    }

    //console.log(this.props.post.likedBy.length + '==' + nextProps.post.likedBy.length);
    return (
      this.props.post.comments !== nextProps.post.comments ||
      this.state.comments.isShowing !== nextState.comments.isShowing ||
      this.state.isEditMode !== nextState.isEditMode ||
      this.state.editText !== nextState.editText ||
      this.props.post !== nextProps.post ||
      this.props.isFocused !== nextProps.isFocused ||
      this.state.menuOpen !== nextState.menuOpen ||
      newComment
    );
  }

  componentDidUpdate()
  {
    this._commentLength = this.props.post.comments.length;
  }

  // TODO: In mongo need to create a text index on posts.text because the size is too large to index
  render()
  {
    console.log('\tPost.render()');
    //console.log(this.props.post);
    //console.log(this.state);
    let fileType = null;
    if(this.props.post.files.length > 0)
    {
      const extensionType = this.props.post.files[0].substr(this.props.post.files[0].lastIndexOf('.') + 1).toLowerCase();
      if(Extensions.image.indexOf(extensionType) !== -1)
      {
        fileType = 'image';
      }
      else if(Extensions.video.indexOf(extensionType) !== -1)
      {
        fileType = 'video';
      }
      else
      {
        fileType = 'unknown';
      }
    }

    return (
    <>
      <View style={[styles.container, Styles.paper]}>
        <View style={styles.postUserContainer}>
          <ImageButton
            imgSrc={this.props.post.createdBy.photo && this.props.post.audience !== 'Anonymous' ? {uri: this.props.post.createdBy.photo} : Images.noPhoto}
            imageStyle={Styles.userPhotoImgSmall}
            onPress={() => this.setState({ menuOpen: !this.state.menuOpen })}
          />

          {this.props.post.audience !== 'Anonymous' &&
          <Menu
            renderer={Popover}
            rendererProps={{ preferredPlacement: 'auto' }}
            opened={this.state.menuOpen}
            onBackdropPress={() => this.setState({ menuOpen: !this.state.menuOpen })}
          >
            <MenuTrigger/>
            <MenuOptions style={styles.menuOptions}>
              <MenuOption onSelect={() => this.props.navigation.navigate('chat', { user: { _id: this.props.post.createdBy._id } })}>
                <Text style={styles.contentText}>Message</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>}

          <View style={Styles.nameAndDateHolder}>
            <Text
              style={Styles.name}
              align={'left'}
            >
              {this.props.post.audience == 'Anonymous' ? 'Anonymous Post' : this.props.post.createdBy.firstName + ' ' + this.props.post.createdBy.lastName}
            </Text>
            <Text
              style={Styles.date}
              align={'left'}
            >
              {DateTime.formatFullDate(this.props.post.createdOn)}
            </Text>
          </View>
        </View>

        <View style={styles.content}>

          {fileType === 'image' &&
          <Image source={{ uri: this.props.post.files[0] }} alt='Post image' style={styles.postImage} />}

          {this.props.post.files.length > 0 &&
          fileType === 'unknown' &&
          <Text>{'Unsupported file type'}</Text>}

          <Text align='left'>
            {this.props.post.text}
          </Text>

          <Actions
            user={this.props.user}
            like={() => this.props.like(this.props.post._id)}
            comment={() => this.props.comment(this.props.post._id, this.state.comments.text)}
            share={() => this.share()}
            toggleComments={() =>
            {
              const comments = {...this.state.comments};
              comments.isShowing = !comments.isShowing;
              this.setState({ comments: comments });
              this.props.updateMasterState({ focusedItem: this.props.post });
              this.props.navigation.setOptions({ tabBarVisible: false });
            }}
            commentsShowing={this.state.comments.isShowing}
            siteManager={this.props.siteManager}
            post={this.props.post}
          />

        </View>

        {this.state.comments.isEnabled &&
        this.props.isFocused &&
        this.state.comments.isShowing &&
        <CommentContainer
          ref={this._commentContainerRef}
          comments={this.props.post.comments}
          updateMasterState={(state) => this.setState(state)}
          deleteComment={this.props.deleteComment}
          createComment={this.props.comment}
          userId={this.props.user._id}
          entityId={this.props.post._id}
          activeCommentCellId={this.state.activeCommentCellId}
          subCommentText={this.state.subCommentText}
          nestedComments={this.state.comments.nestedComments}
          toggleCommentKeyboard={this.toggleCommentKeyboard}
        />}

      </View>
    </>);
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    width: Math.round(Dimensions.get('window').width) - 20,
    height: 'auto',
    flex: 1,
  },
  content: {
    marginLeft: Math.round(Dimensions.get('window').width * 0.1) + 10,
  },
  postUserContainer: {
    flexDirection: 'row',
  },
  postImage: {
    marginRight: 20,

    width: Math.round(Dimensions.get('window').width - 20),
    height: Math.round(Dimensions.get('window').height * 0.3),
    overflow: 'visible',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  menuOptions: {
    padding: 10,
  },
  contentText: {
    fontSize: 18,
  },
});
