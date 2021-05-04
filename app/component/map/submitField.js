import React,{ useState } from 'react';
import {
  Animated,
  Dimensions,
  Keyboard,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  TouchableOpacity,
} from 'react-native-gesture-handler';

import Icon from "react-native-vector-icons/MaterialIcons";
import { AppText, Colors, DateTime, Images, Styles } from '../../constant';

const SubmitField = ({  note,
                        submit,
                        updateMasterState,
                        showAlert,
                        isEnabled }) =>
{
  const [disabled, setDisabled] = useState(false);

  return (
  <View
    style={styles.container}
  >
    <TextInput
      value={note}
      style={[styles.commentTextField, {textAlignVertical: 'center'}]}
      underlineColorAndroid='transparent'
      onChangeText={(val) => updateMasterState('note', val)}
      placeholder={'Note...'}
      multiline={true}
      autoCorrect={true}
      blurOnSubmit={true}
      onSubmitEditing={Keyboard.dismiss}
    />
    <SafeAreaView style={styles.buttonContainer}>
      <TouchableOpacity
        onPress={() =>
        {
          // Move the alert logic here as it helps deal with the button logic.
          if(note.trim().length === 0)
          {
            showAlert('Error', 'Please add a note for the alert.');
            return;
          }

          // When submitting, disable the button to prevent extra alerts from being created.
          if (! disabled) {
            setDisabled(true)
            submit();
          }
        }}
        style={styles.commentIcon}
        disabled={!isEnabled}
      >
        {false && /* Using text instead of icon */
        <Icon
          name={'arrow-upward'}
          size={Math.round(Dimensions.get('window').height * 0.07)}
          color={Colors.descriptionGray}
        />}
        <Text
          style={styles.text}
          adjustsFontSizeToFit={true}
          numberOfLines={2}
        >{'Create Alert'}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  </View>);
}

const h22 = Math.round(Dimensions.get('window').height * 0.0282);
const h20 = Math.round(Dimensions.get('window').height * 0.0256);
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    marginBottom: 0,
  },
  commentIcon: {
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  commentTextField: {
    flex: 0.65,
    paddingLeft: 10,
    color: Colors.cAccordionArrowInactive,
    fontSize: h20,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
  },
  buttonContainer: {
    flex: 0.35,
    borderWidth: 1,
    borderColor: Colors.plainGray5,
    borderRadius: 4,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: h22,
  },
});

export default SubmitField;
