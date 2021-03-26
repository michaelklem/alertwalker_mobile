import React, {Component} from 'react';
import
{
  Animated,
  Dimensions,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  Share,
  LayoutAnimation,
  Platform,
  UIManager
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import {AppText, Colors, DateTime, Extensions, Images, Styles} from '../../constant';
import ApiRequest from '../../helper/ApiRequest';
import { CommentContainer } from '../comment';
import { CommentHelper } from '../../component-helper';


/**
*/
export default class Post extends Component
{
  // MARK: - Data fields
  _commentHelper = null;

  // MARK: - Constructor
  constructor(props)
  {
    console.log("\tGroup()");
    super(props);

    this.state =
    {
      commentText: '',
      activeCommentCellIdx: -1,
      activeCommentCellId: '',
    };


    this._commentHelper = CommentHelper.GetInstance(this.state.comments);
  }


  // MARK: - Render
  shouldComponentUpdate(nextProps, nextState)
  {
    return (
      this.props.group !== nextProps.group ||
      this.props.isFocused !== nextProps.isFocused
    );
  }

  // TODO: In mongo need to create a text index on posts.text because the size is too large to index
  render()
  {
    console.log('\tGroup.render()');
    //console.log(this.props.post);
    //console.log(this.state);
    let fileType = null;

    return (
    <>
      <View style={[styles.container, Styles.paper]}>

        <View style={styles.content}>
          <Text align='left'>
            {`${this.props.group.name} (${this.props.group.members.length})`}
          </Text>
        </View>

      </View>
    </>);
  }
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    width: Math.round(Dimensions.get('window').width) - 20,
    height: 'auto',
    flex: 1,
  },
  content: {
    marginLeft: Math.round(Dimensions.get('window').width * 0.1) + 10,
  },
  postUserContainer: {
    flexDirection: 'row',
  },
  postImage: {
    marginRight: 20,

    width: Math.round(Dimensions.get('window').width - 20),
    height: Math.round(Dimensions.get('window').height * 0.3),
    overflow: 'visible',
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});
