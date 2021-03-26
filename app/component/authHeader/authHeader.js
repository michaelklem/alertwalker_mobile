'use strict';
import React, { Node } from 'react';
import {Dimensions, StyleSheet, Image} from 'react-native';
import { Colors } from '../../constant';

const AuthHeader = (): Node => (
  <Image
    source={require('../../asset/logo.png')}
    style={styles.background}>
  </Image>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    overflow: 'visible',
    resizeMode: 'contain',
    width: Math.round(Dimensions.get('window').width),
  }
});

export default AuthHeader;
