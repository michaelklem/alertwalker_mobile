import React, { Component } from 'react';
import {
  View,
  Button,
  Text,
  TextInput,
  Animated,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import Colors from '../constant/Colors';
import Styles from '../constant/Styles';
import DateTime from '../constant/DateTime';

export default class DayMenu extends Component
{
  _menuData = null;
  _days = [];
  _dayOfWeek = [];
  _scrollView = null;

  constructor(props)
  {
    console.log('DayMenu()');
    super(props);

    this.state =
    {
      forceRender: false
    };

    this._scrollView = React.createRef();

    this.populateDays(props.days, props.startDate);
  }

  populateDays = (days, startDate) =>
  {
    this._days = [];
    this._dayOfWeek = [];
    var date = startDate;
    for(var i = 1; i <= days; i++)
    {
      this._days.push(i);
      this._dayOfWeek.push(DateTime.DAY_OF_WEEK_SHORT[date.getDay()]);
      date.setDate(date.getDate() + 1);
    }
  }

  onClick = (key) =>
  {
    this.props.onClick(key);
    this.setState({ selected: key });
  }

  shouldComponentUpdate(nextProps, nextState)
  {
    if(nextProps.days != this.props.days || nextProps.startDate != this.props.startDate)
    {
      this.populateDays(nextProps.days, nextProps.startDate);
      return true;
    }

    var update = false;
    if(this.state.forceRender !== nextState.forceRender && nextState.forceRender)
    {
      this.setState({forceRender: false});
      update = true;
    }
    return (this.props.selected !== nextProps.selected ||
              update);
  }

  offset = () =>
  {
    for(var i = 0; i < this._days.length; i++)
    {
      if(this._days[i] === this.props.selected)
      {
        console.log("Scrolling to: " + (i * 45));
        this._scrollView.current.scrollTo({x: i * 45, y: 0});
        this.setState({ forceRender: true });
        return;
      }
    }
  }



  render()
  {
    console.log('DayMenu.render()');

    return (
      <ScrollView style={styles.container} horizontal={true} ref={this._scrollView}>
        {this._days.map( (day, i) =>
        {
          return <TouchableOpacity
                    onPress={() => this.onClick(day)}
                    key={day}
                    style={[styles.cellContainer, this.props.selected === day ? styles.activeDay : '' ]}
                  >
                    <Text style={[styles.month, this.props.selected === day ? Styles.activeTabBarBtn : Styles.inactiveTabBarBtn ]}>{this._dayOfWeek[i]}</Text>
                    <Text style={[styles.text, this.props.selected === day ? Styles.activeTabBarBtn : Styles.inactiveTabBarBtn ]}>{day}</Text>
                  </TouchableOpacity>
        })}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  cellContainer: {
    width: 45,
  },
  container: {
    marginTop: 10,
    marginBottom: 20,
  },
  text: {
    fontFamily: 'Arial',
    color: Colors.almostBlack,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  month: {
    fontFamily: 'Arial',
    color: Colors.almostBlack,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 11,
    marginTop: 10,
  },
  activeDay: {
    borderColor: Colors.almostBlack,
    borderRadius: 20,
    borderWidth: 1,
  },
})
