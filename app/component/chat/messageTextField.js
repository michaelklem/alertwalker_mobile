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
      style={styles.commentTextField}
      underlineColorAndroid='transparent'
      onChangeText={(val) => updateMasterState(val)}
      placeholder={AppText.cGroupMessageTextFieldPlaceHolderText}
      placeholderTextColor={Colors.darkBlue2}
      autoCorrect={true}
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
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const width10 = Math.round(Dimensions.get('window').width * 0.02666);

const styles = StyleSheet.create({
  commentTextFieldContainer: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    marginBottom: 0,
  },
  commentTextField: {
    flex: 0.9,
    paddingLeft: width10,
    paddingRight: width10,
    color: Colors.darkBlue2,
    fontSize: height18,
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
  },
});

export default MessageTextField;
