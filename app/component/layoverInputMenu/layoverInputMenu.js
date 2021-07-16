import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  Modal,
  View
} from 'react-native';

import { Colors, Images } from '../../constant';
import { ImageButton } from '../imageButton';
import SubmitButton from './submitButton';
import { FormInput } from '../formInput';

class LayoverInputMenu extends React.Component
{
    constructor(props)
    {
        super(props);
        this.state = 
        {
            input: ''
        };
    }

    render()
    {
        return (
            <Modal
            animationType={'slide'}
            transparent={true}
            visible={true}
            style={styles.container}
            >
            <SafeAreaView style={styles.container}>
                <View style={styles.contentContainer}>
                    <View>
                        <View style={styles.titleRow}>
                            <Text style={styles.title}>
                                Add item to
                                <Text style={styles.altTitle}> {this.props.title}</Text>
                            </Text>
                            <ImageButton
                                titleStyle={styles.closeBtn}
                                imgSrc={Images.close}
                                onPress={this.props.onClose}
                            />
                        </View>
                        <FormInput
                            placeholder={this.props.placeholder}
                            containerStyle={1}
                            textInputStyle={3}
                            updateMasterState={(id, nv) => this.setState({ input: nv })}
                            value={this.state.input}
                        />
                    </View>
                    <SubmitButton onPress={() => this.props.onSubmit(this.state.input)} />
                </View>
            </SafeAreaView>
            </Modal>
        );
    }
};

const sideMargins = Math.round(Dimensions.get('window').width * 0.044);
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backgroundColor: Colors.black,
    opacity: 0.98,
  },
  contentContainer: {
    marginTop: sideMargins,
    flexDirection: 'column',
    justifyContent: 'space-between',
    flex: 1,
  },
  titleRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 25
  },
  titleText: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
  },
  title: {
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
    fontSize: 14,
    textAlign: 'center',
    color: Colors.white,
    marginLeft: sideMargins,
  },
  altTitle: {
    color: Colors.lightBlue1,
  },
  closeBtn: {
    width: Math.round(Dimensions.get('window').width * 0.1),
    height: Math.round(Dimensions.get('window').width * 0.1),
    marginRight: sideMargins,
    resizeMode: 'contain'
  }
});

export default LayoverInputMenu;
