import React, { Component } from 'react';
import {  Dimensions,
          TouchableOpacity,
          Platform,
          Linking,
          SafeAreaView,
          StyleSheet,
          Text,
          View } from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import Icon from "react-native-vector-icons/MaterialIcons";

import { ImageButton } from '../../../component/imageButton';

import Layout1 from './layout-1';
import { AppManager, DataManager } from '../../../manager';
import { Colors, Images, Styles } from '../../../constant';
import ApiRequest from '../../../helper/ApiRequest';
import { formatDateOnly, formatAMPM } from '../../../helper/datetime';

export default class Search extends Component
{
  _layout = 1;
  _isMounted = false;
  _dataMgr = null;

  constructor(props)
  {
    console.log('Search()');
    super(props);
    this.state =
    {
      results: [],
      isLoading: false,
      searchText: '',
      menu:
      {
        isOpen: false,
        showTopLeftIcon: false,
        selectedIndex: 0,
        options:
        [
          { title: 'Content in notes', filters: ['notes.notes.html', 'notes.notes.title'] },
          { title: 'Event location', filters: ['calendar.calendarEvents.location'] },
          { title: 'Event name', filters: ['calendar.calendarEvents.title'] },
          { title: 'Social site', filters: ['instagramWidget.feed.message', 'facebookWidget.feed.message'] },
        ]
      }
    };

    this._dataMgr = DataManager.GetInstance();
  }

  async componentDidMount()
  {
    this._isMounted = true;
    this.updateSearchText('');
  }

  openResult = (result) =>
  {
    console.log(result);
  }

  updateSearchText = (searchText) =>
  {
    // Get filters for selected category
    let filteredResults = [];
    let tempResults = [];
    let filters = this.state.menu.options[this.state.menu.selectedIndex].filters;

    // Local variables
    let filter = null;
    let firstPeriod = null;
    let set = null;
    let secondPeriod = null;
    let field = null;
    let subfield = null;

    // Iterate filters and search data set
    for(let i = 0; i < filters.length; i++)
    {
      filter = filters[i];
      firstPeriod = filter.indexOf('.');
      set = filter.substr(0, firstPeriod);
      secondPeriod = filter.indexOf('.', firstPeriod + 1);
      field = filter.substr(firstPeriod + 1, secondPeriod - firstPeriod - 1);
      subfield = filter.substr(secondPeriod + 1);

      tempResults = this._dataMgr.searchDataSet({
        set: set,
        field: field,
        subfield: subfield,
        searchText: searchText
      });

      let found = false;
      for(let i = 0; i < tempResults.length; i++)
      {
        found = false;
        for(let j = 0; j < filteredResults.length; j++)
        {
          if(filteredResults[j]._id.toString() === tempResults[i]._id.toString())
          {
            found = true;
            break;
          }
        }
        if(!found)
        {
          filteredResults.push(tempResults[i]);
        }
      }
    }

    this.setState({ results: filteredResults, searchText: searchText });
  }

  renderResult = (result, index) =>
  {
    //console.log(result);

    switch(this.state.menu.selectedIndex)
    {
      case 0:
        return this.renderNote(result.item, index);
      case 1:
        return this.renderCalendarEvent(result.item, index);
      case 2:
        return this.renderCalendarEvent(result.item, index);
      case 3:
        return this.renderSocialPost(result.item, index);
      default:
        throw new Error('Unknown search category selected');
    }
  }

  renderCalendarEvent = (calendarEvent, index) =>
  {
    return (
      <TouchableOpacity
        key={`search-container-view-${index}`}
        style={styles.note}
        onPress={async() =>
        {
          this.props.navigation.navigate('calendar', { _id: calendarEvent._id.toString() });
        }}
      >
        <View style={{justifyContent: 'flex-start', flexDirection: 'column', width: '90%', height: '100%'}}>
          <View style={{justifyContent: 'flex-start', flexDirection: 'row', width: '90%', height: '40%'}}>
            <Text
              key={`calendar-event-container-text-${index}`}
              style={styles.calendarTitle}
              numberOfLines={2}
              adjustsFontSizeToFit={true}
            >{calendarEvent.title}</Text>
            <Text
              key={`calendar-event-container-location-${index}`}
              style={styles.calendarLocation}
              numberOfLines={2}
              adjustsFontSizeToFit={true}
            >{calendarEvent.location}</Text>
          </View>

          <View style={{justifyContent: 'flex-start', flexDirection: 'row', width: '90%', height: '30%' }}>
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

          <View style={{justifyContent: 'flex-start', width: '90%', height: '30%' }}>
            <Text
              key={`note-container-date-${index}`}
              style={styles.date}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >{`${formatDateOnly(calendarEvent.startOn)}`}</Text>
          </View>
        </View>
      </TouchableOpacity>
      );
  }

  renderNote = (note, index) =>
  {
    return (
      <TouchableOpacity
        key={`search-container-view-${index}`}
        style={styles.note}
        onPress={async() =>
        {
          this.props.navigation.navigate('notes', { _id: note._id.toString() });
        }}
      >
        <View style={{justifyContent: 'flex-start', flexDirection: 'row', width: '90%', height: '100%', alignItems: 'center'}}>
          <ImageButton
            key={`note-container-img-${index}`}
            imgSrc={this.props.user && this.props.user.photo ? {uri: this.props.user?.photo ?? '', cache: 'force-cache'} : Images.noPhoto}
            imageStyle={styles.userPhotoImg}
          />
          <View style={{flexDirection: 'column'}, {justifyContent: 'center'}}>
            <Text
              key={`note-container-text-${index}`}
              style={styles.title}
              numberOfLines={3}
              adjustsFontSizeToFit={true}
            >{note.title}</Text>
            <Text
              key={`note-container-date-${index}`}
              style={styles.date}
              numberOfLines={3}
              adjustsFontSizeToFit={true}
            >{`${formatDateOnly(note.createdOn)} ${formatAMPM(note.createdOn)}`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  renderSocialPost = (post, index) =>
  {
    return (
      <TouchableOpacity
        onPress={async() =>
        {
          let url = AppManager.GetInstance().getThirdPartyAccount(post.source.toLowerCase()).url;
          const isSupported = await Linking.canOpenURL(url);
          if(isSupported)
          {
            await Linking.openURL(url);
          }
        }}
        style={styles.note}
      >
        <View style={{justifyContent: 'flex-start', flexDirection: 'row', width: '90%', height: '100%'}}>
          <ImageButton
            key={`note-container-img-${index}`}
            imgSrc={this.props.user && this.props.user.photo ? {uri: this.props.user?.photo ?? '', cache: 'force-cache'} : Images.noPhoto}
            imageStyle={styles.userPhotoImg}
          />
          <View style={{flexDirection: 'column'}, {justifyContent: 'center'}}>
            <Text
              key={`note-container-text-${index}`}
              style={styles.socialPostTitle}
              numberOfLines={2}
              ellipsizeMode={'tail'}
            >{post.message}</Text>
            <Text
              key={`note-container-date-${index}`}
              style={[styles.date, {height: '30%'}]}
              numberOfLines={3}
              adjustsFontSizeToFit={true}
            >{`${formatDateOnly(post.date)} ${formatAMPM(post.date)}`}</Text>
            <Text
              key={`note-container-date-${index}`}
              style={[styles[post.source + 'Source'], {height: '30%'}]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >{`${post.source}`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }


  shouldComponentUpdate(nextProps, nextState)
  {
    return (
      this.state.menu.selectedIndex !== nextState.menu.selectedIndex ||
      this.state.menu.isOpen !== nextState.menu.isOpen ||
      this.state.results !== nextState.results ||
      this.state.isLoading !== nextState.isLoading ||
      this.state.searchText !== nextState.searchText
    );
  }

  componentDidUpdate(prevProps, prevState)
  {
    if(this.state.menu.selectedIndex !== prevState.menu.selectedIndex)
    {
      // Search
      this.updateSearchText(this.state.searchText);
    }
  }

  render()
  {
    console.log('Search.render()');
    return (
    <>
      {this._layout === 1 &&
        <Layout1
          isLoading={this.state.isLoading}
          menu={this.state.menu}
          results={this.state.results}
          user={this.props.user}
          updateMasterState={(state) => this.setState(state)}
          showAlert={this.props.showAlert}
          renderResult={(item, index) => this.renderResult(item, index)}
          updateSearchText={this.updateSearchText}
          searchText={this.state.searchText}
        />}
      </>
    );
  }
}
const height5 = Math.round(Dimensions.get('window').height * 0.00641);
const height11 = Math.round(Dimensions.get('window').height * 0.0141);
const height14 = Math.round(Dimensions.get('window').height * 0.01794);
const height15 = Math.round(Dimensions.get('window').height * 0.01923);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height20 = Math.round(Dimensions.get('window').height * 0.0256);
const height30 = Math.round(Dimensions.get('window').height * 0.0384);
const width16 = Math.round(Dimensions.get('window').width * 0.04266);
const width30 = Math.round(Dimensions.get('window').width * 0.08);
const width20 = Math.round(Dimensions.get('window').width * 0.0533);

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
    width: Math.round(Dimensions.get('window').width * 0.12),
    height: Math.round(Dimensions.get('window').width * 0.12),
    borderRadius: Math.round(Dimensions.get('window').width * 0.12) / 2,
    resizeMode: 'cover',
    backgroundColor: Colors.black,
    borderColor: Colors.black,
    borderWidth: 1,
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
    width: '100%',
    height: '50%',
    marginLeft: width16,
    color: Colors.notesPage.noteTitle,
  },
  socialPostTitle: {
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
    width: Math.round(Dimensions.get('window').width * 0.7),
    height: '50%',
    marginLeft: width16,
    color: Colors.notesPage.noteTitle,
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
  },
  calendarTitle: {
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
  calendarLocation: {
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

  FacebookSource: {
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
    color: Colors.lightBlue1,
  },
  InstagramSource: {
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
    color: Colors.maroon,
  },
});
