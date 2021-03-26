import {Dimensions, StyleSheet, Platform} from 'react-native';
import * as defaultStyle from '../../../style';
import { Colors } from '../../../../../constant';
const STYLESHEET_ID = 'stylesheet.day.basic';

const height14 = Math.round(Dimensions.get('window').height * 0.01794);
const height32 = Math.round(Dimensions.get('window').height * 0.041);

export default function styleConstructor(theme={}) {
  const appStyle = {...defaultStyle, ...theme};
  return StyleSheet.create({
    base: {
      width: height32,
      height: height32,
      alignItems: 'center'
    },
    text: {
      marginTop: Platform.OS === 'android' ? 4 : 6,
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
      textAlign: 'center',
      color: Colors.grayBlue2,
      backgroundColor: 'rgba(255, 255, 255, 0)',
      ...appStyle.textDayStyle
    },
    alignedText: {
      marginTop: Platform.OS === 'android' ? 4 : 6
    },
    selected: {
      backgroundColor: appStyle.selectedDayBackgroundColor,
      borderRadius: 16
    },
    today: {
      backgroundColor: appStyle.todayBackgroundColor,
      borderRadius: 16
    },
    todayText: {
      color: appStyle.todayTextColor
    },
    selectedText: {
      color: appStyle.selectedDayTextColor
    },
    disabledText: {
      color: Colors.grayBlueLight2,
    },
    dot: {
      width: 4,
      height: 4,
      marginTop: 1,
      borderRadius: 2,
      opacity: 0,
      ...appStyle.dotStyle
    },
    visibleDot: {
      opacity: 1,
      backgroundColor: appStyle.dotColor
    },
    selectedDot: {
      backgroundColor: appStyle.selectedDotColor
    },
    disabledDot: {
      backgroundColor: appStyle.disabledDotColor || appStyle.dotColor
    },
    todayDot: {
      backgroundColor: appStyle.todayDotColor || appStyle.dotColor
    },
    ...(theme[STYLESHEET_ID] || {})
  });
}
