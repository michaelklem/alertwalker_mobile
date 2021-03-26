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

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { ImageButton } from '../../../component/imageButton';
import { LayoverMenu } from '../../../component/layoverMenu';
import { MyButton } from '../../../component/myButton';
import { ActionList, Calendar } from '../../../component/calendar';
import {AppText, Colors, Images, Styles} from '../../../constant';
import Create from './create';

const Layout1 = ({  isLoading,
                    menu,
                    user,
                    showAlert,
                    updateMasterState,
                    isRefreshing,
                    refresh,
                    isCreating,
                    isViewing,
                    calendarEvent,
                    calendarEvents,
                    selectedDate,
                    saveData,
                    renderCalendarEvents,
                    noteMenu,
                    scrollViewRef,
                    headerManager,
                    dataStoreInitialized,
                    actionList,
                  }) =>
{
  //console.log(selectedDate);
  let selectedDates = { [selectedDate.dateString]: {selected: true, marked: false, selectedColor: '#EF9A47'} };
  let createdOn = null;
  let parsedDate = '';
  for(let i = 0; i < calendarEvents.length; i++)
  {
    createdOn = new Date(calendarEvents[i].startOn);
    parsedDate = createdOn.getFullYear() + '-' + ("0" + (createdOn.getMonth() + 1)).slice(-2) + '-' + ("0" + createdOn.getDate()).slice(-2);
    selectedDates[parsedDate] = {selected: true, marked: false, selectedColor: '#979797'};
  }

  return (
  <KeyboardAwareScrollView
    ref={scrollViewRef}
    style={[styles.container]}
  >
    {isLoading &&
    <ActivityIndicator
      size="large"
      color={Colors.burnoutGreen}
      animating={isLoading}
      style={Styles.loading}
    />}

    {menu.isOpen &&
    <LayoverMenu
      title={AppText.notesPage.layout1.layoverMenuTitle}
      options={menu.options}
      selectedIndex={menu.selectedIndex}
      onSelect={(selected) =>
      {
        let tempMenu = {...menu};
        tempMenu.selectedIndex = selected;
        tempMenu.isOpen = false;
        updateMasterState({ menu: tempMenu });
        refresh(tempMenu.options[selected].sortBy);
      }}
      onClose={() =>
      {
        let tempMenu = {...menu};
        tempMenu.isOpen = false;
        updateMasterState({ menu: tempMenu });
      }}
    />}

    {isCreating &&
    <>
      <Create
        calendarEvent={calendarEvent}
        updateMasterState={updateMasterState}
        selectedDay={selectedDate}
        saveData={saveData}
        noteMenu={noteMenu}
        scrollViewRef={scrollViewRef}
        showAlert={showAlert}
        headerManager={headerManager}
      />
    </>}



    {isViewing &&
    <View style={styles.filterRow}>
      <View style={styles.filterText}>
        <Text style={styles.selectedText}>{menu.selectedIndex !== -1 ? menu.options[menu.selectedIndex].title : ''}</Text>
      </View>
      <TouchableOpacity
        style={styles.downArrow}
        onPress={() =>
        {
          let tempMenu = {...menu};
          tempMenu.isOpen = true;
          updateMasterState({ menu: tempMenu });
        }}
      >
        <Image
          style={[styles.downArrow]}
          source={Images.downArrowCalendar}
        />
      </TouchableOpacity>
    </View>}

    {!dataStoreInitialized &&
    <Text style={styles.selectedText}>{'Syncing in progress'}</Text>}

    {!isCreating && <View style={{marginTop: Math.round(Dimensions.get('window').height * 0.0269)}} />}
    <Calendar
      // Initially visible month. Default = Date()
      current={new Date()}
      // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
      minDate={undefined}
      // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
      maxDate={undefined}
      onDayPress={(day) =>
      {
        console.log('Selected day: ' + JSON.stringify(day));
        let day2 = {...day};
        day2.timestamp = (1000 * 60 * 60 * 24 + day.timestamp);
        updateMasterState({ isViewing: true, selectedDate: day2 });
      }}
      onDayLongPress={(day) =>
      {
        console.log('Selected day: ' + JSON.stringify(day));
        let day2 = {...day};
        day2.timestamp = (1000 * 60 * 60 * 24 + day.timestamp);
        updateMasterState({ isViewing: true, selectedDate: day2 });
      }}
      // http://arshaw.com/xdate/#Formatting
      monthFormat={'MMMM yyyy'}
      onMonthChange={(month) => {console.log('month changed', month)}}
      hideArrows={false}
      hideExtraDays={false}
      disableMonthChange={false}
      // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
      firstDay={7}
      hideDayNames={false}
      showWeekNumbers={false}
      disableArrowLeft={false}
      disableArrowRight={false}
      disableAllTouchEventsForDisabledDays={false}
      enableSwipeMonths={true}
      markedDates={{
        ...selectedDates,
        [selectedDate.dateString]: {selected: true, marked: false, selectedColor: '#EF9A47'}
      }}
    />

    {calendarEvents.length > 0 &&
    isViewing &&
    <View style={styles.notesContainer}>
      {renderCalendarEvents()}
    </View>}

    {!isCreating &&
    <ActionList
      ref={actionList}
      showAlert={showAlert}
      updateMasterState={updateMasterState}
      user={user}
    />}


  </KeyboardAwareScrollView>
  );
};

const height5 = Math.round(Dimensions.get('window').height * 0.00641);
const height14 = Math.round(Dimensions.get('window').height * 0.01794);
const width28 = Math.round(Dimensions.get('window').width * 0.0746);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height16 = Math.round(Dimensions.get('window').height * 0.02051);
const width20 = Math.round(Dimensions.get('window').width * 0.0533);
const width16 = Math.round(Dimensions.get('window').width * 0.04266);
const width36 = Math.round(Dimensions.get('window').width * 0.096);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkBlue2,
    marginTop: Math.round(Dimensions.get('window').height * 0.035),
    paddingBottom: Math.round(Dimensions.get('window').height * 0.035),
    width: '100%',
    height: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    marginTop: Math.round(Dimensions.get('window').height * 0.0269),
    paddingHorizontal: width28,
  },
  filterText: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  selectedText: {
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
    color: Colors.white,
    alignSelf: 'center',
    marginBottom: height5,
    marginRight: width20 / 2,
  },
  downArrow: {
    width: Math.round(Dimensions.get('window').width * 0.0416),
    height: Math.round(Dimensions.get('window').height * 0.0192),
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: height5,
  },
  noNotes: {
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
    marginTop: height16,
    textAlign: 'center',
    color: Colors.white,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: width16,
    marginTop: height16,
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
  templateIcon: {
    width: Math.round(Dimensions.get('window').width * 0.033),
    height: Math.round(Dimensions.get('window').height * 0.01),
    resizeMode: 'contain',
    alignSelf: 'flex-start',
    marginBottom: height5,
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
    fontSize: width36,
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
  notesList: {
    width: Math.round(Dimensions.get('window').width),
    backgroundColor: Colors.white,
  },
  notesContainer: {
    width: Math.round(Dimensions.get('window').width),
    backgroundColor: Colors.white,
  }
});

export default Layout1;
