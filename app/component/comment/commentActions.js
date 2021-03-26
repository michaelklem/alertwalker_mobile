import React from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  Text,
} from 'react-native';

import { AppText, Colors, DateTime, Images, Styles } from '../../constant';

const CommentActions = ({ depth,
                          comment,
                          likeDislike,
                        }) =>
{
  const buttonRowWidth = Math.round((Dimensions.get('window').width * 0.9) - (10 + (depth * 10)));

  return (
  <View style={Styles.row}>
    <View style={[styles.buttonRow, {width: buttonRowWidth}]}>
      <View style={Styles.column}>
        <Text style={styles.reactionCount}>{comment.likedBy.length > 1 ? comment.likedBy.length : ' '}</Text>

        <TouchableOpacity
          onPress={() =>
          {
            likeDislike(
            {
              id: comment._id,
              index: index,
              reverseOrderParents: nestedComments ? comment.reverseOrderParents : [],
              depth: depth,
              value: 'like'
            });
          }}
          style={styles.likeImg}
        >
          <Icon
            name={'thumbs-up'}
            size={Math.round(Dimensions.get('window').height * 0.04)}
            color={Colors.black}
          />
        </TouchableOpacity>

      </View>
      <View style={Styles.column}>
        <Text styles={styles.reactionCount}>{theComment.dislikedBy.length > 1 ? theComment.dislikedBy.length : ' '}</Text>
        <ImageButton
          titleStyle={styles.likeImg}
          onPress={() => performAction({ action: 'reactToComment', id: comment._id, index: index, reverseOrderParents: nestedComments ? comment.reverseOrderParents : [], depth: depth, value: 'dislike' })}
          imgSrc={comment.dislikedBy.indexOf(userId) === -1 ? require('../../asset/emptyAgainstThumb.png') : require('../../asset/againstThumb.png')}
        />
      </View>

      {!expanded &&
      nestedComments &&
      <TouchableOpacity
        onPress={() => { toggleCommentKeyboard(index, depth, comment._id) }}
        style={styles.commentImg}
      >
        <Icon
          name={'reply'}
          size={Math.round(Dimensions.get('window').height * 0.04)}
          color={Colors.plainGray2}
        />
      </TouchableOpacity>}

      {expanded &&
      nestedComments &&
      <TouchableOpacity
        onPress={() => { toggleCommentKeyboard(-1, depth, comment._id) }}
        style={styles.commentImg}
      >
        <Icon
          name={'close'}
          size={Math.round(Dimensions.get('window').height * 0.04)}
          color={Colors.purple}
        />
      </TouchableOpacity>}
    </View>
  </View>);
}


const styles = StyleSheet.create({
  likeImg: {
    width:  Math.round(Dimensions.get('window').width * 0.039),
    height: Math.round(Dimensions.get('window').height * 0.018),
    marginRight: Math.round(Dimensions.get('window').width * 0.0175),
  },
  commentImg: {
    width:  Math.round(Dimensions.get('window').width * 0.07),
    height: Math.round(Dimensions.get('window').height * 0.035),
    marginRight: Math.round(Dimensions.get('window').width * 0.0175),
    position: 'absolute',
    right: 0,
    bottom: -5,
  },
  buttonRow: {
    flexDirection: 'row',
    bottom: 0,
    position: 'absolute',
    height: Math.round(Dimensions.get('window').height * 0.018),
  },
  reactionCount: {
    color: Colors.cAccordionArrowInactive,
    fontSize: 14,
  },
});

export default CommentActions;
