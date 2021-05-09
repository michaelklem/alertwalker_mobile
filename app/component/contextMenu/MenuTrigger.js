import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { TouchableOpacity, TouchableHighlight } from 'react-native-gesture-handler';

import { debug } from './logger.js';
import { makeTouchable } from './helpers';
import { withCtx } from './MenuProvider';

export class MenuTrigger extends Component {

  _onPress() {
    debug('trigger onPress');
    this.props.onPress && this.props.onPress();
    this.props.ctx.menuActions.openMenu(this.props.menuName);
  }

  render() {
    const { disabled, onRef, text, children, style, customStyles, menuName, ...other } = this.props;
    const onPress = () =>
    {
      !disabled && this._onPress();
    };
    const { Touchable, defaultTouchableProps } = makeTouchable(customStyles.TriggerTouchableComponent);
    return (
      <View ref={onRef} collapsable={false} style={customStyles.triggerOuterWrapper}>
        <Pressable
          onPressIn={() =>
          {
            console.log('OnPress');
            onPress();
          }}
          style={style}
          {...defaultTouchableProps}
        >
          {children}
        </Pressable>
      </View>
    );
  }

}

const h25 = Math.round(Dimensions.get('window').height * 0.0320);
const h78 = Math.round(Dimensions.get('window').height * 0.1);

MenuTrigger.propTypes = {
  disabled: PropTypes.bool,
  text: PropTypes.string,
  onPress: PropTypes.func,
  onAlternativeAction: PropTypes.func,
  customStyles: PropTypes.object,
  triggerOnLongPress: PropTypes.bool,
  testID: PropTypes.string,
};

MenuTrigger.defaultProps = {
  disabled: false,
  customStyles: {},
  testID: undefined,
};

export default withCtx(MenuTrigger)
