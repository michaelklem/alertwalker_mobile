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
import { ImageButton } from '../component/imageButton';
import { Colors, DateTime, Styles } from '../constant';
import LinearGradient from 'react-native-linear-gradient';

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

  return (start + " - " + end);
}

function formatHoursAndMinutes(d)
{
  var h = d.getHours();
  var m = d.getMinutes();
  var s = d.getSeconds();
  var abr = (h >= 12) ? "pm" : "am";

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
export default class MyClasses extends Component
{
  constructor(props)
  {
    super(props);
  }

  render()
  {
    let datetime = new Date(this.props.source === 'all' ?
                    this.props.schedule.time :
                    this.props.schedule.pClass.time);

    let instructorName = (this.props.source === 'all' ?
                          this.props.schedule.instructor.name :
                            this.props.schedule.instructor.name);
    let timeLbl = (this.props.source === 'all' ? getClassTime(datetime, this.props.schedule.length)
                                               : getClassTime(datetime, this.props.schedule.pClass.length));


    var bgColorStyle = DateTime.getColorFromDate(datetime);

    var positionSuffix = "";
    if(this.props.position)
    {
      //console.log(this.props.position.toString().charAt(this.props.position.length - 1));
      switch(this.props.position.toString().charAt(this.props.position.length - 1))
      {
        case "1":
        positionSuffix = "st";
        break;
        case "2":
        positionSuffix = "nd";
        break;
        case "3":
        positionSuffix = "rd";
        break;
        default:
        positionSuffix = "th";
        break;
      }
    }

    return (
      <TouchableOpacity
        onPress={() => this.props.onSelect(this.props.schedule._id)}
        style={[styles.myClassCell, { backgroundColor: Colors.transparent }]}
      >
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        colors={bgColorStyle}
        style={[styles.dayOfMonth]}
      >
        <Text style={styles.monthLbl}>{DateTime.MONTH_NAMES_SHORT[datetime.getMonth()]}</Text>
        <Text style={styles.dayLbl}>{datetime.getDate()}</Text>
      </LinearGradient>
      <View style={styles.textHolder}>
        <Text style={styles.instructorLbl}>{instructorName}</Text>
        <Text style={styles.timeLbl}>{timeLbl}</Text>
      </View>
      {this.props.source === 'waitlist' &&
      <View style={styles.position}>
        <Text style={styles.positionText}>{this.props.position + positionSuffix}</Text>
      </View>}
      </TouchableOpacity>
    );
  }
}


const styles = StyleSheet.create({
  dayOfMonth: {
    width: 60,
    height: 60,
    borderRadius: 13,
  },
  myClassCell: {
    height: 60,
    marginTop: 20,
    flexDirection: 'row',
  },
  monthLbl: {
    fontFamily: 'Arial',
    fontSize: 17,
    color: Colors.white,
    textAlign: 'center',
    paddingTop: 4,
  },
  dayLbl: {
    fontFamily: 'Arial',
    fontSize: 24,
    color: Colors.white,
    textAlign: 'center',
    paddingTop: 1,
  },
  instructorLbl: {
    fontFamily: 'Arial',
    fontSize: 18,
    color: Colors.instructorBlack,
    textAlign:'justify',
    paddingTop: 10,
  },
  timeLbl: {
    fontFamily: 'Arial',
    fontSize: 14,
    color: Colors.placeholderTextColor,
    textAlign:'justify',
    paddingTop: 1,
  },
  textHolder: {
    marginLeft: 15,
  },
  position: {
    alignSelf: 'flex-end',
    position: 'absolute',
    right:  0,
    top: '25%',
    backgroundColor: Colors.white,
    width: 30,
    height: 30,
    borderRadius: 100/2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,

    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowColor: '#000000',
    shadowOffset: { height: 3, width: 0 },
  },
  positionText: {
    textAlign: 'center',
  },
});
