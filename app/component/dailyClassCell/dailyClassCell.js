import React, { Component } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  StatusBar,
  Alert,
  ScrollView,
  Dimensions,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import { MyButton } from '../component/myButton';
import { Colors, DateTime, Styles } from '../constant';

Date.prototype.addMinutes = function(h)
{
  this.setTime(this.getTime() + (h*60*1000));
  return this;
}

function getClassTime(datetime, length)
{
  var d = new Date(datetime)
  var start = formatHoursAndMinutes(d);

  var endDate = new Date(datetime);
  endDate.addMinutes(length);
  var end = formatHoursAndMinutes(endDate);

  return (start);
}

function formatHoursAndMinutes(d)
{
  var h = d.getHours();
  var m = d.getMinutes();
  var s = d.getSeconds();
  var abr = (h >= 12) ? "PM" : "AM";

  h = (h >= 12) ? (h - 12) : h;
  h = (h == 0) ? 12 : h;

  return `${h}`.padStart(2, '0') + ":" + `${m}`.padStart(2, '0') + " " + abr;
}

/**
  Props:
      - schedule
      - selected
      - onSelect
*/
export default class DailyClassCell extends Component
{
  constructor(props)
  {
    super(props);
  }

  render()
  {
    let datetime = new Date(this.props.source === 'all' ? this.props.schedule.time : this.props.schedule.pClass.time);
    let instructorName = (this.props.source === 'all' ? this.props.schedule.instructor.name : this.props.schedule.instructor.name);
    let timeLbl = (this.props.source === 'all' ? getClassTime(datetime, this.props.schedule.length)
                                               : getClassTime(datetime, this.props.schedule.pClass.length));
    return (
      <TouchableOpacity
        onPress={() => this.props.onSelect(this.props.schedule._id)}
        style={[styles.myClassCell, { backgroundColor: Colors.transparent }]}
      >
      <View style={styles.timeContainer}>
        <Text style={styles.timeLbl}>{timeLbl}</Text>
      </View>
      <View style={styles.textHolder}>
        <Text style={styles.instructorLbl}>{instructorName}</Text>
      </View>
      </TouchableOpacity>
    );
  }
}


const styles = StyleSheet.create({
  myClassCell: {
    height: 60,
    marginTop: 20,
    flexDirection: 'row',
  },
  instructorLbl: {
    fontFamily: 'Arial',
    fontSize: 18,
    color: Colors.instructorBlack,
    textAlign:'justify',
  },
  timeLbl: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: Colors.white,
    textAlign:'justify',
  },
  timeContainer: {
    backgroundColor: Colors.dayCellGray,
    borderRadius: 5,
    alignSelf: 'center',
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  textHolder: {
    marginLeft: 15,
    alignContent: 'center',
    alignSelf: 'center',
  },
});
