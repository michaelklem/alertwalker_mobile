import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Linking,
  Dimensions,
} from 'react-native';

import { AppManager } from '../../manager';
import { MyButton } from '../myButton';
import { AppText, Colors, Styles } from '../../constant';
import { TosModal } from '.';

const TosButton = ({ segue, title }) =>
{
  const [tosModalVisible, setTosModalVisible] = useState(false);

  return (
    <View style={[Styles.pinToBottom]}>
      <MyButton
        buttonStyle={styles.termsBtn}
        titleStyle={styles.termsBtnText}
        title={title}
        onPress={async() =>
        {
          /*const url = AppManager.GetInstance().getFrontEndUrl() + '/terms.pdf';
          const supported = await Linking.canOpenURL(url);
          if(supported)
          {
            await Linking.openURL(url);
          }*/
          setTosModalVisible(true);
        }}
      />
      <TosModal
        bottomBtnText={AppText.tosModal.bottomBtn.text}
        close={() =>
        {
          setTosModalVisible(false);
        }}
        visible={tosModalVisible}
      />
    </View>);
};

const font9 = Math.round(Dimensions.get('window').height * 0.01153);

const styles = StyleSheet.create({
  termsBtn: {
    height: Math.round(Dimensions.get('window').height * 0.04),
    backgroundColor: Colors.terms.background,
    justifyContent: 'center',
  },
  termsBtnText: {
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
    height: '100%',
    fontSize: font9,
    textAlign: 'center',
    color: Colors.white,
  }
});
export default TosButton;
