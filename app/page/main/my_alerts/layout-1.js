import React, {useState} from 'react';
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

import {AppText, Colors, Images, Styles} from '../../../constant';
import {DEFAULT_LAT_DELTA, DEFAULT_LNG_DELTA, MARKER_DEFAULT_COLOR} from '../../../constant/App'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { FilterModal } from '../../../component/myAlertsFilter';

// sticky header 
// https://reactnativeforyou.com/how-to-make-header-of-flatlist-sticky-in-react-native/


const Layout1 = ({  isLoading,
                    user,
                    showAlert,
                    updateMasterState,
                    notifications,
                    renderNotification,
                  }) =>
{
  const [modalVisible, setModalVisible] = useState(false);


  function renderFilterModal()
  {
    return (
      <FilterModal
        onClose={() =>
        {
          setModalVisible(!modalVisible)
        }}
      />
    );
  }

  const h20 = Math.round(Dimensions.get('window').height * 0.0256);

  function header (){
    return(
      <View style={styles.headerStyle}>
        {modalVisible && renderFilterModal()}

        <Text style={styles.titleStyle}>My Alerts</Text>

        <TouchableOpacity 
          style={styles.touchable}
          onPress={() => setModalVisible(!modalVisible)}
        >
          <FontAwesomeIcon
            style={styles.cogStyle}
            color={'white'}
            icon={ faCog }
            size={h20}
          />
        </TouchableOpacity>
      </View>
      );
  }

  return (
      <>
        {notifications.length === 0 &&
          <SafeAreaView style={styles.noNotificationsContainer}>
            <Text style={styles.top}>{'No alerts have been created yet.'}</Text>
          </SafeAreaView>
        }

        {notifications.length > 0 &&  
          <SafeAreaView 
            style={styles.innerContainer}
            >
            <FlatList
              ListHeaderComponent={header}
              stickyHeaderIndices={[0]}
              data={notifications}
              numColumns={1}
              keyExtractor={item => item._id.toString()}
              renderItem={(item, index) => renderNotification(item.item, index)}
            />
          </SafeAreaView>
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

  headerStyle: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    width: '100%',
    backgroundColor: MARKER_DEFAULT_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleStyle: {
    color: 'white',
    fontSize:20
  },
  cogStyle: {
  },
  touchable: {
    left:'300%',
  }
});

export default Layout1;
