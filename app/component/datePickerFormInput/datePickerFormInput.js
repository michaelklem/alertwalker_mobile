import React, { Component } from 'react';
import {
  View,
  Text,
  Dimensions,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Animated
} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Colors } from '../../constant';
import { string, func, object } from 'prop-types';


export default class DatePickerFormInput extends Component
{
  static propTypes =
  {
    label: string.isRequired,
    type: string.isRequired,
    updateMasterState: func.isRequired,
    keyboardType: string,
    otherTextInputProps: object,
  }

  constructor(props)
  {
    console.log('DatePickerFormInput()');
    super(props);
    this.state =
    {
        visible: false,
        date: props.value
    }
  }
  static getDerivedStateFromProps(nextProps, prevState){
    if(nextProps.value!==prevState.date){
      return { date: nextProps.value};
   }
   else return null;
 }

  _formatDate()
  {
    if(!this.state.date)
      return "";
    const day = this.state.date.getDate();
    const month = this.state.date.getMonth()+1;
    const year = this.state.date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  _onDateSelect(d)
  {
    this.setState({ visible: false, date: d });
    this.props.updateMasterState(this.props.id, d);
  }

  _returnAnimatedTitleStyles = () =>
  {
    const { isFieldActive } = this.state;
    return {
      top: this.position.interpolate({
        inputRange: [0, 1],
        outputRange: this.props.interpolate ? this.props.interpolate : [6, -30],
      }),
      fontSize: isFieldActive ? 22 : 22,
    }
  }

  render()
  {
    console.log('DatePickerFormInput.render()');
    return (
    <TouchableOpacity
      onPress={() => this.setState({ visible: true })}
    >
      <View style={this.props.containerStyle ? styles.['containerStyle' + this.props.containerStyle] : styles.containerStyle1}>
        {this.props.showLabel !== false &&
          <Animated.Text
            style={[this.props.labelStyle ? styles.['labelStyle' + this.props.labelStyle] : styles.labelStyle1, this.props.interpolateLabel &&  this._returnAnimatedTitleStyles()]}
            key={this.props.key + '-label'}
          >
            {this.props.label}
          </Animated.Text>}
        <Text style={this.props.textInputStyle ? styles.['textInput' + this.props.textInputStyle] : styles.textInput1}>
          {this.state.date ? this._formatDate() : this.props.placeholder}
        </Text>
        <DateTimePickerModal
          mode={this.props.mode ?? "date"}
          date={this.state.date}
          isVisible={this.state.visible}
          onConfirm={(d) => this._onDateSelect(d)}
          onCancel={() => this.setState({ visible: false })}
        />
      </View>
    </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  textContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row"
  },
  textLabel1: {
    marginTop: 5,
    color: Colors.black,
    paddingLeft: 16,
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    textAlignVertical: 'top',
    borderBottomWidth: 2,
    borderBottomColor: Colors.white,
  },
  textLabel2: {
    marginTop: 5,
    color: Colors.white,
    paddingLeft: 16,
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    textAlignVertical: 'top',
    borderBottomWidth: 2,
    borderBottomColor: Colors.plainGray3,
    display: "flex",
    justifyContent: "space-between",
    width: "100%"
  },
  textLabel3: {
    marginTop: 5,
    color: 'rgba(0, 18, 51, 0.5)',
    paddingLeft: 16,
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    textAlignVertical: 'top',
    borderBottomWidth: 2,
    borderBottomColor: Colors.white,
  },
  textInput1: {
    marginTop: 5,
    color: Colors.black,
    paddingLeft: 16,
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    textAlignVertical: 'top',
    borderBottomWidth: 2,
    borderBottomColor: Colors.white,
  },
  textInput2: {
    marginTop: 5,
    color: Colors.white,
    paddingLeft: 16,
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    textAlignVertical: 'top',
    borderBottomWidth: 2,
    borderBottomColor: Colors.plainGray3,
    display: "flex",
    justifyContent: "space-between",
    width: "100%"
  },
  textInput3: {
    marginTop: 5,
    color: 'rgba(0, 18, 51, 0.5)',
    paddingLeft: 16,
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    textAlignVertical: 'top',
    borderBottomWidth: 2,
    borderBottomColor: Colors.white,
  },
  textInput4: {
    marginTop: 5,
    color: Colors.lightBlue1,
    paddingLeft: 16,
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    textAlignVertical: 'top',
    borderBottomWidth: 2,
    borderBottomColor: Colors.white,
  },
  containerStyle1: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#979797'
  },
  containerStyle2: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.white,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#979797',
    width: '100%',
    paddingHorizontal: 16
  },
  labelStyle1: {
    position: 'absolute',
    fontSize: 22,
    color: Colors.descriptionGray,
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
  labelStyle2: {
    fontSize: 22,
    color: Colors.plainGray4,
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
  helperText: {
    paddingLeft: 5.5,
    color: Colors.helperTextErrorColor
  },
})
