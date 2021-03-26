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

import { SelectPicker } from '../selectPicker';
import { Colors, Images } from '../../constant';

const FontSizes =
[
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '7', value: '7' }
];
const Fonts =
[
  { label: 'Arial', value: 'Arial' },
  { label: 'Avenir', value: 'Avenir' },
  { label: 'Avenir-Light', value: 'Avenir-Light' },
  { label: 'Baskerville-Bold', value: 'Baskerville-Bold' },
  { label: 'Courier', value: 'Courier' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Verdana', value: 'Verdana' }
];

const ToolbarDropdown = ({ action,
                       disabled,
                       text,
                       value,
                       onPress  }) =>
{
  //console.log('Toolbaricon ' + action);

  let items = FontSizes;
  let width = Math.round(Dimensions.get('window').width * 0.091);
  if(action === 'unorderedList')
  {
    width = Math.round(Dimensions.get('window').width * 0.1583);
  }
  else if(action === 'fontSize')
  {
    width = Math.round(Dimensions.get('window').width * 0.144);
  }
  else if(action === 'font')
  {
    width = Math.round(Dimensions.get('window').width * 0.333);
    items = Fonts;
  }
  //console.log('Value: ' + value);
  return (
    <View style={[styles.container, { width: width }]}>
      <SelectPicker
        onValueChange={(value) => onPress(action, value)}
        items={items}
        placeholder={/*action === 'fontSize' ? {label:'4', value: '4', key: '4', color: '#FFF'} : {label:'Helvetica', value: 'Helvetica', key: 'Helvetica', color: '#FFF'}*/''}
        value={value}
        icon={() => {
          return (
            <Image
              style={{
                width: Math.round(Dimensions.get('window').width * 0.022),
                height: Math.round(Dimensions.get('window').width * 0.022),
                resizeMode: 'contain',
                justifyContent: 'center',
                alignItems: 'center'

              }}
              source={Images.formatDownArrow}
            />
          )
        }}
        style={pickerStyles}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      height: Math.round(Dimensions.get('window').height * 0.0615),
      backgroundColor: Colors.editorToolbar.background,
      alignItems: 'center',
      justifyContent: 'center',
      borderColor: Colors.darkBlue1,
      borderWidth: 1,
    },
    item: {
      justifyContent: 'center',
      width: '100%',
      color: Colors.white,
      height: '100%'
    }
});

const pickerStyles = StyleSheet.create({
    inputIOS: {
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      width: '100%',
      color: Colors.white,
      height: '100%',
      fontSize: Math.round(Dimensions.get('window').height * 0.01282)
    }
});

export default ToolbarDropdown;
