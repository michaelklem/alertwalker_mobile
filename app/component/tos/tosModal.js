import React from 'react';
import {
  StyleSheet,
  View,
  Modal,
  Linking,
  SafeAreaView,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { AppManager } from '../../manager';
import { MyButton } from '../myButton';
import { AppText, Colors, Images, Styles } from '../../constant';

const TosModal = ({ tos, visible, close, bottomBtnText }) =>
{
  return (
    <Modal
      animationType={'slide'}
      transparent={true}
      visible={visible}
    >
      <View style={styles.container}>
        <TouchableOpacity
          onPress={(e)=> close()}
          style={styles.closeRow}
        >
          <Image
            style={styles.closeBtn}
            source={Images.close}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>{AppText.tosModal.header.text}</Text>
        <ScrollView>
          <Text style={styles.bodyText}>{AppText.tosModal.body.text}</Text>
        </ScrollView>
        <MyButton
          buttonStyle={styles.bottomBtn}
          titleStyle={styles.bottomBtnText}
          title={bottomBtnText}
          onPress={async() =>
          {
            close();
          }}
        />
      </View>
    </Modal>);
};
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.black,
    opacity: 0.99,
  },
  closeBtn: {
    width: Math.round(Dimensions.get('window').width * 0.1),
    height: Math.round(Dimensions.get('window').width * 0.1),
    resizeMode: 'contain',
  },
  closeRow: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
    margin: 40,
  },
  headerText: {
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
    fontSize: 24,
    textAlign: 'center',
    color: Colors.white,
  },
  bodyText: {
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
    fontSize: 18,
    textAlign: 'left',
    color: Colors.white,
    margin: 10,
    opacity: 0.5,
  },
  bottomBtn: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.loginContainer.emailLoginBtn,
    justifyContent: 'center',
  },
  bottomBtnText: {
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
    fontSize: 18,
    textAlign: 'center',
    marginLeft: 16,
    color: Colors.white,
  },
});
export default TosModal;
