import React, { Component } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  Image,
  FlatList,
  Text,
  TextInput,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import RnTextSize, { TSFontSpecs } from 'react-native-text-size'

import { ImageButton } from '../../component/imageButton';
import { FormInput } from '../../component/formInput';
import { AppText, Colors, Styles } from '../../constant';

import CommentCell from './commentCell';

import {formatDateOnly} from '../../helper/datetime';

export default class CommentContainer extends Component
{
  _listRef = null;
  _commentLength = 0;

  constructor(props)
  {
    console.log('\tCommentContainer()');
    super(props)
    this.state =
    {
      lastIndexScrolledTo: -1
    };
    this._listRef = React.createRef();

    this._commentLength = props.comments.length;
  }

  scrollToIndex(index)
  {
    if(this._listRef.current)
    {
      // TODO: idk why this doesnt scroll
      this._listRef.current.scrollToEnd();
    }
  }

  shouldComponentUpdate(nextProps, nextState)
  {
    return (
      this.props.comments !== nextProps.comments ||
      this._commentLength !== nextProps.comments.length
    );
  }

  componentDidUpdate()
  {
    if(this.props.comments.length !== this._commentLength)
    {
      //this._listRef.current.scrollToEnd({ animated: true });
    }
    this._commentLength = this.props.comments.length;
  }

  // Renders the top level comments (CommentCell will render it's own nested children)
  renderItem = (item, index) =>
  {
    const comment = this.props.nestedComments ? item[1] : item;
    const commentId = (this.props.nestedComments ? comment.comment._id.toString() : comment._id.toString());

    //console.log(comment);
    return (<CommentCell
              comment={comment}
              updateMasterState={this.props.updateMasterState}
              deleteComment={this.props.deleteComment}
              createComment={this.props.createComment}
              index={index}
              entityId={this.props.entityId}
              userId={this.props.userId}
              key={`comment-container-cell-${index}-0-${commentId}`}
              expanded={this.props.activeCommentCellId === commentId}
              subCommentText={this.props.subCommentText}
              nestedComments={this.props.nestedComments}
              depth={0}
              toggleCommentKeyboard={this.props.toggleCommentKeyboard}
              activeCommentCellId={this.props.activeCommentCellId}
            />);
  }

  render()
  {
    console.log('\tCommentContainer.render()');
    console.log(this.props.comments.length);
    return(
      <View style={styles.container}>
        <FlatList
          ref={this._listRef}
          data={this.props.comments}
          numColumns={1}
          scrollEnabled={true}
          renderItem={ ({item, index}) => this.renderItem(item, index) }
          ItemSeparatorComponent={() => <View style={styles.dashedSeparator} />}
          nestedScrollEnabled={false}
          keyExtractor={item => item._id.toString()}
        />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  dashedSeparator: {
    borderStyle: 'solid',
    borderColor: Colors.dashedSeparator,
    borderWidth: 0.5,
    backgroundColor: Colors.cAccordionDetailBg,
    width: '90%',
  },
});
