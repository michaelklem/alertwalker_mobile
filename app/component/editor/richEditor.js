import React, {Component} from 'react';
import {WebView} from 'react-native-webview';
import {actions, messages} from './const';
import {Dimensions, Keyboard, Platform, StyleSheet, TextInput, View} from 'react-native';
import {createHTML} from './editor';
import { PdfEditor } from '../pdfEditor';

const PlatformIOS = Platform.OS === 'ios';

export default class RichTextEditor extends Component
{
  _pdfEditor = null;

  // static propTypes = {
  //     initialContentHTML: PropTypes.string,
  //     editorInitializedCallback: PropTypes.func,
  //     onChange: PropTypes.func,
  //     onHeightChange: PropTypes.func,
  //     initialFocus: PropTypes.bool,
  //     disabled: PropTypes.bool,
  // };

  static defaultProps =
  {
    contentInset: {},
    style: {},
    placeholder: '',
    initialContentHTML: '',
    initialFocus: false,
    disabled: false,
    useContainer: true,
    pasteAsPlainText: false,
    editorInitializedCallback: () => {},
  };

  constructor(props)
  {
    super(props);
    let that = this;
    that.renderWebView = that.renderWebView.bind(that);
    that.onMessage = that.onMessage.bind(that);
    that._sendAction = that._sendAction.bind(that);
    that.registerToolbar = that.registerToolbar.bind(that);
    that._onKeyboardWillShow = that._onKeyboardWillShow.bind(that);
    that._onKeyboardWillHide = that._onKeyboardWillHide.bind(that);
    that.init = that.init.bind(that);
    that.setRef = that.setRef.bind(that);
    that._keyOpen = false;
    that.selectionChangeListeners = [];
    const {
        editorStyle: {backgroundColor, color, placeholderColor, cssText, contentCSSText} = {},
        html,
        pasteAsPlainText,
    } = props;
    that.state =
    {
      html:
      {
        html:
          html ||
          createHTML({
            backgroundColor,
            color,
            placeholderColor,
            cssText,
            contentCSSText,
            pasteAsPlainText,
          }),
      },
      keyboardHeight: 0,
      height: 0,
      isInit: false,
      minHeight: Dimensions.get('window').height * (props.editable ? 0.35 : 0.7),
    };
    that.focusListeners = [];

    this._pdfEditor = React.createRef();
  }

  componentDidMount()
  {
    if (PlatformIOS)
    {
      this.keyboardEventListeners =
      [
        Keyboard.addListener('keyboardWillShow', this._onKeyboardWillShow),
        Keyboard.addListener('keyboardWillHide', this._onKeyboardWillHide),
      ];
    }
    else
    {
      this.keyboardEventListeners =
      [
        Keyboard.addListener('keyboardDidShow', this._onKeyboardWillShow),
        Keyboard.addListener('keyboardDidHide', this._onKeyboardWillHide),
      ];
    }
  }

  componentWillUnmount()
  {

  }

  _onKeyboardWillShow(event)
  {
    this._keyOpen = true;
  }

  _onKeyboardWillHide(event)
  {
    this._keyOpen = false;
  }

  onMessage(event)
  {
    try
    {
      const message = JSON.parse(event.nativeEvent.data);
      switch (message.type)
      {
        case messages.CONTENT_HTML_RESPONSE:
            if (this.contentResolve) {
                this.contentResolve(message.data);
                this.contentResolve = undefined;
                this.contentReject = undefined;
                if (this.pendingContentHtml) {
                    clearTimeout(this.pendingContentHtml);
                    this.pendingContentHtml = undefined;
                }
            }
            break;
        case messages.LOG:
            console.log('FROM EDIT:', ...message.data);
            break;
        case messages.SELECTION_CHANGE: {
            const items = message.data;
            this.selectionChangeListeners.map((listener) => {
                listener(items);
            });
            break;
        }
        case messages.CONTENT_FOCUSED: {
            this.focusListeners.map((da) => da());
            break;
        }
        case messages.CONTENT_CHANGE: {
            this.props.onChange && this.props.onChange(message.data);
            break;
        }
        case messages.OFFSET_HEIGHT:
            this.setWebHeight(message.data);
            break;
      }
    }
    catch (e)
    {
    }
  }

  setWebHeight = (height) =>
  {
    const {onHeightChange, useContainer} = this.props;
    if (height !== this.state.height)
    {
      useContainer && this.setState({height});
      onHeightChange && onHeightChange(height);
    }
  };

  async _sendAction(type, action, data)
  {
    //console.log('Type: ' + type + '\nAction: ' + action + '\nData: ' + data);

    if(type === 'uploadImage')
    {
      await this.props.openImagePicker();
      return;
    }
    else if(type === 'captureImage')
    {
      await this.props.openCamera();
      return;
    }
    else if(type === 'drawImage')
    {
      this.props.openDrawingBoard();
      return;
    }
    else if(type === 'cropImage')
    {
      await this.props.openImagePickerWithCrop();
      return;
    }
    else if(type === 'uploadPdf')
    {
      this._pdfEditor.current.openFile();
      return;
    }
    else if(type === 'editPdf')
    {
      this._pdfEditor.current.listFiles();
      return;
    }

    let jsonString = JSON.stringify({type, name: action, data});
    if(this.webviewBridge)
    {
      this.webviewBridge.postMessage(jsonString);
    }
  }

  reloadPdfEditor = () =>
  {
    this._pdfEditor.current.loadData();
  }

  imageUploadFinished = (url) =>
  {
    console.log('richEditor URL: ' + url);
    if(url)
    {
      this.insertImage(url);
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot)
  {
    const {editorStyle, disabled} = this.props;
    if (prevProps.editorStyle !== editorStyle)
    {
      editorStyle && this.setContentStyle(editorStyle);
    }
    if (disabled !== prevProps.disabled)
    {
      this.setDisable(disabled);
    }
  }

  setRef(ref)
  {
    this.webviewBridge = ref;
  }

  renderWebView()
  {
    const {html, editorStyle, useContainer, ...rest} = this.props;
    const {html: viewHTML} = this.state;
    // webview dark theme bug
    const opacity = this.state.isInit ? 1 : 0;
    return (
      <>
        <PdfEditor
          ref={this._pdfEditor}
          showAlert={this.props.showAlert}
          updateMasterState={this.props.updateMasterState}
          user={this.props.user}
          useRemoteStorage={true}
          onSavePdf={(file) => console.log(file) /* Might want to insert a generic PDF image later so added this callback */}
          filePurpose={this.props.filePurpose}
        />
        <WebView
          useWebKit={true}
          scrollEnabled={false}
          hideKeyboardAccessoryView={false}
          keyboardDisplayRequiresUserAction={false}
          {...rest}
          ref={this.setRef}
          onMessage={this.onMessage}
          originWhitelist={['*']}
          dataDetectorTypes={'none'}
          domStorageEnabled={false}
          bounces={false}
          javaScriptEnabled={true}
          source={viewHTML}
          opacity={opacity}
          onLoad={this.init}
        />
          {Platform.OS === 'android' && <TextInput ref={(ref) => (this._input = ref)} style={styles._input} />}
      </>
    );
  }

  //-------------------------------------------------------------------------------
  //--------------- Public API

  registerToolbar(listener)
  {
    this.selectionChangeListeners = [...this.selectionChangeListeners, listener];
  }

  setContentFocusHandler(listener)
  {
    this.focusListeners.push(listener);
  }

  setContentHTML(html)
  {
    this._sendAction(actions.content, 'setHtml', html);
  }

  setPlaceholder(placeholder)
  {
    this._sendAction(actions.content, 'setPlaceholder', placeholder);
  }

  setContentStyle(styles)
  {
    this._sendAction(actions.content, 'setContentStyle', styles);
  }

  setDisable(dis)
  {
    this._sendAction(actions.content, 'setDisable', !!dis);
  }

  blurContentEditor()
  {
    this._sendAction(actions.content, 'blur');
  }

  focusContentEditor()
  {
    this.showAndroidKeyboard();
    this._sendAction(actions.content, 'focus');
  }

  /**
   * open android keyboard
   * @platform android
   */
  showAndroidKeyboard()
  {
    if (Platform.OS === 'android')
    {
      !this._keyOpen && this._input.focus();
      this.webviewBridge.requestFocus && this.webviewBridge.requestFocus();
    }
  }

  insertImage(attributes)
  {
    console.log("Send action");
    this._sendAction(actions.insertImage, 'result', attributes);
  }

  insertVideo(attributes) {
    this._sendAction(actions.insertVideo, 'result', attributes);
  }

  insertText(text)
  {
    this._sendAction(actions.insertText, 'result', text);
  }

  insertHTML(html)
  {
    this._sendAction(actions.insertHTML, 'result', html);
  }

  insertLink(title, url)
  {
    if (url)
    {
      this.showAndroidKeyboard();
      this._sendAction(actions.insertLink, 'result', {title, url});
    }
  }

  init()
  {
    const {initialFocus, initialContentHTML, placeholder, editorInitializedCallback, disabled} = this.props;
    this.setContentHTML(initialContentHTML);
    this.setPlaceholder(placeholder);
    this.setDisable(disabled);
    editorInitializedCallback();

    // initial request focus
    initialFocus && !disabled && this.focusContentEditor();
    // no visible ?
    this._sendAction(actions.init);
    this.setState({isInit: true});
  }

  /**
   * @deprecated please use onChange
   * @returns {Promise}
   */
  async getContentHtml()
  {
    return new Promise((resolve, reject) =>
    {
      this.contentResolve = resolve;
      this.contentReject = reject;
      this._sendAction(actions.content, 'postHtml');

      this.pendingContentHtml = setTimeout(() =>
      {
        if (this.contentReject)
        {
          this.contentReject('timeout');
        }
      }, 5000);
    });
  }

  render()
  {
    let {height} = this.state;

    height = (height > this.state.minHeight ? height : this.state.minHeight);

    // useContainer is an optional prop with default value of true
    // If set to true, it will use a View wrapper with styles and height.
    // If set to false, it will not use a View wrapper
    const {useContainer, style} = this.props;

    if (useContainer)
    {
      return (
        <View style={[style, {height: height }]} pointerEvents={this.props.editable ? 'auto' : 'none'}>
          {this.renderWebView()}
        </View>
      );
    }
    return this.renderWebView();
  }
}

const styles = StyleSheet.create({
    _input: {
        position: 'absolute',
        width: 1,
        height: 1,
        zIndex: -999,
        bottom: -999,
        left: -999,
    },
});
