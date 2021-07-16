import React from 'react';
import {
  Dimensions,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Modal,
  View,
  Image
} from 'react-native';

import { Colors, Images } from '../../constant';
import { ImageButton } from '../imageButton';

const LayoverMenu = ({  title,
                        options,
                        selectedIndex,
                        onSelect,
                        onClose,
                        showTopLeftIcon
                    }) =>
{
  return (
    <Modal
      animationType={'slide'}
      transparent={true}
      visible={true}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.contentContainer}>
          <View style={[styles.titleRow]}>
            <View style={styles.titleLhs}>
              {showTopLeftIcon !== false &&
              <Image
                source={Images.addIconSmall}
                style={styles.addBtn}
              />}
              <Text style={[styles.title, showTopLeftIcon !== false ? '' : {marginLeft: Math.round(Dimensions.get('window').width * 0.138)}]}>{title}</Text>
            </View>
            <ImageButton
              titleStyle={styles.closeBtn}
              imgSrc={Images.close}
              onPress={onClose}
            />
          </View>
          <View style={styles.bottomBorder} />
          {options && options.map( (option, i) =>
          {
            const img = option.image ? option.image : (i === selectedIndex ? Images.checkFilled : Images.checkEmpty);
            return (
              <TouchableOpacity
                onPress={() => onSelect(i)}
                key={`layover-menu-option-${i}`}
              >
                <View style={styles.entry}>
                  <Image
                    source={img}
                    style={option.style ? styles[option.style] : styles.check}
                  />
                  <Text style={styles.entryTitle}>{option.title}</Text>
                </View>
                <View style={styles.bottomBorder} />
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const height18 = Math.round(Dimensions.get('window').height * 0.0230769);
const height14 = Math.round(Dimensions.get('window').height * 0.01794);

const sideMargins = Math.round(Dimensions.get('window').width * 0.044);
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: Colors.black,
    opacity: 0.98,
  },
  contentContainer: {
    marginTop: sideMargins,
    flexDirection: 'column',
    flex: 1,
  },
  closeBtn: {
    width: Math.round(Dimensions.get('window').width * 0.1),
    height: Math.round(Dimensions.get('window').width * 0.1),
    marginRight: sideMargins,
    resizeMode: 'contain',
    alignSelf: 'baseline',
  },
  row: {
    flexDirection: 'row',
    width: '100%'
  },
  titleRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: Math.round(Dimensions.get('window').height * 0.098),
  },
  entry: {
    height: Math.round(Dimensions.get('window').height * 0.098),
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  titleLhs: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: sideMargins / 2.5,
    width: '85%',
  },
  title: {
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
    marginLeft: sideMargins,
  },
  entryTitle: {
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
    fontSize: height18,
    textAlign: 'left',
    color: Colors.white,
    marginLeft: sideMargins,
  },
  check: {
    height: Math.round(Dimensions.get('window').height * 0.023),
    width: Math.round(Dimensions.get('window').width * 0.067),
    marginLeft: sideMargins,
    resizeMode: 'contain'
  },
  bottomBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.white,
    width: '100%',
    opacity: 0.2,
  },
  menuNotes: {
    height: Math.round(Dimensions.get('window').height * 0.0217),
    width: Math.round(Dimensions.get('window').width * 0.0916),
    marginLeft: sideMargins,
    resizeMode: 'contain'
  },
  menuCalendar: {
    height: Math.round(Dimensions.get('window').height * 0.019),
    width: Math.round(Dimensions.get('window').width * 0.0916),
    marginLeft: sideMargins,
    resizeMode: 'contain'
  },
  menuFacebook: {
    height: Math.round(Dimensions.get('window').height * 0.0205),
    width: Math.round(Dimensions.get('window').width * 0.0916),
    marginLeft: sideMargins,
    resizeMode: 'contain'
  },
  menuInstagram: {
    height: Math.round(Dimensions.get('window').height * 0.028),
    width: Math.round(Dimensions.get('window').width * 0.0916),
    marginLeft: sideMargins,
    resizeMode: 'contain'
  },
  menuEmail: {
    height: Math.round(Dimensions.get('window').height * 0.015),
    width: Math.round(Dimensions.get('window').width * 0.0916),
    marginLeft: sideMargins,
    resizeMode: 'contain'
  },
  menuAdditional: {
    height: Math.round(Dimensions.get('window').height * 0.0217),
    width: Math.round(Dimensions.get('window').width * 0.0916),
    marginLeft: sideMargins,
    resizeMode: 'contain'
  },
  addBtn: {
    width: Math.round(Dimensions.get('window').width * 0.05),
    height: Math.round(Dimensions.get('window').height * 0.023),
    marginLeft: sideMargins,
    resizeMode: 'contain',
    alignSelf: 'baseline',
  },
});

export default LayoverMenu;
