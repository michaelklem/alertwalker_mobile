import React, {Component} from 'react';
import {  FlatList,
          Dimensions,
          Image,
          StyleSheet,
          TouchableOpacity,
          View } from 'react-native';
import { actions } from './const';
import { Colors, Images } from '../../constant';
import { ToolbarIcon, ToolbarDropdown } from '.';

export default class RichToolbar extends Component
{
  _iconImages =
  {
    [actions.uploadImage]: Images.formatUploadIcon,
    [actions.captureImage]: Images.formatCaptureIcon,
    [actions.drawImage]: Images.formatDrawIcon,
    [actions.insertImage]: Images.formatMediaIcon,
    [actions.uploadPdf]: Images.calendarIconUploadPdf,
    [actions.editPdf]: Images.calendarIconEditPdf,
    [actions.cropImage]: Images.formatCropIcon,
    [actions.setBold]: Images.formatBoldIcon,
    [actions.setItalic]: Images.formatItalicIcon,
    [actions.setUnderline]: Images.formatUnderlineIcon,
    [actions.insertBulletsList]: Images.formatUlIcon,
    [actions.insertOrderedList]: Images.formatOlIcon,
    [actions.insertLink]: Images.formatLinkIcon,
    [actions.heading3]: Images.formatHeading3Icon,
    [actions.heading2]: Images.formatHeading3Icon
  };

  static defaultProps =
  {
    actions:
    [
      actions.insertImage,
      actions.setBold,
      actions.setItalic,
      actions.setUnderline,
      actions.insertBulletsList,
      actions.insertOrderedList,
      actions.insertLink
    ],
    disabled: false,
  };

  constructor(props)
  {
    super(props);
    this.state =
    {
      editor: void 0,
      selectedItems: [],
      fontSize: '4',
      font: 'Helvetica',
      bottomData: [],
      topData: []
    };
  }

  shouldComponentUpdate(nextProps, nextState)
  {
    return (
      nextProps.bottomActions !== this.props.bottomActions ||
      nextState.editor !== this.state.editor ||
      nextState.selectedItems !== this.state.selectedItems ||
      nextState.actions !== this.state.actions ||
      nextState.style !== this.props.style ||
      nextState.fontSize !== this.state.fontSize ||
      nextState.font !== this.state.font
    );
  }

  static getDerivedStateFromProps(nextProps, prevState)
  {
    const { bottomActions, topActions } = nextProps;
    if(bottomActions !== prevState.bottomActions || topActions !== prevState.topActions)
    {
      let {selectedItems = []} = prevState;
      return {
        bottomActions,
        bottomData: bottomActions.map((action) => ({action, selected: selectedItems.includes(action)})),
        topActions,
        topData: topActions.map((action) => ({action, selected: selectedItems.includes(action)})),
      };
    }
    return null;
  }

  componentDidMount()
  {
    const {editor: {current: editor} = {current: this.props?.getEditor()}} = this.props;
    if(!editor)
    {
      throw new Error('Toolbar has no editor!');
    }
    else
    {
      editor.registerToolbar((selectedItems) => this.setSelectedItems(selectedItems));
      this.setState({editor});
    }
  }

  setSelectedItems(selectedItems)
  {
    if (selectedItems !== this.state.selectedItems)
    {
      this.setState({
        selectedItems,
        bottomData: this.state.bottomActions.map((action) => ({action, selected: selectedItems.includes(action)})),
        topData: this.state.actions.map((action) => ({action, selected: selectedItems.includes(action)})),
      });
    }
  }

  _renderAction(action, selected)
  {
    //console.log(action);
    //console.log(selected);
    if(action === 'fontSize' || action === 'font')
    {
      return (
        <ToolbarDropdown
          action={action}
          disabled={false}
          text={action}
          value={action === 'fontSize' ? this.state.fontSize : this.state.font}
          onPress={(inputAction, inputData) =>
          {
            //console.log(inputAction);
            //console.log(inputData);

            if(inputAction === 'fontSize' && inputData)
            {
              this.setState({ fontSize: inputData });
            }
            else if(inputAction === 'font' && inputData)
            {
              this.setState({ font: inputData });
            }

            this.state.editor.showAndroidKeyboard();
            this.state.editor._sendAction(inputAction, 'result', inputData);
          }}
        />
      );
    }
    return (
      <ToolbarIcon
        action={action}
        disabled={false}
        icon={this._iconImages[action]}
        onPress={() =>
        {
          this.state.editor.showAndroidKeyboard();
          this.state.editor._sendAction(action, 'result', '');
        }}
      />
    );
  }

  render()
  {
    return (
    <>
      <View style={styles.barContainer}>
        <FlatList
          horizontal
          keyboardShouldPersistTaps={'always'}
          keyExtractor={(item, index) => item.action + '-' + index}
          data={this.state.topData}
          alwaysBounceHorizontal={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => this._renderAction(item.action, item.selected)}
        />
      </View>
      <View style={styles.barContainer}>
        <FlatList
          horizontal
          keyboardShouldPersistTaps={'always'}
          keyExtractor={(item, index) => item.action + '-' + index}
          data={this.state.bottomData}
          alwaysBounceHorizontal={false}
          showsHorizontalScrollIndicator={false}
          renderItem={({item}) => this._renderAction(item.action, item.selected)}
        />
      </View>
    </>
    );
  }
}

const styles = StyleSheet.create({
    barContainer: {
      height: Math.round(Dimensions.get('window').height * 0.0615),
      backgroundColor: Colors.editorToolbar.background,
      alignItems: 'center',
      zIndex: 100,
    },
});
