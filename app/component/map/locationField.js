import React, {useEffect} from 'react';
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
import { TouchableHighlight } from 'react-native-gesture-handler';

import Icon from "react-native-vector-icons/MaterialIcons";
import { AppText, Colors, DateTime, Images, Styles } from '../../constant';

import {MARKER_DEFAULT_COLOR} from '../../constant/App'
import {Button} from 'react-native-elements';
import {TouchableOpacity} from 'react-native-gesture-handler';


const LocationField = ({  location,
                          onPress,
                          isShowingLocation }) =>
{

  return (

    <View style={styles.container}>
      <TouchableHighlight onPress={onPress}>
        <View style={styles.button}>
          <Icon
            style={styles.icon}
            name={'place'}
            size={h16}
            color={Colors.black}
          />
          <Text>
            {isShowingLocation ? 'Hide Location' : (location ? 'Show Location' : 'Show Location')}      
          </Text>
        </View>
      </TouchableHighlight>
    </View>

  );
}

const h100 = Math.round(Dimensions.get('window').height * 0.1282);
const h64 = Math.round(Dimensions.get('window').height * 0.075);
const h50 = Math.round(Dimensions.get('window').height * 0.064);
const h22 = Math.round(Dimensions.get('window').height * 0.0282);
const h20 = Math.round(Dimensions.get('window').height * 0.0256);
const h16 = Math.round(Dimensions.get('window').height * 0.0205);

const styles = StyleSheet.create({

  container: {
    height:h64,
    width:'36%',
    padding:10
  },
  button: {
    alignItems: "center",
    backgroundColor: "#eee",
    padding: 10,

  },


});

export default LocationField;
