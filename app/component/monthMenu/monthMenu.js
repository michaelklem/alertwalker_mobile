import React, { Component } from 'react';
import {
  View,
  Button,
  Text,
  TextInput,
  Animated,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

import Colors from '../constant/Colors';
import Styles from '../constant/Styles';

import rnTextSize, { TSFontSpecs } from 'react-native-text-size'


export default class MonthMenu extends Component
{
  _monthsOfYear = [ 'January',  'February',  'March',  'April',  'May',  'June',  'July',  'August',  'September',  'October',  'November',  'December' ];
  _sortedMonths = [];
  _menuData = null;
  _scrollView = null;
  _fontSpecs: TSFontSpecs =
  {
    fontFamily: 'Arial',
    fontSize: 28
  };

  constructor(props)
  {
    console.log('MonthMenu()');
    super(props);

    this.state =
    {
      forceRender: false
    };

    this._scrollView = React.createRef();
    let month = new Date().getMonth();


    for(var i = month; i < this._monthsOfYear.length; i++)
    {
      this._sortedMonths.push(this._monthsOfYear[i]);
    }
    for(var i = 0; i < month; i++)
    {
      this._sortedMonths.push(this._monthsOfYear[i]);
    }
  }


  onClick = (key) =>
  {
    this.props.onClick(key);
  }

  shouldComponentUpdate(nextProps, nextState)
  {
    var update = false;
    if(this.state.forceRender !== nextState.forceRender && nextState.forceRender)
    {
      this.setState({forceRender: false});
      update = true;
    }
    return (this.props.selected !== nextProps.selected ||
              update);
  }

  /**
    Calculate offset to scroll to
  */
  offset = async () =>
  {
    var text = "";
    var textWidthSum = 0;

    // Iterate months and figure out where we're at
    // accumulate text width as we go, always calculate
    // width of previous text, not current
    for(var i = 0; i < this._sortedMonths.length; i++)
    {
      // Calculate size of text
      let width = Dimensions.get('window').width;
      // Calculate how much we need to scroll
      const size = await rnTextSize.measure(
      {
        text,
        width,
        ...this._fontSpecs,
      });

      textWidthSum += size.width;

      console.log(size);
      console.log('Margin: ' + i * 36);
      console.log("Accumulated text width: " + textWidthSum);

      // Only calculate text for previous month so we dont' skip selected month
      text = this._sortedMonths[i];
      console.log(text);

      // This is the selected month, do the scroll
      if(this._sortedMonths[i] === this.props.selected)
      {
        // Don't scroll on first one, otherwise scroll 36 to account for right margin
        // then additional 36 for each column down we are
        let scrollBy = (i === 0 ? 0 : textWidthSum + (i * 36));

        console.log("Scrolling to: " + scrollBy);
        this._scrollView.current.scrollTo({x: scrollBy, y: 0});
        this.setState({ forceRender: true });
        return;
      }
    }
  }

  render()
  {
    console.log('MonthMenu.render()');
    return (
      <ScrollView style={styles.container} horizontal={true} ref={this._scrollView}>
        {this._sortedMonths.map( (month) =>
        {
          return <TouchableOpacity
                    onPress={() => this.onClick(month)}
                    key={month}
                  >
                    <Text style={[styles.text, this.props.selected === month ? Styles.activeTabBarBtn : Styles.inactiveTabBarBtn ]}>{month}</Text>
                  </TouchableOpacity>
        })}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 10,
  },
  text: {
    fontFamily: 'Arial',
    color: Colors.almostBlack,
    fontSize: 28,
    marginRight: 36,
  },
})
