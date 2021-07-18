import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  View,
  Image,
  Text,
  FlatList,
  KeyboardAvoidingView,
  ImageBackground,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';

import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';

import {AppText, Colors, Images, Styles} from '../../../constant';

const Layout1 = ({  isLoading,
                    user,
                    showAlert,
                    updateMasterState,
                    notifications,
                    renderNotification,
                  }) =>
{
  return (
      <>
        {notifications.length === 0 &&
          <View style={styles.noNotificationsContainer}>
            <Text style={styles.top}>{'No alerts have been received yet.'}</Text>
          </View>
        }

        {notifications.length > 0 &&  
          <KeyboardAvoidingView style={styles.innerContainer}>
            <KeyboardAwareFlatList
              data={notifications}
              numColumns={1}
              scrollEnabled={true}
              keyExtractor={item => item._id.toString()}
              renderItem={(item, index) => renderNotification(item.item, index)}
            />
          </KeyboardAvoidingView>
        }
    </>
  );
};


const height16 = Math.round(Dimensions.get('window').height * 0.02051);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const styles = StyleSheet.create({
  innerContainer: {
    backgroundColor: Colors.red,
    flex: 1,
    justifyContent: 'flex-start',
  },
  inner: {
    justifyContent: 'flex-start',
    flex: 1,
    marginTop: 10,
  },
  noNotificationsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    margin: 10,
    borderRadius:10,
    borderWidth:1,
    borderColor:'#ddd',
  },
  top: {
    fontSize: height18,
    flex: 0.5,
  },

});

export default Layout1;
