import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Colors, Styles } from '../../constant';


const ToolbarIcon = ({ action,
                       disabled,
                       icon,
                       onPress  }) =>
{
  //console.log('Toolbaricon ' + action);

  let text = '';

  let width = Math.round(Dimensions.get('window').width * 0.091);
  if(action === 'unorderedList')
  {
    width = Math.round(Dimensions.get('window').width * 0.1583);
  }
  else if(action === 'uploadImage')
  {
    width = Math.round(Dimensions.get('window').width * 0.1666);
    text = 'Upload Image'
  }
  else if(action === 'captureImage')
  {
    width = Math.round(Dimensions.get('window').width * 0.1666);
    text = 'Take an Image'
  }
  else if(action === 'drawImage')
  {
    width = Math.round(Dimensions.get('window').width * 0.1666);
    text = 'Draw'
  }
  else if(action === 'cropImage')
  {
    width = Math.round(Dimensions.get('window').width * 0.1666);
    text = 'Crop'
  }
  else if(action === 'uploadPdf')
  {
    width = Math.round(Dimensions.get('window').width * 0.1666);
    text = 'Upload PDF'
  }
  else if(action === 'editPdf')
  {
    width = Math.round(Dimensions.get('window').width * 0.1666);
    text = 'Edit PDF'
  }

  return (
    <TouchableOpacity
      key={action}
      disabled={disabled}
      style={[styles.container, { width: width } ]}
      onPress={(action) => onPress(action)}
    >
      <Image
        source={icon}
        style={styles.icon}
        tintColor={Colors.notesPage.editorIcon}
      />
      {text !== '' &&
      <Text
        adjustsFontSizeToFit={true}
        style={styles.text}>{text}</Text>}
    </TouchableOpacity>
  );
};

const height10 = Math.round(Dimensions.get('window').height * 0.01282);

const styles = StyleSheet.create({
    container: {
      height: Math.round(Dimensions.get('window').height * 0.0615),
      backgroundColor: Colors.editorToolbar.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: Colors.darkBlue1,
      borderWidth: 1,
    },
    icon: {
      resizeMode: 'contain',
      justifyContent: 'center',
      width: '33%',
      height: '33%'
    },
    text: {
      color: Colors.white,
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
      fontSize: height10,
      marginTop: height10,
      textAlign: 'center',
    }
});

export default ToolbarIcon;
