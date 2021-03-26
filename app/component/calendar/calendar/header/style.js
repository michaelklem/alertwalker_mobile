import {Dimensions, StyleSheet, Platform} from 'react-native';
import * as defaultStyle from '../../style';
import { Colors } from '../../../../constant';

const STYLESHEET_ID = 'stylesheet.calendar.header';

const width10 = Math.round(Dimensions.get('window').width * 0.0266);
const height15 = Math.round(Dimensions.get('window').height * 0.01923);
const height7 = Math.round(Dimensions.get('window').height * 0.00897);
const height10 = Math.round(Dimensions.get('window').height * 0.01282);

export default function (theme = {}) {
  const appStyle = {...defaultStyle, ...theme};
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingLeft: width10,
      paddingRight: width10,
      alignItems: 'center',
    },
    headerContainer: {
      flexDirection: 'row'
    },
    monthText: {
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
      fontSize: height15,
      textAlign: 'center',
      color: Colors.grayBlue,
      marginBottom: height10,
    },
    arrow: {
      paddingHorizontal: width10,
      paddingVertical: height10,
      ...appStyle.arrowStyle
    },
    arrowImage: {
      tintColor: Colors.grayBlue,
      ...Platform.select({
        web: {
          width: appStyle.arrowWidth,
          height: appStyle.arrowHeight
        }
      })
    },
    disabledArrowImage: {
      tintColor: Colors.grayBlue,
    },
    week: {
      marginTop: height7,
      flexDirection: 'row',
      justifyContent: 'space-around'
    },
    dayHeader: {
      marginTop: 2,
      marginBottom: height7,
      width: 32,
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
      fontSize: height15,
      textAlign: 'center',
      color: Colors.grayBlueLight,
    },
    disabledDayHeader: {
      color: appStyle.textSectionTitleDisabledColor
    },
    ...(theme[STYLESHEET_ID] || {})
  });
}
