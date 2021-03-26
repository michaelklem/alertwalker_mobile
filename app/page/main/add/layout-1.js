import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  Text,
  FlatList,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { ImageButton } from '../../../component/imageButton';
import { LayoverMenu } from '../../../component/layoverMenu';
import { MyButton } from '../../../component/myButton';
import { Map } from '../../../component/map';
import {AppText, Colors, Images, Styles} from '../../../constant';

const Layout1 = ({  isLoading,
                    user,
                    showAlert,
                    updateMasterState,
                    navigation,
                  }) =>
{
  return (
  <KeyboardAwareScrollView
    contentContainerStyle={styles.container}
  >
    {isLoading &&
    <ActivityIndicator
      size="large"
      color={Colors.burnoutGreen}
      animating={isLoading}
      style={Styles.loading}
    />}

    <Map
      updateMasterState={updateMasterState}
      showAlert={showAlert}
      createMode={true}
      navigation={navigation}
    />

  </KeyboardAwareScrollView>
  );
};

const height5 = Math.round(Dimensions.get('window').height * 0.00641);
const height14 = Math.round(Dimensions.get('window').height * 0.01794);
const width28 = Math.round(Dimensions.get('window').width * 0.0746);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height16 = Math.round(Dimensions.get('window').height * 0.02051);
const width20 = Math.round(Dimensions.get('window').width * 0.0533);
const width16 = Math.round(Dimensions.get('window').width * 0.04266);
const width36 = Math.round(Dimensions.get('window').width * 0.096);

const styles = StyleSheet.create({
  container: {
    width: Math.round(Dimensions.get('window').width),
    height: '100%',
  },
});

export default Layout1;
