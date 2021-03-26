import React from 'react';
import {
  Dimensions,
  Text,
  StyleSheet,
  View
} from 'react-native';

import { ImageButton } from '../imageButton';
import { Colors, DateTime, Images, Styles } from '../../constant';

// The message component takes the message text and the username of the message
// sender. It also takes `self` - a boolean value depicting whether the message
// is sent by the current logged in user
const Message = ({ message, self }) =>
(
  <View style={[styles.messageContainer, self ? styles.messageContainerSelf : styles.messageContainerOther]}>
    <View style={[Styles.row]}>
      <ImageButton
        imgSrc={message.createdBy.photo ? {uri: message.createdBy.photo} : Images.noPhoto}
        imageStyle={styles.userPhoto}
      />

      <View style={styles.nameAndDateHolder}>
        <Text style={styles.name}>{`${message.createdBy.firstName} ${message.createdBy.lastName}`}</Text>
        <Text style={styles.date}>{DateTime.formatFullDate2(message.createdOn)}</Text>
      </View>
    </View>

    <Text style={styles.messageText}>{message.text}</Text>

  </View>
)

const twelve = Math.round(Dimensions.get('window').width * 0.027);
const ten = Math.round(Dimensions.get('window').width * 0.027);
const eightWidth = Math.round(Dimensions.get('window').width * 0.083);
const height14 = Math.round(Dimensions.get('window').height * 0.017948);
const height8 = Math.round(Dimensions.get('window').height * 0.01025);
const height12 = Math.round(Dimensions.get('window').height * 0.01538);

const styles = StyleSheet.create({
  messageContainer: {
    width: Math.round(Dimensions.get('window').width * 0.683),
    padding: ten,
    borderRadius: 25,
    marginTop: ten * 2,
  },
  messageContainerSelf: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.chat.backgroundSelf.color,
    marginRight: ten * 2,
  },
  messageContainerOther: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.chat.backgroundOther.color,
    marginLeft: ten * 2,
  },
  nameAndDateHolder: {
    marginLeft: ten,
    width: '90%',
  },
  name: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Bold'
      },
      android: {
        fontFamily: 'Roboto-Bold'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height14,
    textAlign: 'left',
    color: Colors.orange1,
  },
  date: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Regular'
      },
      android: {
        fontFamily: 'Roboto-Regular'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height12,
    textAlign: 'left',
    color: Colors.orange1,
  },
  messageText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Regular'
      },
      android: {
        fontFamily: 'Roboto-Regular'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height14,
    textAlign: 'left',
    color: Colors.white,
    marginLeft: eightWidth + ten,
  },
  userPhoto: {
    width: eightWidth,
    height: eightWidth,
    borderRadius: eightWidth / 2,
    borderWidth: 1,
    borderColor: Colors.white,
  },
});

export default Message;
