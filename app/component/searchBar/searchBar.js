import React, { Component } from 'react';
import { ifIphoneX, ifAndroid } from './utils';
import {
  View,
  StyleSheet,
  TextInput,
  Animated,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { Colors, Styles } from '../../constant';
import { FormInput } from '../../component/formInput';

export default class SearchBar extends Component
{
  _textInputRef = null;

  constructor(props)
  {
    console.log('SearchBar()');
    super(props);
    this.state =
    {
      inFocus: false
    };

    this._textInputRef = React.createRef();
  }

  onFocus = () =>
  {
    this.setState({ inFocus: true });
    if(this.props.onFocus)
    {
      this.props.onFocus();
    }
  }

  onBlur = () =>
  {
    this.setState({ inFocus: false });
    if(this.props.onBlur)
    {
      this.props.onBlur();
    }
  }

  render()
  {
    return (
      <View style={styles['searchContainer' + this.props.layout]}>
        {(this.props.layout === 1 || this.props.layout === 3) &&
        <View />}
        <FormInput
          id={this.props.id}
          updateMasterState={this.props.updateMasterState}
          value={this.props.value}
          label={''/*this.props.value ? '' : this.props.placeholder*/}
          placeholder={this.props.placeholder}
          type={'text'}
          containerStyle={3}
          textInputStyle={this.props.layout === 3 ? 7 : 8}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          textInputRef={this._textInputRef}
        />
        <Icon
          name={'search'}
          size={height28}
          color={this.props.layout === 3 ? Colors.orange1 : Colors.white}
          style={{alignSelf: 'flex-end', position: 'absolute', right: width28, top: '25%'}}
        />
      </View>
    );
  }
}

const height28 = Math.round(Dimensions.get('window').height * 0.035898);
const width28 = Math.round(Dimensions.get('window').width * 0.07466);
const width10 = Math.round(Dimensions.get('window').width * 0.0266);

const styles = StyleSheet.create({
  searchContainer1: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  searchContainer2: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.orange1,
  },
  searchContainer3: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  textInput1: {
    flex: 1,
    marginLeft: width10,
    marginRight: width10,
    backgroundColor: Colors.white,
  },
  textInput2: {
    flex: 1,
    marginLeft: width10,
    marginRight: width10,
    color: Colors.white,
  },
  textInput3: {
    flex: 1,
    marginLeft: width10,
    marginRight: width10,
    backgroundColor: Colors.white,
    color: Colors.black,
  },
  searchIcon: {
      width: 28,
      height: 28,
  },
});
