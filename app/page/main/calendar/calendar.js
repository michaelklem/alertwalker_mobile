import React, { Component } from 'react';
import {  Dimensions,
          Platform,
          SafeAreaView,
          StyleSheet,
          Text,
          View } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import Swipeout from 'react-native-swipeout';
import Icon from "react-native-vector-icons/MaterialIcons";

import { ImageButton } from '../../../component/imageButton';
import { AppManager, DataManager, HeaderManager } from '../../../manager';
import {  AddCalendarEventCommand,
          DeleteCalendarEventCommand,
          LoadCalendarEventsCommand,
          UpdateCalendarEventCommand,
          UpsertCalendarEventCommand
} from '../../../command/calendar';

import Layout1 from './layout-1';
import { Colors, Images, Styles } from '../../../constant';
import ApiRequest from '../../../helper/ApiRequest';
import { formatDateOnly, formatAMPM } from '../../../helper/datetime';

export default class Calendar extends Component
{
  _layout = 1;
  _isMounted = false;
  _manager = null;
  _headerMgr = null;
  _dataMgr = null;
  _scrollView = React.createRef();
  _actionList = null;

  constructor(props)
  {
    console.log('Calendar()');
    super(props);

    let today = new Date();
    let state =
    {
      dynamicLoad: false,
      isLoading: false,
      isRefreshing: false,
      isCreating: false,
      isViewing: false,
      selectedDate:
      {
        year: today.getFullYear(),
        month: (parseInt(today.getMonth()) + 1),
        day: today.getDate(),
        timestamp: today.getTime(),
        dayString: today.getFullYear() + '-' + (parseInt(today.getMonth()) + 1) + '-' + today.getDate(),
        dateString: today.getFullYear() + '-' + (parseInt(today.getMonth()) + 1) + '-' + today.getDate()
      },
      calendarEvent:
      {
        source: 'aspire',
        calendarId: '',
        externalId: '',
        title: '',
        description: '',
        location: '',
        startOn: '',
        endOn: '',
        type: 'task',
        url: '',
        note: null
      },
      menu:
      {
        isOpen: false,
        selectedIndex: 0,
        options:
        [
          { title: 'New entries', sortBy: 1 },
          { title: 'Old entries', sortBy: -1 }
        ]
      },
      noteMenu:
      {
        isOpen: false,
        selectedIndex: -1,
        options: []
      },
      dataVersion: 0,
    };

    this._manager = AppManager.GetInstance();
    this.state = state;

    this._dataMgr = DataManager.GetInstance();

    this._headerMgr = HeaderManager.GetInstance();

    // On focus check if we should be creating
    props.navigation.addListener('focus', () =>
    {
      console.log("Calendar.focus()");
      console.log(this.props);

      // If coming from notes page we need to update the PDF's the pdf editor will display 
      this._actionList.current.reloadPdfEditor();

      if(this.props.route.params && this.props.route.params.create)
      {
        this.setState({ isCreating: true });
        this.props.navigation.setParams({ create: false });
        this._headerMgr.hide('right');
      }
      else if(this.props.route.params && this.props.route.params._id)
      {
        if(this._dataMgr.getData('calendar').calendarEvents)
        {
          this.openCalendarEvent(this.props.route.params._id);
          this._headerMgr.hide('right');
        }
      }
      else
      {
        // Hide header btn if coming back in and already in create mode
        if(this.state.isCreating)
        {
          this._headerMgr.hide('right');
        }
      }
    });

    // Before leaving the page, tell header manager to show top right icon
    props.navigation.addListener('blur', async () =>
    {
      this._headerMgr.show('right');
    });

    this._headerMgr.addListener('calendar', this.onHeaderBtnPressed);

    this._actionList = React.createRef();
  }

  async componentDidMount()
  {
    this._isMounted = true;

    // Only load data if not already cached
    let data = this._dataMgr.getData('calendar');
    console.log(data);
    if(!data || !data.calendarEvents || data.calendarEvents.length === 0)
    {
      await this.loadData();
    }
    else
    {
      this.setNoteMenu();
    }
  }

  componentWillUnmount()
  {
    HeaderManager.GetInstance().removeListener('calendar');
  }

  /*onGoBack = () =>
  {
    console.log("Refreshing onGoBack");
    if(this._isMounted !== true)
    {
      this._isMounted = true;
    }
    else
    {
      this.loadData();
    }
  }*/


  // MARK: - API
  loadData = async (sortBy = 1) =>
  {
    console.log('Calendar.loadData()');
    this.setState({ isLoading: true });
    try
    {
      const data = await this._dataMgr.execute(await new LoadCalendarEventsCommand(
        (state) => this.setState(state),
        {
          sortBy: sortBy
        },
        this.state.dataVersion
      ));
      this.setNoteMenu();
    }
    catch(err)
    {
      console.log(err);
      this.setState({ isLoading: false });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  }

  saveData = async () =>
  {
    console.log('Calendar.saveData()');
    this.setState({ isLoading: true });
    try
    {
      const params = {...this.state.calendarEvent};
      delete params.createdBy;
      delete params.isDeleted;
      if(params._id)
      {
        params.id = params._id;
        //delete params._id;
      }

      let startOn = new Date(this.state.selectedDate.timestamp);
      console.log('Selected date: ' + JSON.stringify(this.state.selectedDate));
      let minutes = params.startOn.substr(params.startOn.indexOf(':') + 1);
      let hours = params.startOn.substr(0, params.startOn.indexOf(':'));
      startOn.setHours(hours);
      startOn.setMinutes(minutes);
      startOn.setDate(this.state.selectedDate.day);
      //console.log(hours + ':' + minutes);
      params.startOn = startOn;

      //console.log(startOn);

      let endOn = new Date(this.state.selectedDate.timestamp);
      minutes = params.endOn.substr(params.endOn.indexOf(':') + 1);
      hours = params.endOn.substr(0, params.endOn.indexOf(':'));
      endOn.setHours(hours);
      endOn.setMinutes(minutes);
      endOn.setDate(this.state.selectedDate.day);
      params.endOn = endOn;

      //console.log(params);
      let response = await ApiRequest.sendRequest("post", params, "calendar/event");
      //console.log(response.data);

      this._headerMgr.show('right');

      // Success
      if(response.data.error === null)
      {
        let data = await this._dataMgr.execute(await new UpsertCalendarEventCommand(response.data.results, params.id));

        let calendarEvent =
        {
          source: 'aspire',
          calendarId: '',
          externalId: '',
          title: '',
          description: '',
          location: '',
          startOn: '',
          endOn: '',
          type: 'task',
          url: '',
          note: null
        };

        this.setState(
        {
          isLoading: false,
          calendarEvent: calendarEvent,
          isCreating: false,
        });
      }
      else
      {
        this.setState({ isLoading: false });
        this.props.showAlert('Error', response.data.error.toString());
      }
    }
    catch(err)
    {
      console.log(err);
      this.setState({ isLoading: false });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  }

  /**
    Delete a calendarEvent
    @param {String}  id   ID of the calendarEvent to delete
  */
  deleteCalendarEvent = async(id) =>
  {
    const data = await this._dataMgr.execute(await new DeleteCalendarEventCommand(
      (state) => this.setState(state),
      id,
      this.state.dataVersion
    ));

    this.setState(
    {
      calendarEvent:
      {
        source: 'aspire',
        calendarId: '',
        externalId: '',
        title: '',
        description: '',
        location: '',
        startOn: '',
        endOn: '',
        type: 'task',
        url: '',
        note: null
      },
      isCreating: false,
    });
  }

  onHeaderBtnPressed = async() =>
  {
    console.log(this.state.selectedDate);
    this.setState({ isCreating: true });
    this._headerMgr.hide('right');
  }

  openCalendarEvent = (calendarEventId) =>
  {
    const calendarEvents = this._dataMgr.getData('calendar').calendarEvents;
    if(calendarEvents.length > 0)
    {
      for(let i = 0; i < calendarEvents.length; i++)
      {
        if(calendarEvents[i]._id.toString() === calendarEventId)
        {
          let calendarEvt = {...calendarEvents[i]};
          calendarEvt.startOn = new Date(calendarEvt.startOn);
          calendarEvt.endOn = new Date(calendarEvt.endOn);

          const noteMenu = {...this.state.noteMenu};
          // Select note
          if(calendarEvt.note)
          {
            for(let i = 0; i < this.state.noteMenu.options.length; i++)
            {
              if(this.state.noteMenu.options[i]._id.toString() === calendarEvt.note.toString())
              {
                noteMenu.selectedIndex = i;
                break;
              }
            }
          }

          let date = new Date(calendarEvt.startOn);
          console.log(date);
          let selectedDate =
          {
            year: date.getFullYear(),
            month: (parseInt(date.getMonth()) + 1),
            day: date.getDate(),
            timestamp: date.getTime() /*- (60000 * 60 * 24)*/,
            dayString: date.getFullYear() + '-' + (parseInt(date.getMonth()) + 1) + '-' + date.getDate(),
            dateString: date.getFullYear() + '-' + (parseInt(date.getMonth()) + 1) + '-' + date.getDate()
          };
          console.log(selectedDate);

          calendarEvt.startOn = ('0' + calendarEvt.startOn.getHours()).slice(-2) + ':' + ('0' + calendarEvt.startOn.getMinutes()).slice(-2);
          calendarEvt.endOn = ('0' + calendarEvt.endOn.getHours()).slice(-2) + ':' + ('0' + calendarEvt.endOn.getMinutes()).slice(-2);

          this.setState({ calendarEvent: calendarEvt, isCreating: true, noteMenu: noteMenu, isViewing: true, selectedDate: selectedDate });
          break;
        }
      }

      this.props.navigation.setParams({ _id: '' });
      return;
    }
  }

  setNoteMenu = () =>
  {
    const noteData = this._dataMgr.getData('notes');
    let noteMenu = {...this.state.noteMenu};
    noteMenu.options = noteData.notes.map( (note, i) =>
    {
      return (
        {
          title: note.title,
          _id: note._id,
        }
      );
    });
    this.setState({ noteMenu: noteMenu });
  }

  renderCalendarEvent = (calendarEvent, index) =>
  {
    console.log(index);
    console.log(calendarEvent);
    const swipeBtns = [
      {
        text: 'Edit',
        backgroundColor: Colors.notesPage.title,
        onPress: () =>
        {
          console.log('Calendar.editOnPress()');
          let calendarEvt = {...calendarEvent};
          calendarEvt.startOn = new Date(calendarEvt.startOn);
          calendarEvt.endOn = new Date(calendarEvt.endOn);

          calendarEvt.startOn = ('0' + calendarEvt.startOn.getHours()).slice(-2) + ':' + ('0' + calendarEvt.startOn.getMinutes()).slice(-2);
          calendarEvt.endOn = ('0' + calendarEvt.endOn.getHours()).slice(-2) + ':' + ('0' + calendarEvt.endOn.getMinutes()).slice(-2);

          const noteMenu = {...this.state.noteMenu};
          // Select note
          if(calendarEvt.note)
          {
            for(let i = 0; i < this.state.noteMenu.options.length; i++)
            {
              if(this.state.noteMenu.options[i]._id.toString() === calendarEvt.note.toString())
              {
                noteMenu.selectedIndex = i;
                break;
              }
            }
          }

          this._headerMgr.hide('right');
          this.setState({ calendarEvent: calendarEvt, isCreating: true, noteMenu: noteMenu });
        }
      },
      {
        text: 'Delete',
        backgroundColor: 'red',
        onPress: () => this.deleteCalendarEvent(calendarEvent._id.toString())
      },
    ];

    if(calendarEvent.note)
    {
      swipeBtns.splice(0, 0, {
        text: 'View Note',
        backgroundColor: Colors.lightBlue1,
        onPress: () => this.props.navigation.navigate('notes', { _id: calendarEvent.note.toString() })
      })
    }

    return (
      <Swipeout
        style={{backgroundColor: Colors.transparent}}
        right={swipeBtns}
        autoClose={true}
        key={`calendar-event-container-swipe-${index}`}
      >
        <View
          key={`calendar-event-container-view-${index}`}
          style={styles.note}
        >

          <View style={{justifyContent: 'flex-start', flexDirection: 'column', width: '90%', height: '100%'}}>

            <View style={{justifyContent: 'flex-start', flexDirection: 'row', width: '90%', height: '50%'}}>
              <Text
                key={`calendar-event-container-text-${index}`}
                style={styles.title}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
              >{calendarEvent.title}</Text>
              <Text
                key={`calendar-event-container-location-${index}`}
                style={styles.location}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
              >{calendarEvent.location}</Text>
            </View>

            <View style={{justifyContent: 'flex-start', flexDirection: 'row', width: '90%', height: '50%' }}>
              <Text
                key={`calendar-event-container-starton-${index}`}
                style={styles.fromDate}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >{`FROM ${formatAMPM(calendarEvent.startOn)}`}</Text>
              <Text
                key={`calendar-event-container-endon-${index}`}
                style={styles.toDate}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >{`TO ${formatAMPM(calendarEvent.endOn)}`}</Text>
            </View>

          </View>

          <View style={styles.iconContainer}>
            <Icon
              name={'arrow-forward-ios'}
              size={Math.round(Dimensions.get('window').height * 0.04)}
              color={Colors.notesPage.noteTitle}
              style={styles.moreIcon}
            />
          </View>

        </View>
      </Swipeout>
    );
  }


  shouldComponentUpdate(nextProps, nextState)
  {
    return true;
  }

  componentDidUpdate(prevProps, prevState)
  {

  }

  render()
  {
    console.log('Calendar.render()');
    const data = this._dataMgr.getData('calendar');
    return (
    <>
      {this._layout === 1 &&
        <Layout1
          isLoading={this.state.isLoading}
          menu={this.state.menu}
          user={this.props.user}
          updateMasterState={(state) => this.setState(state)}
          showAlert={this.props.showAlert}
          isRefreshing={this.state.isRefreshing}
          refresh={this.loadData}
          isCreating={this.state.isCreating}
          isViewing={this.state.isViewing}
          calendarEvent={this.state.calendarEvent}
          calendarEvents={data.calendarEvents ? data.calendarEvents : []}
          dataStoreInitialized={data.calendarEvents ? true : false}
          renderCalendarEvents={() =>
          {
            if(!this.state.isViewing || !data.calendarEvents)
            {
              return [];
            }
            return data.calendarEvents.filter((calendarEvt) =>
            {
              let startOn = new Date(calendarEvt.startOn);
              return (startOn.getDate() === this.state.selectedDate.day &&
                      startOn.getMonth() + 1 === this.state.selectedDate.month &&
                      startOn.getFullYear() === this.state.selectedDate.year);
            }).map((calendarEvt, i) =>
            {
              return this.renderCalendarEvent(calendarEvt, i);
            });
          }}
          selectedDate={this.state.selectedDate}
          saveData={this.saveData}
          noteMenu={this.state.noteMenu}
          scrollViewRef={this._scrollView}
          headerManager={this._headerMgr}
          actionList={this._actionList}
        />}
      </>
    );
  }
}

const width20 = Math.round(Dimensions.get('window').width * 0.0533);
const width16 = Math.round(Dimensions.get('window').width * 0.04266);
const height14 = Math.round(Dimensions.get('window').height * 0.01794);
const height15 = Math.round(Dimensions.get('window').height * 0.01923);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);

const styles = StyleSheet.create({
  note: {
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.1),
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkBlue1,
    paddingHorizontal: width20,
    paddingVertical: Math.round(Dimensions.get('window').height * 0.0128),
    flexDirection: 'row'
  },
  userPhotoImg: {
    width: Math.round(Dimensions.get('window').width * 0.16),
    height: Math.round(Dimensions.get('window').width * 0.16),
    borderRadius: Math.round(Dimensions.get('window').width * 0.16) / 2,
    resizeMode: 'cover'
  },
  title: {
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
    width: '75%',
    height: '100%',
    marginLeft: width16,
    color: Colors.notesPage.noteTitle,
  },
  location: {
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
    width: '25%',
    height: '100%',
    marginLeft: width16,
    color: Colors.descriptionGray,
  },
  date: {
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
    textAlign: 'left',
    width: '100%',
    height: '50%',
    marginLeft: width16,
    color: Colors.notesPage.noteTitle,
    opacity: 0.2,
  },
  moreIcon: {
    opacity: 0.1,
    alignSelf: 'flex-end',
    justifyContent: 'flex-end'
  },
  iconContainer: {
    width: '10%',
    justifyContent: 'center',
    alignContent: 'flex-end',
    alignItems: 'flex-end',
  },
  fromDate: {
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
    textAlign: 'left',
    width: '50%',
    height: '100%',
    marginLeft: width16,
    color: Colors.lightBlue1
  },
  toDate: {
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
    textAlign: 'right',
    width: '50%',
    height: '100%',
    marginLeft: width16,
    color: Colors.maroon
  }
});
