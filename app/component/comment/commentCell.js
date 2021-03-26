import React, { useState, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  LayoutAnimation,
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import RnTextSize, { TSFontSpecs } from 'react-native-text-size'
import Swipeout from 'react-native-swipeout';

import { ImageButton } from '../../component/imageButton';
import { AppText, Colors, DateTime, Images, Styles } from '../../constant';
import { CommentActions, CommentTextField } from '.';


// TODO: Add prop-types to EVERYTHING!
const CommentCell = ({  userId,
                        usernameStyle,
                        comment,
                        entityId,
                        toggleCommentKeyboard,
                        deleteComment,
                        createComment,
                        index,
                        expanded,
                        subCommentText,
                        updateMasterState,
                        nestedComments,
                        depth,
                        activeCommentCellId,
                  }) =>
{
  const commentId = (nestedComments ? comment.comment._id.toString() : comment._id.toString());

  // Calculate static sizes
  const theComment = nestedComments ? comment.comment : comment;
  const [messageText, setMessageText] = useState(theComment.message);

  // Calculate dynamic sizes
  const textWidth = Math.round((Dimensions.get('window').width * 0.9) - (10 + (depth * 10)));

  // When swiping on cell
  const swipeBtns = [];
  if(theComment.createdBy._id.toString() === userId)
  {
    swipeBtns.push({
      text: 'Delete',
      backgroundColor: 'red',
      onPress: () => deleteComment(theComment._id)
    });
  }

  console.log('\tCommentCell.render()');
  return(
    <>

      <Swipeout
        style={{backgroundColor: Colors.transparent}}
        right={swipeBtns}
        autoClose={true}
        key={`comment-container-swipe-${index}`}
      >
        <View
          style={[styles.cell, {paddingLeft: 10 + (depth * 10)}]}
        >

          <View style={Styles.row}>
            <Image
              style={Styles.userPhotoImgSmall}
              source={theComment.createdBy.photo ? { uri: theComment.createdBy.photo } : Images.noPhoto}
            />
            <View style={Styles.nameAndDateHolder}>
              <Text
                align={'left'}
              >
                {theComment.createdBy.firstName + ' ' + theComment.createdBy.lastName}
              </Text>
              <Text
                style={Styles.date}
                align={'left'}
              >
                {DateTime.formatFullDate(theComment.createdOn)}
              </Text>
            </View>
          </View>

          <View style={Styles.row}>
            <Text
              style={[Styles.previewText, {width: textWidth }]}
              adjustsFontSizeToFit={true}
            >{comment.message}</Text>
          </View>

          {false &&
          <CommentActions
            depth={depth}
            comment={theComment}
          />}

        </View>
      </Swipeout>

      <CommentTextField
        commentText={subCommentText}
        updateMasterState={(val) => this.setState({ subCommentText: val })}
        comment={theComment}
        entityId={entityId}
        depth={depth}
        createComment={createComment}
        nestedComments={nestedComments}
      />

      <View>
        {nestedComments && comment.children.map( (child) =>
        {
          return (<CommentCell
            comment={child}
            updateMasterState={updateMasterState}
            performAction={performAction}
            index={index}
            entityId={entityId}
            userId={userId}
            key={`comment-container-cell-${index}-${depth}-${child.comment._id.toString()}`}
            expanded={activeCommentCellId === child.comment._id.toString()}
            subCommentText={subCommentText}
            nestedComments={nestedComments}
            depth={depth+1}
            toggleCommentKeyboard={toggleCommentKeyboard}
            activeCommentCellId={activeCommentCellId}
          />);
        })}
      </View>

    </>
  );
};

const styles = StyleSheet.create({
  cell: {
    width: '100%',
    backgroundColor: Colors.white,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'column',
  },
});

export default CommentCell;
