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

import { SearchBar } from '../../../component/searchBar';
import { ImageButton } from '../../../component/imageButton';
import { LayoverMenu } from '../../../component/layoverMenu';
import { MyButton } from '../../../component/myButton';
import {AppText, Colors, Images, Styles} from '../../../constant';

const Layout1 = ({  isLoading,
                    menu,
                    user,
                    results,
                    showAlert,
                    updateMasterState,
                    renderResult,
                    searchText,
                    updateSearchText
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

    {menu.isOpen &&
    <LayoverMenu
      title={AppText.searchPage.layout1.layoverMenuTitle.text}
      options={menu.options}
      selectedIndex={menu.selectedIndex}
      onSelect={(selected) =>
      {
        let tempMenu = {...menu};
        tempMenu.selectedIndex = selected;
        tempMenu.isOpen = false;
        updateMasterState({ menu: tempMenu });
      }}
      onClose={() =>
      {
        let tempMenu = {...menu};
        tempMenu.isOpen = false;
        updateMasterState({ menu: tempMenu });
      }}
      showTopLeftIcon={menu.showTopLeftIcon}
    />}

    <View style={styles.searchRow}>
      <SearchBar
        id='searchText'
        layout={2}
        placeholder={AppText.phonePage.layout1.search.text}
        updateMasterState={(id, value) =>
        {
          updateSearchText(value);
        }}
        value={searchText}
      />
    </View>

    <View style={styles.filterRow}>
      <View style={styles.filterText}>
        <Text style={styles.text}>{AppText.searchPage.layout1.layoverMenuTitle.text}</Text>
        <Text style={styles.selectedText}>{menu.selectedIndex !== -1 ? menu.options[menu.selectedIndex].title : ''}</Text>
      </View>
      <TouchableOpacity
        style={styles.downArrow}
        onPress={() =>
        {
          let tempMenu = {...menu};
          tempMenu.isOpen = true;
          updateMasterState({ menu: tempMenu });
        }}
      >
        <Image
          style={[styles.downArrow]}
          source={Images.downArrow}
        />
      </TouchableOpacity>
    </View>

    {results.length === 0 &&
    <Text style={styles.noNotes}>{AppText.searchPage.layout1.noResults.text}</Text>}

    {results.length > 0 &&
    <View style={styles.notesContainer}>
      <FlatList
        data={results}
        numColumns={1}
        scrollEnabled={true}
        keyExtractor={item => item._id.toString()}
        renderItem={(item, index) => renderResult(item, index)}
        style={styles.notesList}
      />
    </View>}

  </View>
  );
};

const height5 = Math.round(Dimensions.get('window').height * 0.00641);
const height14 = Math.round(Dimensions.get('window').height * 0.01794);
const height16 = Math.round(Dimensions.get('window').height * 0.02051);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height36 = Math.round(Dimensions.get('window').height * 0.04615);
const width16 = Math.round(Dimensions.get('window').width * 0.04266);
const width20 = Math.round(Dimensions.get('window').width * 0.0533);
const width28 = Math.round(Dimensions.get('window').width * 0.07466);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.darkBlue2,
    marginTop: Math.round(Dimensions.get('window').height * 0.035),
    paddingBottom: Math.round(Dimensions.get('window').height * 0.035),
    width: '100%',
    height: '100%',
  },
  filterRow: {
    flexDirection: 'row',
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.05),
    backgroundColor: Colors.lightBlue1,
    justifyContent: 'space-between',

    paddingHorizontal: width28,
  },
  filterText: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  text: {
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
    fontSize: height14,
    textAlign: 'center',
    color: Colors.white,
    alignSelf: 'flex-end',
    marginBottom: height5,
  },
  selectedText: {
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
    color: Colors.white,
    alignSelf: 'flex-end',
    marginBottom: height5,
  },
  downArrow: {
    width: Math.round(Dimensions.get('window').width * 0.0416),
    height: Math.round(Dimensions.get('window').height * 0.0192),
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    marginBottom: height5 * 2,
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
  typeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: width16,
    marginTop: height16,
  },
  typeActive: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height18,
    textAlign: 'left',
    color: Colors.white,
  },
  typeInactive: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height14,
    marginLeft: width16,
    textAlign: 'left',
    opacity: 0.2,
    color: Colors.white,
  },
  noteType: {
    marginLeft: width20,
  },
  templateIcon: {
    width: Math.round(Dimensions.get('window').width * 0.033),
    height: Math.round(Dimensions.get('window').height * 0.01),
    resizeMode: 'contain',
    alignSelf: 'flex-start',
    marginBottom: height5,
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
    fontSize: height36,
    textAlign: 'left',
    color: Colors.notesPage.title,
    marginLeft: width20,
  },
  backArrow: {
    width: Math.round(Dimensions.get('window').width * 0.041),
    height: Math.round(Dimensions.get('window').height * 0.019),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  backArrowContainer: {
    width: Math.round(Dimensions.get('window').width * 0.1),
    height: Math.round(Dimensions.get('window').height * 0.025),
    alignSelf: 'center',
  },
  bottomBtn: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.loginContainer.emailLoginBtn,
    justifyContent: 'center',
  },
  bottomBtnText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: height18,
    textAlign: 'center',
    marginLeft: width16,
    color: Colors.white,
  },
  notesList: {
    width: Math.round(Dimensions.get('window').width),
    backgroundColor: Colors.white,
  },
  notesContainer: {
    width: Math.round(Dimensions.get('window').width),
    flex: 1,
    backgroundColor: Colors.white,
  },
  searchRow: {
    width: Math.round(Dimensions.get('window').width),
    height: Math.round(Dimensions.get('window').height * 0.0512),
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkBlue2,
  },
});

export default Layout1;
