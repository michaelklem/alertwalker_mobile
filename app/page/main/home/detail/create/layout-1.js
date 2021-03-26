import React from 'react';
import {
  Animated,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableHighlight,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icon from "react-native-vector-icons/MaterialIcons";

import { ImageButton } from '../../../../../component/imageButton';
import { MyButton } from '../../../../../component/myButton';
import { AppText, Colors, Styles } from '../../../../../constant';

const Layout1 = ({  isLoading,
                    detail,
                    updateMasterState,
                    create,
                    modalVisible,
                    modalData,
                    selectModalRow,
                    showAlert
                  }) =>
{

  return (
  <KeyboardAwareScrollView style={[styles.container, Styles.fullScreen, Styles.contentContainer]}>

    <ActivityIndicator
      size="large"
      color={Colors.burnoutGreen}
      animating={isLoading}
      style={Styles.loading}
    />

    <View style={[Styles.row, {marginTop: 15}]}>
      <View style={{flex: 0.33}} />
      <Text
        style={[styles.subjectLabelText, {flex: 0.33}]}
        adjustsFontSizeToFit={true}
        numberOfLines={1}
      >{AppText.pCreateSubjectText}</Text>
      <View style={[{flex: 0.33}, {alignItems: 'flex-end' }, {paddingRight: 10}]}>
        <Image
          style={styles.editImg}
          source={require('../../../../../asset/createEdit.png')}
        />
      </View>
    </View>

    <TextInput
      style={styles.subjectText}
      adjustsFontSizeToFit={true}
      numberOfLines={1}
      placeholderTextColor={Colors.cAccordionRowInactive}
      placeholder={detail.subject ? '' : AppText.pCreateDebateTitle}
      onChangeText={(val) => updateMasterState('subject', val, true)}
    >{detail.subject ? detail.subject : ''}</TextInput>

    <TextInput
      style={[styles.bodyText, {marginTop: 30}]}
      placeholderTextColor={Colors.cAccordionArrowInactive}
      placeholder={detail.body ? '' : AppText.pCreateBodyText}
      onChangeText={(val) => updateMasterState('body', val, true)}
    >{detail.body ? detail.body : ''}</TextInput>

    <View style={styles.dashedSeparator} />

    <TextInput
      style={styles.hashtagsText}
      adjustsFontSizeToFit={true}
      numberOfLines={1}
      placeholderTextColor={Colors.nameDateDetailText}
      placeholder={detail.hashtags ? '' : AppText.pCreateHashtagsText}
      onChangeText={(val) => updateMasterState('hashtags', val, true)}
    >{detail.hashtags ? detail.hashtags : ''}</TextInput>

    <View style={styles.buttonRow}>
      <Text style={styles.buttonTitleText} adjustsFontSizeToFit={true} numberOfLines={1}>{AppText.pCreateChooseStanceText}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.buttonRowContentRow, styles.block, styles.leftBlock]} onPress={() => updateMasterState('ownerStance', 'for', true)}>
          <Image
            style={[styles.thumbImage, detail.ownerStance === 'for' ? {tintColor:Colors.orange} : '']}
            source={require('../../../../../asset/createFor.png')}
          />
          <Text style={styles.buttonContentText} adjustsFontSizeToFit={true} numberOfLines={1}>{AppText.pCreateForText}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonRowContentRow, styles.block, styles.rightBlock]} onPress={() => updateMasterState('ownerStance', 'against', true)}>
          <Text style={styles.buttonContentText} adjustsFontSizeToFit={true} numberOfLines={1}>{AppText.pCreateAgainstText}</Text>
          <Image
            style={[styles.thumbImage, detail.ownerStance === 'against' ? {tintColor:Colors.orange} : '']}
            source={require('../../../../../asset/createAgainst.png')}
          />
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.buttonRow}>
      <Text style={styles.buttonTitleText} adjustsFontSizeToFit={true} numberOfLines={1}>{AppText.pCreateChooseTypeText}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.buttonRowContentRow, styles.block, styles.leftBlock]} onPress={() => updateMasterState('isDiscussion', false, true)}>
          <Image
            style={[styles.thumbImage, detail.isDiscussion === false ? {tintColor:Colors.orange} : '']}
            source={require('../../../../../asset/createOneVsOne.png')}
          />
          <Text style={styles.buttonContentText} adjustsFontSizeToFit={true} numberOfLines={1}>{AppText.pCreateOneVsOneText}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonRowContentRow, styles.block, styles.rightBlock]} onPress={() => updateMasterState('isDiscussion', true, true)}>
          <Text style={styles.buttonContentText} adjustsFontSizeToFit={true} numberOfLines={1}>{AppText.pCreateOpenText}</Text>
          <Image
            style={[styles.thumbImage, detail.isDiscussion ? {tintColor:Colors.orange} : '']}
            source={require('../../../../../asset/createOpen.png')}
          />
        </TouchableOpacity>
      </View>
    </View>

    <View style={[styles.linkRow]}>
      <Text style={styles.linkText} adjustsFontSizeToFit={true} numberOfLines={1}>{AppText.pCreateLinkText}</Text>
      <View style={styles.publicPrivateContainer}>
        <View style={{ flex: 0.2}}/>
        <Image
          style={styles.earthImage}
          source={require('../../../../../asset/createEarth.png')}
        />
        <Text style={styles.linkText} adjustsFontSizeToFit={true} numberOfLines={1}>{detail.isOpenToPublic ? AppText.pCreatePublicText : AppText.pCreatePrivateText}</Text>
        <Switch
          trackColor={{ false: "#767577", true: Colors.nameDateDetailText }}
          thumbColor={detail.isOpenToPublic ? Colors.white : Colors.cAccordionDetailBg}
          ios_backgroundColor={Colors.nameDateDetailText}
          onValueChange={() => updateMasterState('isOpenToPublic', !detail.isOpenToPublic, true)}
          value={detail.isOpenToPublic}
          />
      </View>
    </View>

    <View style={styles.linkRow}>
      <ImageButton
        titleStyle={styles.linkImg}
        imgSrc={require('../../../../../asset/createLink.png')}
        onPress={(val) => console.log('customId pressed')}
      />
      <TextInput
        style={styles.linkValueText}
        adjustsFontSizeToFit={true}
        numberOfLines={1}
        onChangeText={(val) => updateMasterState('customId', val, true)}
      >{`${detail.customId ? detail.customId : '' }`}</TextInput>
    </View>

    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.bodyText}>{AppText.pCreateSelectUserText}</Text>
          <FlatList
            data={modalData}
            numColumns={1}
            scrollEnabled={true}
            keyExtractor={item => item._id.toString()}
            renderItem={ ({item, index}) =>
              <TouchableOpacity onPress={() => selectModalRow(index)}>
                <Text style={styles[item._styleClassName]}>{item.name}</Text>
              </TouchableOpacity>
            }
            style={styles.modalDataContainer}
          />
          <View style={styles.modalButtonRow}>
            <MyButton
              onPress={() => updateMasterState('modalVisible', false, false)}
              titleStyle={styles.bodyText}
              title={AppText.pCreateCloseUserModal}
            />
            <MyButton
              onPress={() =>
              {
                const selected = [];
                for(let i = 0; i < modalData.length; i++)
                {

                }
                showAlert(AppText.pCreateSendSuccessText, '', () => updateMasterState('modalVisible', false, false));
              }}
              titleStyle={styles.bodyText}
              title={AppText.pCreateUserModalActionText}
            />
          </View>
        </View>
      </View>
    </Modal>

    <TouchableOpacity style={styles.sendToUserContainer} onPress={() => updateMasterState('modalVisible', true, false)}>
      <Text
        style={styles.sendToUserText}
        adjustsFontSizeToFit={true}
        numberOfLines={1}
        placeholderTextColor={Colors.nameDateDetailText}
        placeholder={detail.hashtags ? '' : AppText.pCreateHashtagsText}
        onChangeText={(val) => updateMasterState('hashtags', val, true)}
      >{AppText.pCreateSendText}</Text>
      <Image
        style={styles.earthImage}
        source={require('../../../../../asset/createSend.png')}
      />
    </TouchableOpacity>

    <MyButton
      titleStyle={styles.submitBtnTitle}
      buttonStyle={styles.submitBtnContainer}
      title={AppText.pCreatePublishText}
      onPress={create}
    />

  </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: Colors.white
  },
  selectedRow: {
    backgroundColor: Colors.orange,
    borderRadius: 20,
  },
  modalButtonRow: {
    justifyContent: 'space-around',
    flexDirection: 'row',
    width: '100%',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 35,
    paddingVertical: 25,
    width: '80%',
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  modalDataContainer: {
    paddingVertical: 10,
  },
  publicPrivateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 0.5,
  },
  subjectLabelText: {
    color: Colors.cAccordionArrowInactive,
    fontSize: 19,
    textAlign: 'center',
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
    })
  },
  sendToUserText: {
    color: Colors.nameDateDetailText,
    fontSize: 22,
    textAlign: 'center',
    marginRight: 10,
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
    fontWeight: 'bold',
  },
  sendToUserContainer: {
    justifyContent: 'center',
    marginTop: 50,
    flexDirection: 'row'
  },
  subjectText: {
    marginTop: 30,
    color: Colors.cAccordionRowInactive,
    fontSize: 38,
    textAlign: 'center',
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
    })
  },
  submitBtnContainer: {
    width: Math.round(Dimensions.get('window').width * 0.77),
    alignSelf: 'center',
    backgroundColor: Colors.purple,
    borderRadius: 25,
    marginTop: 10,
  },
  submitBtnTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    paddingVertical: 10,
    color: Colors.white,
    fontSize: 30,
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
    })
  },
  linkValueText: {
    color: Colors.linkText,
    fontSize: 19,
    textAlign: 'left',
    flex: 0.95,
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
    })
  },
  bodyText: {
    color: Colors.cAccordionArrowInactive,
    fontSize: 19,
    textAlign: 'center',
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
    })
  },
  editImg: {
    height: Math.round(Dimensions.get('window').height * 0.028),
    width: Math.round(Dimensions.get('window').width * 0.0637),
  },
  dashedSeparator: {
    borderStyle: 'dashed',
    borderColor: Colors.dashedSeparator,
    borderWidth: 1,
    backgroundColor: Colors.cAccordionDetailBg,
    marginTop: 60,
  },
  hashtagsText: {
    marginVertical: 10,
    color: Colors.nameDateDetailText,
    fontSize: 19,
    textAlign: 'center',
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
    })
  },
  leftBlock: {
    borderRightWidth: 1,
    flex: 0.5,
    borderColor: Colors.nameDateDetailText
  },
  rightBlock: {
    borderLeftWidth: 1,
    flex: 0.5,
    borderColor: Colors.nameDateDetailText
  },
  thumbImage: {
    alignSelf: 'center',
    width:  Math.round(Dimensions.get('window').width * 0.105),
    height: Math.round(Dimensions.get('window').height * 0.045),
    resizeMode: 'contain',
  },
  earthImage: {
    alignSelf: 'center',
    height: Math.round(Dimensions.get('window').height * 0.028),
    width: Math.round(Dimensions.get('window').width * 0.0637),
  },
  buttonRow: {
    justifyContent: 'space-between',
    flexDirection: 'column',
    marginHorizontal: 10,
    marginBottom: 10,
    backgroundColor: Colors.cAccordionDetailBg,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  buttonRowContentRow: {
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  buttonContentText: {
    color: Colors.nameDateDetailText,
    fontSize: 23,
    alignSelf: 'center',
    textAlign: 'center',
    fontWeight: 'bold',
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
    })
  },
  buttonTitleText: {
    color: Colors.nameDateDetailText,
    fontSize: 17,
    alignSelf: 'center',
    textAlign: 'center',
    marginVertical: 20,
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
    })
  },
  linkRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  linkText: {
    color: Colors.nameDateDetailText,
    fontSize: 30,
    alignSelf: 'center',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 0.5,
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
    })
  },


  customIdText: {
    fontSize: 22,
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
    flex: 0.6,
    color: Colors.cAccordionDetailBg,
    textAlign: 'left',
  },
  linkImg: {
    height: Math.round(Dimensions.get('window').height * 0.028),
    width: Math.round(Dimensions.get('window').width * 0.0637),
    overflow: 'visible',
    resizeMode: 'contain',
  },
});

export default Layout1;
