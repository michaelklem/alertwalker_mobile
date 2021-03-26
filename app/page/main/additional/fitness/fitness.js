import React, { Component } from 'react';
import {  Alert,
          Dimensions,
          StyleSheet,
          Text,
          TouchableOpacity,
          View } from 'react-native';
import Swipeout from 'react-native-swipeout';
import Icon from "react-native-vector-icons/MaterialIcons";

import { DataManager, HeaderManager } from '../../../../manager';
import { AddFitnessLogCommand, DeleteFitnessLogCommand, LoadFitnessLogsCommand } from '../../../../command/fitness';
import ApiRequest from '../../../../helper/ApiRequest';
import { AppText, Colors } from '../../../../constant';
import Layout1 from './layout-1';
import { formatDateOnly, formatAMPM } from '../../../../helper/datetime';

export default class Fitness extends Component
{
  // MARK: - Data fields
  _isMounted = false;
  _headerMgr = null;
  _dataMgr = null;
  _baseFitnessLog =
  {
    monday:
    {
      date: '',
      comments: '',
      time: '',
      distance: 0,
    },
    tuesday:
    {
      date: '',
      comments: '',
      time: '',
      distance: 0,
    },
    wednesday:
    {
      date: '',
      comments: '',
      time: '',
      distance: 0,
    },
    thursday:
    {
      date: '',
      comments: '',
      time: '',
      distance: 0,
    }
    ,friday:
    {
      date: '',
      comments: '',
      time: '',
      distance: 0,
    }
    ,saturday:
    {
      date: '',
      comments: '',
      time: '',
      distance: 0,
    }
    ,sunday:
    {
      date: '',
      comments: '',
      time: '',
      distance: 0,
    }
  };

  // MARK: - Constructor
  constructor(props)
  {
    console.log('Fitness()');
    super(props);
    this.state =
    {
      isLoading: false,
      isRefreshing: false,
      fitnessLog: null,
      dataVersion: 0,
      sortBy: 1,
      sortMenu:
      {
        isOpen: false,
        selectedIndex: 0,
        options:
        [
          { title: 'Old logs', sortBy: 1 },
          { title: 'Recent logs', sortBy: -1 }
        ]
      },
    };

    this._headerMgr = HeaderManager.GetInstance();
    this._dataMgr = DataManager.GetInstance();

    // On focus check if we should be creating
    props.navigation.addListener('focus', () =>
    {
      console.log("Fitness.focus()");

      // Hide top right icon if editing fitness log already
      if(this.state.fitnessLog)
      {
        this._headerMgr.hide('right');
      }
    });
    props.navigation.addListener('blur', async () =>
    {
      console.log('Fitness.blur()');
      await this.saveData();
      this._headerMgr.show('right');
    });

    this._headerMgr.addListener('fitness', this.onHeaderBtnPressed);
  }

  async componentDidMount()
  {
    await this.loadData();
    this._isMounted = true;
  }

  // MARK: - APIs
  loadData = async(isRefreshing) =>
  {
    console.log('Fitness.loadData()');
    return await this._dataMgr.execute(await new LoadFitnessLogsCommand(
    {
      updateMasterState: (state) => this.setState(state),
      dataVersion: this.state.dataVersion,
      isRefreshing: isRefreshing,
      sortBy: this.state.sortBy
    }));
  }

  saveData = async () =>
  {
    console.log('Fitness.saveData()');
    if(this.state.fitnessLog)
    {
      this.setState({ isLoading: true });
      try
      {
        let response = await ApiRequest.sendRequest("post", {fitnessLog: this.state.fitnessLog}, "fitness/save");
        console.log(response.data);
        // Success
        if(response.data.error !== null)
        {
          this.setState({ isLoading: false });
          this.props.showAlert('Error', response.data.error);
          return;
        }

        const data = await this._dataMgr.execute(await new AddFitnessLogCommand({
          updateMasterState: (state) => this.setState(state),
          showAlert: this.props.showAlert,
          log: response.data.results,
          dataVersion: this.state.dataVersion,
        }));

        this.setState({
          isLoading: false,
          fitnessLog: null,
        });
      }
      catch(err)
      {
        console.log("saving fitness data error")
        console.log(err);
        this.setState({ isLoading: false });
        this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
      }
    }
  }

  /**
    Delete a log
    @param {String}  id   ID of the log to delete
  */
  delete = async(id) =>
  {
    const data = await this._dataMgr.execute(await new DeleteFitnessLogCommand({
      updateMasterState: (state) => this.setState(state),
      id: id,
      dataVersion: this.state.dataVersion
    }));

    this.setState({ fitnessLog: null });
  }

  // MARK: - Header delegates
  onHeaderBtnPressed = async() =>
  {
    const data = await this._dataMgr.execute(await new AddFitnessLogCommand({
      updateMasterState: (state) => this.setState(state),
      showAlert: this.props.showAlert,
      log: null,
      dataVersion: this.state.dataVersion,
    }));

    this.setState({ fitnessLog: data.fitnessLogs[data.fitnessLogs.length - 1] });
  }

  // MARK: - Render
  shouldComponentUpdate(nextProps, nextState)
  {
    return (nextProps.user !== this.props.user ||
            nextState.isLoading !== this.state.isLoading ||
            nextState.fitnessLog !== this.state.fitnessLog ||
            nextState.dataVersion !== this.state.dataVersion ||
            nextState.sortMenu.isOpen !== this.state.sortMenu.isOpen

    );
  }

  renderLog = (log, index) =>
  {
    const swipeBtns = [
      {
        text: 'Edit',
        backgroundColor: Colors.notesPage.title,
        onPress: () =>
        {
          this.setState({ fitnessLog: {...log.item} });
          this._headerMgr.hide('right');
        }
      },
      {
        text: 'Delete',
        backgroundColor: Colors.notesPage.title,
        onPress: () =>
        {
          Alert.alert('Confirm',
                      'Are you sure you want to delete this log?',
                      [ { text: 'Yes', onPress: () => this.delete(log.item._id.toString()) }, { text: 'No', onPress: () => console.log('Not deleted') } ],
                      {cancelable: false});
        }
      },
    ];
    return (
      <Swipeout
        style={{backgroundColor: Colors.transparent}}
        right={swipeBtns}
        autoClose={true}
        key={`note-container-swipe-${index}`}
      >
        <TouchableOpacity
          key={`note-container-view-${index}`}
          style={styles.note}
          onPress={() =>
          {
            this._headerMgr.hide('right');
            this.setState({ fitnessLog: {...log.item} });
          }}
        >
          <View style={{justifyContent: 'flex-start', flexDirection: 'row', width: '90%', alignItems: 'center', height: '100%'}}>
            <View style={{flexDirection: 'column'}, {justifyContent: 'center'}}>
              <Text
                key={`note-container-text-${index}`}
                style={styles.title}
                numberOfLines={3}
                adjustsFontSizeToFit={true}
              >{log.item.title}</Text>
              <Text
                key={`note-container-date-${index}`}
                style={styles.date}
                numberOfLines={3}
                adjustsFontSizeToFit={true}
              >{`${formatDateOnly(log.item.createdOn)} ${formatAMPM(log.item.createdOn)}`}</Text>
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
        </TouchableOpacity>
      </Swipeout>
    );
  }

  render()
  {
    console.log('Fitness.render()');
    const data = this._dataMgr.getData('fitness');
    return (
      <Layout1
        isRefreshing={this.state.isRefreshing}
        isLoading={this.state.isLoading}
        fitnessLog={this.state.fitnessLog}
        fitnessLogs={data.fitnessLogs}
        updateMasterState={(state) => this.setState(state)}
        renderLog={this.renderLog}
        refresh={() => this.loadData(true)}
        sortMenu={this.state.sortMenu}
        schemaFields={data.schemaFields}
        headerMgr={this._headerMgr}
        save={this.saveData}
      />
    );
  }
};

const height14 = Math.round(Dimensions.get('window').height * 0.01794);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const width16 = Math.round(Dimensions.get('window').width * 0.04266);
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
  }
});
