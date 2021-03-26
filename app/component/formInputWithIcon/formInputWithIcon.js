import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Keyboard,
  Image
} from 'react-native';

import { HelperText } from 'react-native-paper';
import { Picker } from '@react-native-community/picker';

import { Colors } from '../../constant';
import Validate from '../../helper/Validate';
import { string, func, object } from 'prop-types';


export default class FormInput extends Component
{
  static propTypes =
  {
    id: string.isRequired,
    label: string.isRequired,
    value: string.isRequired,
    type: string.isRequired,
    updateMasterState: func.isRequired,
    keyboardType: string,
    otherTextInputProps: object,
  }

  static defaultProps =
  {
    keyboardType: 'default',
    otherTextInputAttributes: {},
  }

  static ValidationType =
  {
    Username: 'username',
    Password: 'password',
    Email:    'email',
    Phone:    'phone',
    Name:     'name'
  }

  constructor(props)
  {
    console.log('FormInput()');
    super(props);
    const { value } = this.props;
    this.position = new Animated.Value(value ? 1 : 0);
    this.state = {
      isFieldActive: false,
    }
  }

  _handleFocus = () =>
  {
    if (!this.state.isFieldActive)
    {
      if(this.props.onFocus)
      {
        this.props.onFocus();
      }
      this.setState({ isFieldActive: true });
      Animated.timing(this.position,
      {
        toValue: 1,
        duration: 150,
      }).start();
    }
  }

  _handleBlur = () =>
  {
    if(this.state.isFieldActive)
    {
      if(this.props.onBlur)
      {
        this.props.onBlur();
      }

      if(!this.props.value)
      {
        this.setState({ isFieldActive: false });
        Animated.timing(this.position,
        {
          toValue: 0,
          duration: 150,
        }).start();
      }
    }
  }

  _returnAnimatedTitleStyles = () =>
  {
    if(this.props.doNotAnimateLabel)
      return undefined;
    const { isFieldActive } = this.state;
    return {
      top: this.position.interpolate({
        inputRange: [0, 1],
        outputRange: this.props.interpolate ? this.props.interpolate : [6, -30],
      }),
      fontSize: isFieldActive ? 22 : 22,
    }
  }

  isFormInputValid = () =>
  {
    if(this.props.value.length === 0)
    {
      return true;
    }

    switch(this.props.validationType)
    {
      case FormInput.ValidationType.Username:
        return Validate.validateUsername(this.props.value);
      case FormInput.ValidationType.Password:
        return Validate.validatePassword(this.props.value);
      case FormInput.ValidationType.Email:
        return Validate.validateEmail(this.props.value);
      case FormInput.ValidationType.Phone:
        return Validate.validatePhone(this.props.value);
      default:
        return true;
    }
  }

  render()
  {
    //console.log('FormInput.render()');
    //console.log(this.props);
    if(this.props.forcedBlur)
    {
      this._handleFocus();
    }
    return (
      <View style={this.props.containerStyle ? styles['containerStyle' + this.props.containerStyle] : ''} key={this.props.key + '-container'}>
        {this.props.showLabel !== false &&
        <Animated.Text
          style={[this.props.labelStyle ? styles.['labelStyle' + this.props.labelStyle] : styles.labelStyle1, this._returnAnimatedTitleStyles()]}
          key={this.props.key + '-label'}
        >
          {this.props.label}
        </Animated.Text>}
        <View style={styles.textContainer}>

          <Image
            source={this.props.icon}
            style={styles.icon}
          />

          {this.props.type === 'select' &&
          <Picker
            key={this.props.key + '-picker'}
            selectedValue={this.props.value}
            onValueChange={(val, idx) => this.props.updateMasterState(this.props.id, val)}
          >
            {this.props.values.map((val, i) =>
            {
              return <Picker.Item label={val} value={val} key={this.props.key + '-picker-value-' + i}/>
            })}
          </Picker>}

          {this.props.type !== 'select' &&
          <TextInput
            ref={this.props.textInputRef}
            key={this.props.key + '-text-input'}
            value={this.props.value}
            style={this.props.textInputStyle ? styles.['textInput' + this.props.textInputStyle] : styles.textInput1}
            underlineColorAndroid='transparent'
            onFocus={this._handleFocus}
            onBlur={this._handleBlur}
            placeholder={this.props.placeholder}
            placeholderTextColor={this.props.placeholderTextColor ?? Colors.black}
            onChangeText={(val) => this.props.updateMasterState(this.props.id, val)}
            keyboardType={this.props.keyboardType}
            secureTextEntry={this.props.type === 'secure' ? true : false}
            {...this.props.otherTextInputProps}
          />}
        </View>

        {this.props.helperText &&
        this.props.showHelperText !== false &&
        <HelperText style={[styles.helperText, this.props.helperText ? '' : {display: 'none'}]}
          type="error"
          visible={!this.isFormInputValid()}>
          {this.props.helperText}
        </HelperText>}

      </View>
    )
  }
}

const styles = StyleSheet.create({

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
  },
  textInput3: {
    marginTop: 5,
    color: 'rgba(0, 18, 51, 0.5)',
    paddingLeft: 16,
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    textAlignVertical: 'top',
    borderBottomWidth: 2,
    borderBottomColor: Colors.white
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
    width: '100%',
    opacity: 0.36
  },
  textInput5: {
    marginTop: 5,
    color: Colors.lightBlue1,
    paddingLeft: 6,
    width: 80,
    fontFamily: 'Roboto-Medium',
    fontSize: 18,
    textAlignVertical: 'top',
    borderBottomWidth: 2,
    borderBottomColor: Colors.white,
    textAlign: 'right',
    opacity: 0.36
  },
  containerStyle1: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.white,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#979797',
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
  textContainer: {
    alignItems: "center",
    flexDirection: "row"
  },
  icon: {
    width: Math.round(Dimensions.get('window').width * 0.2),
    height: Math.round(Dimensions.get('window').height * 0.02),
    resizeMode: 'contain',
    opacity: 0.36
  }
})
