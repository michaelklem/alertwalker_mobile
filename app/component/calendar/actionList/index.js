import React, { Component } from 'react';
import {
        View,
        FlatList,
        Dimensions,
        SafeAreaView,
        StyleSheet,
        TouchableOpacity,
        Modal,
        Image,
        Text
} from 'react-native';

import { ImageButton } from '../../imageButton';
import { PdfEditor } from '../../pdfEditor';
import { Colors, Images } from '../../../constant';


export default class ActionList extends Component
{
  _pdfEditor = null;

  constructor(props)
  {
    super(props);
    this.state =
    {
      pdfEditorIsOpen: false,
      actions: [
        /*{
          action: 'Background Color',
          image: Images.calendarIconBgColor
        },*/
        {
          action: 'Open Prev PDF',
          image: Images.calendarIconEditPdf,
          onPress: async() =>
          {
            this._pdfEditor.current.listFiles();
          }
        },
        {
          action: 'Upload PDF',
          image: Images.calendarIconUploadPdf,
          onPress: () =>
          {
            this.setState({ pdfEditorIsOpen: true }, () =>
            {
              this._pdfEditor.current.openFile();
            });
          }
        }
      ],
    };

    this._pdfEditor = React.createRef();
  }

  reloadPdfEditor = () =>
  {
    this._pdfEditor.current.loadData();
  }

  renderAction = (action, i) =>
  {
    //console.log(action);
    return (
      <TouchableOpacity
        style={[styles.itemContainer]}
        onPress={() =>
        {
          this.state.actions[action.index].onPress();
        }}
      >
        <Image
          source={action.item.image}
          style={styles.icon}
        />
        <Text
          adjustsFontSizeToFit={true}
          style={styles.text}>{action.item.action}</Text>
      </TouchableOpacity>
    );
  }

  render()
  {
    console.log('\tActionList.render()');
    return (
      <View style={styles.barContainer}>
        <FlatList
          horizontal
          keyboardShouldPersistTaps={'always'}
          keyExtractor={(item, index) => item.action + '-' + index}
          data={this.state.actions}
          alwaysBounceHorizontal={false}
          showsHorizontalScrollIndicator={false}
          renderItem={(action, i) => this.renderAction(action, i)}
        />
        <PdfEditor
          ref={this._pdfEditor}
          showAlert={this.props.showAlert}
          updateMasterState={this.props.updateMasterState}
          user={this.props.user}
          useRemoteStorage={true}
          filePurpose={'calendartemplate'}
        />
      </View>);
  }
}

const sideMargins = Math.round(Dimensions.get('window').width * 0.044);
const styles = StyleSheet.create({
  barContainer: {
    height: Math.round(Dimensions.get('window').height * 0.0615),
    backgroundColor: Colors.editorToolbar.background,
    alignItems: 'center',
    zIndex: 100,
  },
  itemContainer: {
    height: Math.round(Dimensions.get('window').height * 0.0615),
    backgroundColor: Colors.editorToolbar.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.darkBlue1,
    borderWidth: 1,
    width: Math.round(Dimensions.get('window').width * 0.5)
  },
  icon: {
    resizeMode: 'contain',
    justifyContent: 'center',
    width: '33%',
    height: '33%'
  },
  text: {
    color: Colors.white,
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Regular'
      },
      android: {
        fontFamily: 'Roboto-Regular'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: 10,
    marginTop: 10,
    textAlign: 'center',
  }
});
