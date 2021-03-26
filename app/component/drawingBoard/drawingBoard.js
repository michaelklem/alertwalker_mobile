import React, { Component } from 'react';
import { Dimensions, Modal, SafeAreaView, StyleSheet, View, PixelRatio } from 'react-native';
import { WebView } from 'react-native-webview';
// webview only works online, unless you use inline html
import { html } from './drawHtml';
import { ImageButton } from '../imageButton';
import { Colors, Images } from '../../constant';


type ReactNativeDrawProps = {
  penColour: string,
  strokeWidth: number,
};

// create a component
export default class DrawingBoard extends Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      htmlStr: props.html
    };
  }


  componentDidMount()
  {
    const { penColor, strokeWidth } = this.props;
    const ratio = PixelRatio.getPixelSizeForLayoutSize(strokeWidth);
    const adj = ratio / strokeWidth + strokeWidth;

    let htmlStr = html
      .replace('[[LINE_WIDTH]]', adj || 12)
      .replace('[[COLOR]]', penColor || '#000');
    this.setState({ htmlStr });
  }

  componentDidUpdate(prevProps)
  {
    this.updateView();
  }

  updateView = () =>
  {
    this.changeColour(this.props.penColor);
    this.changeStrokeWidth(this.props.strokeWidth);
  };

  changeColour = (penColor) =>
  {
    try
    {
      if (this.webref)
      {
        this.webref.injectJavaScript(`setColor('${penColor}')`);
      }
    }
    catch (err)
    {
      alert(err);
    }
  };

  changeStrokeWidth = (strokeWidth) =>
  {
    try
    {
      if (this.webref)
      {
        const ratio = PixelRatio.getPixelSizeForLayoutSize(strokeWidth);
        const adj = ratio / strokeWidth + strokeWidth;
        this.webref.injectJavaScript(`setStrokeWidth(${adj})`);
      }
    }
    catch (err)
    {
      console.error(err);
    }
  };

  clear = () =>
  {
    try
    {
      if (this.webref)
      {
        this.webref.injectJavaScript('clearDrawing()');
      }
    }
    catch (err)
    {
      console.error(err);
    }
  };

  undo = () =>
  {
    try
    {
      if (this.webref)
      {
        this.webref.injectJavaScript('undoLines()');
      }
    }
    catch (err)
    {
      console.error(err);
    }
  };

  onMessage = (evt) =>
  {
    try
    {
      const message = JSON.parse(evt.nativeEvent.data);
      console.log(message);
      this.props.onChange && this.props.onChange(message.data)
    }
    catch (e)
    {
    }
  }

  render()
  {
    return (
      <Modal
        animationType={'slide'}
        transparent={false}
        visible={this.props.visible}
        style={styles.container}
      >
        <SafeAreaView style={styles.innerContainer}>
          <ImageButton
            titleStyle={styles.closeBtnContainer}
            imageStyle={styles.closeBtn}
            imgSrc={Images.close}
            onPress={this.props.onClose}
          />
          <ImageButton
            titleStyle={styles.saveBtnContainer}
            imageStyle={styles.saveBtn}
            imgSrc={Images.addIcon}
            onPress={this.props.onSave}
          />
          <WebView
            style={styles.drawBg}
            ref={(r) => (this.webref = r)}
            useWebKit
            originWhitelist={['*']}
            source={{ html: this.state.htmlStr }}
            mixedContentMode={'compatibility'}
            javaScriptEnabled={true}
            onMessage={this.onMessage}
            domStorageEnabled={true}
            scrollEnabled={false}
          />
        </SafeAreaView>
      </Modal>
    );
  }
}

const height20 = Math.round(Dimensions.get('window').height * 0.0256);
const height26 = Math.round(Dimensions.get('window').height * 0.0333);
const width20 = Math.round(Dimensions.get('window').width * 0.0533);
const width50 = Math.round(Dimensions.get('window').width * 0.13333);

const styles = StyleSheet.create({
  drawBg: {
    width: '80%',
    backgroundColor: Colors.black,
    position: 'absolute',
    top: '15%',
    left: '10%',
    right: 0,
    bottom: '10%',
  },
  closeBtn: {
    width: Math.round(Dimensions.get('window').width * 0.1),
    height: Math.round(Dimensions.get('window').width * 0.1),
    resizeMode: 'contain',
    alignSelf: 'baseline',
    position: 'absolute',
    top: height20,
    right: width50
  },
  closeBtnContainer: {
    width: Math.round(Dimensions.get('window').width * 0.2),
    height: Math.round(Dimensions.get('window').width * 0.2),
    marginRight: Math.round(Dimensions.get('window').width * 0.044),
    alignSelf: 'baseline',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: height20,
    zIndex: 100,
    right: width50
  },
  saveBtn: {
    width: Math.round(Dimensions.get('window').width * 0.06),
    height: Math.round(Dimensions.get('window').width * 0.06),
    resizeMode: 'contain',
    alignSelf: 'baseline',
    position: 'absolute',
    top: height26,
    right: width20
  },
  saveBtnContainer: {
    width: Math.round(Dimensions.get('window').width * 0.2),
    height: Math.round(Dimensions.get('window').width * 0.2),
    marginRight: Math.round(Dimensions.get('window').width * 0.044),
    alignSelf: 'baseline',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
    position: 'absolute',
    top: height20,
    zIndex: 100,
    right: width20
  },
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  innerContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.black,
    opacity: 0.98,
    flexDirection: 'column'
  },
});
