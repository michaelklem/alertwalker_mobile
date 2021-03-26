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

const MessageTextField = ({ animationStyle,
                            messageText,
                            sendMessage,
                            updateMasterState }) =>
{
  return (
  <Animated.View style={[Styles.paperNoPadding, styles.commentTextFieldContainer, { height: animationStyle, overflow: 'hidden' }]}>
    <TextInput
      value={messageText}
      style={Styles.commentTextField}
      underlineColorAndroid='transparent'
      onChangeText={(val) => updateMasterState(val)}
      placeholder={AppText.cGroupMessageTextFieldPlaceHolderText}
      autoCorrect={false}
    />
    <View style={{flex: 0.1}}>
      <TouchableOpacity
        onPress={() =>
        {
          sendMessage();
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

export default MessageTextField;
