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

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
    <KeyboardAvoidingView style={styles.innerContainer}>
      <KeyboardAwareScrollView contentContainerStyle={[styles.inner]}>

        {isLoading &&
        <ActivityIndicator
          size="large"
          color={Colors.burnoutGreen}
          animating={isLoading}
          style={Styles.loading}
        />}

        {notifications.length > 0 &&
        <FlatList
          data={notifications}
          numColumns={1}
          scrollEnabled={true}
          keyExtractor={item => item._id.toString()}
          renderItem={(item, index) => renderNotification(item.item, index)}
        />}

        {notifications.length === 0 &&
        <Text style={styles.noNotes}>{AppText.notificationsPage.layout1.noNotifications.text}</Text>}

      </KeyboardAwareScrollView>
    </KeyboardAvoidingView>
  );
};


const height16 = Math.round(Dimensions.get('window').height * 0.02051);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
  },
  innerContainer: {
    backgroundColor: Colors.separatorGray,
    flex: 1,
    justifyContent: 'flex-start',
  },
  inner: {
    justifyContent: 'flex-start',
    flex: 1,
    marginTop: 10,
  },
 conversationContent: {
   flex: 1,
   flexDirection: 'row',
   justifyContent: 'flex-start',
 },
 noNotes: {
  fontSize: height18,
  marginTop: height16,
  textAlign: 'center',
  color: Colors.white,
},
});

export default Layout1;
