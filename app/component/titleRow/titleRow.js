import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Image
} from 'react-native';

import { AppText, Colors, Images, Styles } from '../../constant';

export default class TitleRow extends Component
{

    render()
    {
        const containerColor = (this.props.layout ? styles.[`containerStyle${this.props.layout}`] : '');
        const titleColor = (this.props.layout ? styles.[`titleText${this.props.layout}`] : '');
        const addColor = (this.props.layout ? styles.[`addText${this.props.layout}`] : '');
        return (
            <View style={[styles.containerStyle, containerColor]}>
                <Text style={[styles.titleText, titleColor]}>{this.props.label}</Text>
                {this.props.onAddItem &&
                    <TouchableOpacity
                      style={styles.addColumn}
                      onPress={() => this.props.onAddItem()}
                    >
                      <Text style={[styles.addText, addColor]}>{AppText.budgetPage.addItemText}</Text>
                      <Image
                        style={styles.addImg}
                        source={Images.addIcon}
                      />
                    </TouchableOpacity>}
            </View>
        )
    }
}

const height14 = Math.round(Dimensions.get('window').height * 0.01794);

const styles = StyleSheet.create({
  containerStyle: {
    flexDirection: 'row',
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.05),
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28
  },
  containerStyle1: {
    backgroundColor: Colors.lightBlue1
  },
  containerStyle2: {
    backgroundColor: Colors.maroon
  },
  containerStyle3: {
    backgroundColor: Colors.yellow
  },
  containerStyle4: {
    backgroundColor: Colors.white
  },
  containerStyle5: {
    backgroundColor: "transparent"
  },
  containerStyle6: {
    backgroundColor: Colors.yellow
  },
  titleText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Bold'
      },
      android: {
        fontFamily: 'Roboto-Bold'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height14,
    textAlign: 'center'
  },
  titleText1: {
    color: Colors.white
  },
  titleText2: {
    color: Colors.white
  },
  titleText3: {
    color: Colors.white
  },
  titleText4: {
    color: Colors.blackText
  },
  titleText5: {
    color: Colors.lightBlue1
  },
  titleText6: {
    color: Colors.white
  },
  addColumn: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  addImg: {
    width: Math.round(Dimensions.get('window').width * 0.0416),
    height: Math.round(Dimensions.get('window').height * 0.0192),
    resizeMode: 'contain'
  },
  addText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Bold'
      },
      android: {
        fontFamily: 'Roboto-Bold'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height14,
    textAlign: 'center',
    paddingRight: 5
  },
  addText1: {
    color: Colors.white
  },
  addText2: {
    color: Colors.white
  },
  addText3: {
    color: Colors.white
  },
  addText4: {
    color: Colors.blackText
  },
  addText5: {
    color: Colors.white
  },
  addText6: {
    color: Colors.blackText
  }
});
