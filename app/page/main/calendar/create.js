import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  Text,
  FlatList,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';

import Icon from "react-native-vector-icons/MaterialIcons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ImageButton } from '../../../component/imageButton';
import { LayoverMenu } from '../../../component/layoverMenu';
import { MyButton } from '../../../component/myButton';
import {AppText, Colors, Images, Styles} from '../../../constant';
import { FormInput } from '../../../component/formInput';

let types = ['task', 'appointment', 'meeting'];
let formInputs = [
  {
    id: 'title',
    placeholder: 'Description',
    type: 'text'
  },
  {
    id: 'startOn',
    placeholder: 'Start on',
    type: 'time',
    is24Hour: false,
  },
  {
    id: 'endOn',
    placeholder: 'End on',
    type: 'time',
    is24Hour: false,
  },
  {
    id: 'location',
    placeholder: 'Enter location',
    type: 'text'
  }
];

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthsOfYearLong = [ 'January',  'February',  'March',  'April',  'May',  'June',  'July',  'August',  'September',  'October',  'November',  'December' ];

const Create = ({ selectedDay,
                  calendarEvent,
                  updateMasterState,
                  saveData,
                  noteMenu,
                  scrollViewRef,
                  showAlert,
                  headerManager
                }) =>
{
  let selectedDate = new Date(selectedDay.timestamp);
  console.log('Create date: ' + selectedDate);
  return (
  <>
    <View style={[styles.typeRow]}>
      {types.map( (type, i) =>
      {
        return (
          <MyButton
            key={`calendar-create-type-${i}`}
            onPress={() =>
            {
              let tempEvent = {...calendarEvent};
              tempEvent.type = type;
              updateMasterState({ calendarEvent: tempEvent });
            }}
            titleStyle={calendarEvent.type === type ? styles.typeActive : styles.typeInactive}
            title={AppText.calendarPage.layout1[type + 'sText']}
          />
        )
      })}
    </View>

    <View style={[styles.typeRow, { alignItems: 'center' }]}>
      <ImageButton
        imgSrc={Images.backArrow}
        imageStyle={styles.backArrow}
        titleStyle={styles.backArrowContainer}
        onPress={() =>
        {
          updateMasterState({ isCreating: false });
          headerManager.show('right');
        }}
      />
    </View>

    <TouchableOpacity
      style={[{marginLeft: 10}, {marginVertical: 30}]}
      onPress={() =>
      {
        scrollViewRef.current.scrollToEnd();
      }}
    >
      <Text style={styles.titleText}>{`${selectedDate.getDate()} ${days[selectedDate.getDay()]}`}</Text>
      <Text style={styles.titleSubText}>{`${monthsOfYearLong[selectedDate.getMonth()]}`}</Text>
      <Text style={styles.titleSubText}>{`${selectedDate.getFullYear()}`}</Text>
    </TouchableOpacity>

    {formInputs.map( (input, i) =>
    {
      return (
        <FormInput
          key={input.id}
          id={input.id}
          updateMasterState={(id, val) =>
          {
            let tempEvent = {...calendarEvent};

            // Don't let start time be before end time
            if(id === 'startOn')
            {
              let startOn = new Date();
              let m = val.substr(val.indexOf(':') + 1);
              let h = val.substr(0, val.indexOf(':'));
              startOn.setMinutes(m);
              startOn.setHours(h);

              endOnVal = tempEvent.endOn;
              if(endOnVal)
              {
                let endOn = new Date();
                m = endOnVal.substr(endOnVal.indexOf(':') + 1);
                h = endOnVal.substr(0, endOnVal.indexOf(':'));
                endOn.setMinutes(m);
                endOn.setHours(h);

                if(endOn < startOn)
                {
                  showAlert('Uh-oh', 'Your end on time is less than your start on time');
                  return;
                }
              }
            }
            else if(id === 'endOn')
            {
              let endOn = new Date();
              let m = val.substr(val.indexOf(':') + 1);
              let h = val.substr(0, val.indexOf(':'));
              endOn.setMinutes(m);
              endOn.setHours(h);

              startOnVal = tempEvent.startOn;
              if(startOnVal)
              {
                let startOn = new Date();
                m = startOnVal.substr(startOnVal.indexOf(':') + 1);
                h = startOnVal.substr(0, startOnVal.indexOf(':'));
                startOn.setMinutes(m);
                startOn.setHours(h);

                if(startOn > endOn)
                {
                  showAlert('Uh-oh', 'Your start on time is greater than your end on time');
                  return;
                }
              }
            }

            tempEvent[id] = val;
            updateMasterState({ calendarEvent: tempEvent });
          }}
          value={calendarEvent[input.id]}
          label={''}
          textInputStyle={1}
          containerStyle={1}
          type={input.type}
          is24Hour={input.is24Hour}
          showLabel={false}
          placeholderTextColor={Colors.calendarPage.placeholder.color}
          placeholder={input.placeholder}
          values={[]}
          validationType={FormInput.ValidationType.text}
        />
      )
    })}

    <View style={styles.containerStyle1}>
      <View style={styles.entry}>
        <View style={{width: '60%', flexDirection: 'row'}}>
          <Image
            source={Images.menuNotes}
            style={styles.menuNotes}
          />
          <Text style={styles.entryTitle}>{noteMenu.selectedIndex === -1 ? 'Add Note' : noteMenu.options[noteMenu.selectedIndex].title}</Text>
        </View>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() =>
          {
            let tempNoteMenu = {...noteMenu};
            tempNoteMenu.isOpen = true;
            updateMasterState({ noteMenu: tempNoteMenu });
          }}
        >
          <Icon
            name={'arrow-forward-ios'}
            size={Math.round(Dimensions.get('window').height * 0.04)}
            color={Colors.lightBlue1}
            style={[styles.moreIcon, noteMenu.selectedIndex !== -1 ? {alignSelf: 'flex-end', marginRight: 16} : '']}
          />
        </TouchableOpacity>
      </View>
    </View>

    <View>
      <MyButton
        buttonStyle={styles.bottomBtn}
        titleStyle={styles.bottomBtnText}
        title={AppText.calendarPage.layout1.save}
        onPress={async() =>
        {
          saveData();
        }}
      />
    </View>

    {noteMenu.isOpen &&
    <LayoverMenu
      title={AppText.calendarPage.layout1.layoverMenuTitleText}
      options={noteMenu.options}
      selectedIndex={noteMenu.selectedIndex}
      showTopLeftIcon={false}
      onSelect={async(selected) =>
      {
        let tempMenu = {...noteMenu};
        tempMenu.selectedIndex = selected;
        tempMenu.isOpen = false;
        if(tempMenu.selectedIndex !== -1)
        {
          let tempEvent = {...calendarEvent};
          tempEvent.note = tempMenu.options[selected]._id;
          updateMasterState({ calendarEvent: tempEvent, noteMenu: tempMenu });
        }
        else
        {
          updateMasterState({ noteMenu: tempMenu });
        }
      }}
      onClose={() =>
      {
        let tempMenu = {...noteMenu};
        tempMenu.isOpen = false;
        updateMasterState({ noteMenu: tempMenu });
      }}
    />}
  </>
  );
}
const sideMargins = Math.round(Dimensions.get('window').width * 0.044);

const height5 = Math.round(Dimensions.get('window').height * 0.00641);
const height21 = Math.round(Dimensions.get('window').height * 0.02692);
const height14 = Math.round(Dimensions.get('window').height * 0.01794);
const width28 = Math.round(Dimensions.get('window').width * 0.0746);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height16 = Math.round(Dimensions.get('window').height * 0.02051);
const height36 = Math.round(Dimensions.get('window').height * 0.04615);
const height30 = Math.round(Dimensions.get('window').height * 0.0384);
const width20 = Math.round(Dimensions.get('window').width * 0.0533);
const width16 = Math.round(Dimensions.get('window').width * 0.04266);
const width36 = Math.round(Dimensions.get('window').width * 0.096);

const styles = StyleSheet.create({
  text: {
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
    textAlign: 'center',
    color: Colors.white,
    alignSelf: 'flex-end',
    marginBottom: height5,
  },
  entry: {
    height: Math.round(Dimensions.get('window').height * 0.098),
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: width16,
    width: '100%',
  },
  entryTitle: {
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
    fontSize: height18,
    textAlign: 'left',
    color: Colors.black,
  },
  menuNotes: {
    height: Math.round(Dimensions.get('window').height * 0.0217),
    width: Math.round(Dimensions.get('window').width * 0.0916),
    resizeMode: 'contain'
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: width16,
    marginTop: height16,
    marginTop: height30,
  },
  containerStyle1: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#979797',
  },
  typeActive: {
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
    fontSize: height18,
    textAlign: 'left',
    color: Colors.white,
    marginLeft: width16,
  },
  typeInactive: {
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
    fontSize: height14,
    marginLeft: width16,
    textAlign: 'left',
    opacity: 0.2,
    color: Colors.white,
  },
  noteType: {
    marginLeft: width20,
  },
  titleText: {
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
    fontSize: height36,
    textAlign: 'left',
    color: Colors.notesPage.title,
    marginLeft: width20,
  },
  titleSubText: {
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
    fontSize: height21,
    textAlign: 'left',
    color: Colors.notesPage.title,
    marginLeft: width20,
  },
  backArrow: {
    width: Math.round(Dimensions.get('window').width * 0.041),
    height: Math.round(Dimensions.get('window').height * 0.019),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  backArrowContainer: {
    width: Math.round(Dimensions.get('window').width * 0.1),
    height: Math.round(Dimensions.get('window').height * 0.025),
    alignSelf: 'center',
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
    fontSize: height18,
    textAlign: 'center',
    marginLeft: width16,
    color: Colors.white,
  },
  moreIcon: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    width: '20%',
  },
  iconContainer: {
    width: '40%',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'flex-start',
  },
});

export default Create;
