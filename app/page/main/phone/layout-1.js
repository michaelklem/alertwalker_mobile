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
import { MyButton } from '../../../component/myButton';
import { SearchBar } from '../../../component/searchBar';
import { DrawingBoard } from '../../../component/drawingBoard';
import { Chat } from '../../../component/chat';
import { actions, RichEditor, RichToolbar } from '../../../component/editor';
import {AppText, Colors, Images, Styles} from '../../../constant';

const Layout1 = ({  isLoading,
                    user,
                    showAlert,
                    updateMasterState,
                    isRefreshing,
                    refresh,
                    renderContact,
                    contacts,
                    chat,
                    activeMode,
                    searchText,
                    updateSearchText,
                    deepLink,
                    chatRef,
                    conversations,
                    calls,
                    renderConversation,
                    renderCall,
                  }) =>
{
  return (
  <View
    style={[styles.container]}
  >
    {isLoading &&
    <ActivityIndicator
      size="large"
      color={Colors.burnoutGreen}
      animating={isLoading}
      style={Styles.loading}
    />}

    {!chat.isOpen &&
    <View style={styles.activeModeRow}>
      <MyButton
        onPress={() =>
        {
          updateMasterState({ activeMode: 'chats' });
        }}
        buttonStyle={activeMode === 'chats' ? styles.activeModeContainerActive : styles.activeModeContainerInactive}
        titleStyle={styles.activeModeBtnText}
        title={AppText.phonePage.layout1.chats.text}
      />
      <MyButton
        onPress={() =>
        {
          updateMasterState({ activeMode: 'calls' });
        }}
        buttonStyle={activeMode === 'calls' ? styles.activeModeContainerActive : styles.activeModeContainerInactive}
        titleStyle={styles.activeModeBtnText}
        title={AppText.phonePage.layout1.calls.text}
      />
    </View>}

      {!chat.isOpen &&
      (contacts.length > 0 || searchText !== '') &&
      <View style={[styles.searchRow, { marginBottom: conversations.length > 0 && !chat.isOpen ?
                                                      Math.round(Dimensions.get('window').height * 0.0128) :
                                                      '' } ]}>
        <SearchBar
          id='searchText'
          layout={3}
          placeholder={AppText.phonePage.layout1.search.text}
          updateMasterState={(id, value) =>
          {
            updateSearchText(value);
          }}
          value={searchText}
        />
      </View>}

      {!chat.isOpen &&
      conversations.length > 0 &&
      <View style={styles.conversationsContainer}>
        <FlatList
          data={activeMode === 'chats' ? conversations : calls}
          horizontal={true}
          numColumns={1}
          scrollEnabled={true}
          keyExtractor={item => item._id.toString()}
          renderItem={(item, index) =>
          {
            return activeMode === 'chats' ? renderConversation(item, index) : renderCall(item, index)
          }}
          style={styles.conversationList}
        />
      </View>
      }

      {contacts.length === 0 &&
      !searchText &&
      !chat.isOpen &&
      <Text style={styles.noNotes}>{AppText.phonePage.layout1.noChats.text}</Text>}

      {contacts.length > 0 &&
      !chat.isOpen &&
      <View style={[styles.notesContainer, {flex: 1},
                                            { marginTop: (conversations.length > 0 && !chat.isOpen) ? Math.round(Dimensions.get('window').height * 0.0128) : 0} ]}>
        <FlatList
          data={contacts}
          numColumns={1}
          onRefresh={() => refresh()}
          refreshing={isRefreshing}
          scrollEnabled={true}
          keyExtractor={item => item._id.toString()}
          renderItem={(item, index) => renderContact(item, index)}
          style={styles.notesList}
        />
      </View>}

    {chat.isOpen &&
    <Chat
      ref={chatRef}
      component={chat}
      deepLink={deepLink}
      updateMasterState={(state) =>
      {
        let component = {...chat};
        let keys = Object.keys(state);
        for(let i = 0; i < keys.length; i++)
        {
          component[keys[i]] = state[keys[i]];
        }
        updateMasterState({ chat: component });
      }}
      showAlert={showAlert}
      user={user}
    />}

  </View>
  );
};

const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height16 = Math.round(Dimensions.get('window').height * 0.0205);
const tenWidth = Math.round(Dimensions.get('window').width * 0.027);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkBlue2,
    marginTop: Math.round(Dimensions.get('window').height * 0.035),
    paddingBottom: Math.round(Dimensions.get('window').height * 0.035),
    width: Math.round(Dimensions.get('window').width),
    height: '100%',
  },
  activeModeRow: {
    flexDirection: 'row',
    width: Math.round(Dimensions.get('window').width),
    height: Math.round(Dimensions.get('window').height * 0.05),
    backgroundColor: Colors.transparent,
    justifyContent: 'space-around',
  },
  activeModeBtnText: {
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
    fontSize: height18,
    textAlign: 'center',
    color: Colors.white,
    alignSelf: 'center',
  },
  activeModeContainerActive: {
    width: Math.round(Dimensions.get('window').width * 0.5),
    height: '100%',
    justifyContent: 'center',
    backgroundColor: Colors.phonePage.activeMode
  },
  activeModeContainerInactive: {
    width: Math.round(Dimensions.get('window').width * 0.5),
    height: '100%',
    justifyContent: 'center',
    backgroundColor: Colors.phonePage.inactiveMode
  },
  searchRow: {
    width: Math.round(Dimensions.get('window').width),
    height: Math.round(Dimensions.get('window').height * 0.0512),
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkBlue2,
  },
  noNotes: {
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
    fontSize: height18,
    marginTop: height16,
    textAlign: 'center',
    color: Colors.white,
  },
  notesList: {
    width: Math.round(Dimensions.get('window').width),
    backgroundColor: Colors.white,
  },
  notesContainer: {
    width: Math.round(Dimensions.get('window').width),
    height: Math.round(Dimensions.get('window').height * 0.48),
    backgroundColor: Colors.white,
  },
  conversationsContainer: {
    width: Math.round(Dimensions.get('window').width),
    height: Math.round(Dimensions.get('window').height * 0.157),
    backgroundColor: Colors.transparent,
  },
  conversationList: {
    width: Math.round(Dimensions.get('window').width),
    backgroundColor: Colors.transparent,
  }
});

export default Layout1;
