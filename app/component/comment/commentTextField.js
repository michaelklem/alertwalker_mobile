import React from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Icon from "react-native-vector-icons/MaterialIcons";
import { AppText, Colors, DateTime, Images, Styles } from '../../constant';

const CommentTextField = ({ animationStyle,
                            commentText,
                            updateMasterState,
                            comment,
                            entityId,
                            index,
                            nestedComments,
                            depth,
                            createComment }) =>
{
  return (
  <Animated.View style={[Styles.paperNoPadding, styles.commentTextFieldContainer, { height: animationStyle ? animationStyle : (comment.animationStyle ? comment.animationStyle : 0), overflow: 'hidden' }]}>
    <TextInput
      value={commentText}
      style={Styles.commentTextField}
      underlineColorAndroid='transparent'
      onChangeText={(val) => updateMasterState(val)}
      placeholder={AppText.pDetailCommentPlaceholderText}
      autoCorrect={false}
    />
    <View style={{flex: 0.1}}>
      <TouchableOpacity
        onPress={() =>
        {
          const params =
          {
            entityId: entityId,
            entityType: 'post',
            message: commentText,
            parent: comment === null ? '_null_' : comment._id,
            likedBy: '_empty_array_',
            dislikedBy: '_empty_array_'
          };
          createComment(params,
                        comment === null ? null : index,
                        nestedComments ? comment.reverseOrderParents : [],
                        depth);
        }}
        style={Styles.commentIcon}
      >
        <Icon
          name={'send'}
          size={Math.round(Dimensions.get('window').height * 0.04)}
          color={Colors.descriptionGray}
        />
      </TouchableOpacity>
    </View>
  </Animated.View>);
}

const styles = StyleSheet.create({
  commentTextFieldContainer: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    marginBottom: 0,
  },
});

export default CommentTextField;
