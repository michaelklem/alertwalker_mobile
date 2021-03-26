import React from 'react';
import { View, TouchableOpacity, Text, FlatList, StyleSheet, LayoutAnimation, Platform} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

import {AppText, Colors, Images} from '../../constant';

export default class Actions extends React.Component
{
  // MARK: - Data fields

  // MARK: - Constructor
  constructor(props)
  {
    console.log("\tFeedActions()");
    super(props);

    this.state = { };
  }

  render()
  {
    //console.log('\tFeedActions.render()');
    return (
      <View style={styles.container}>
        <View style={styles.action}>
          <TouchableOpacity
            onPress={(e)=> this.props.toggleComments(e)}
          >
            <Icon
              name={'message'}
              size={20}
              color={Colors.plainGray2}
            />
          </TouchableOpacity>
          <Text style={styles.actionText}>{this.props.post.comments.length}</Text>
        </View>

        <View style={styles.action}>
          <TouchableOpacity
            onPress={(e)=> this.props.like(e)}
          >
            <Icon
              name={'thumb-up'}
              size={20}
              color={Colors.plainGray2}
            />
          </TouchableOpacity>
          <Text style={styles.actionText}>{this.props.post.likedBy.length}</Text>
        </View>

        <View style={styles.action}>
          <TouchableOpacity
            onPress={(e)=> this.props.share()}
          >
            <Icon
              name={'share'}
              size={20}
              color={Colors.plainGray2}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    width: '45%',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionText: {
    color: Colors.plainGray2,
    marginLeft: 5,
  },
  action: {
    flex: 1,
    flexDirection: 'row'
  }
});
