import React from 'react';
import {
  TouchableOpacity,
  TextInput,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  View,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { AppText, Colors, Images, Styles } from '../../../../constant';
import Day from './day';
import { LayoverMenu } from '../../../../component/layoverMenu';
import { ImageButton } from '../../../../component/imageButton';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const Layout1 = ({  isLoading,
                    fitnessLog,
                    fitnessLogs,
                    updateMasterState,
                    renderLog,
                    isRefreshing,
                    refresh,
                    sortMenu,
                    schemaFields,
                    headerMgr,
                    save,
                }) =>
{

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainerStyle}
      style={styles.container}
    >

      <ActivityIndicator
        size="large"
        color={Colors.burnoutGreen}
        animating={isLoading}
        style={Styles.loading}
      />

      {sortMenu.isOpen &&
      <LayoverMenu
        title={AppText.notesPage.layout1.layoverMenuTitle}
        options={sortMenu.options}
        selectedIndex={sortMenu.selectedIndex}
        onSelect={(selected) =>
        {
          let tempMenu = {...sortMenu};
          tempMenu.selectedIndex = selected;
          tempMenu.isOpen = false;
          updateMasterState({ sortMenu: tempMenu });
        }}
        onClose={() =>
        {
          let tempMenu = {...sortMenu};
          tempMenu.isOpen = false;
          updateMasterState({ sortMenu: tempMenu });
        }}
      />}

      {!fitnessLog &&
      <View style={styles.filterRow}>
        <View style={styles.filterText}>
          <Text style={styles.text}>{AppText.mealPage.filterText}</Text>
          <Text style={styles.selectedText}>{sortMenu.selectedIndex !== -1 ? sortMenu.options[sortMenu.selectedIndex].title : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.downArrow}
          onPress={() =>
          {
            let tempMenu = {...sortMenu};
            tempMenu.isOpen = true;
            updateMasterState({ sortMenu: tempMenu });
          }}
        >
          <Image
            style={[styles.downArrow]}
            source={Images.downArrow}
          />
        </TouchableOpacity>
      </View>}

      {fitnessLog &&
      <View style={[styles.typeRow, { alignItems: 'center' }]}>
        <ImageButton
          imgSrc={Images.backArrow}
          imageStyle={styles.backArrow}
          titleStyle={styles.backArrowContainer}
          onPress={async() =>
          {
            await save();
            headerMgr.show('right');
          }}
        />
        <TextInput
          value={fitnessLog.title}
          style={styles.titleText}
          underlineColorAndroid='transparent'
          placeholder={AppText.notesPage.layout1.titlePlaceHolder}
          placeholderTextColor={Colors.notesPage.title}
          onChangeText={(title) =>
          {
            const log = {...fitnessLog};
            const titleSchemaField = (schemaFields ? schemaFields : []).filter(schemaField => schemaField.name === 'title');
            if(titleSchemaField.length > 0 && titleSchemaField[0].maxLength < title.length)
            {
              this.props.showAlert('Uh-oh', 'Your title is too long');
              return;
            }
            log.title = title;
            updateMasterState({ fitnessLog: log });
          }}
          editable={true}
          multiline={true}
        />
      </View>}

      {fitnessLog &&
      days.map( (day, i) =>
      {
        return (
          <Day
            title={AppText.mealPage[day]}
            data={fitnessLog[day]}
            onUpdate={nv => updateMasterState({ fitnessLog: { ...fitnessLog, [day]: nv }})}
          />
        )
      })}

      {((!fitnessLogs && !fitnessLog) ||
      (fitnessLogs && fitnessLogs.length === 0 && !fitnessLog)) &&
      <Text style={styles.noLogs}>{AppText.fitnessPage.noLogs}</Text>}

      {fitnessLogs &&
      fitnessLogs.length > 0 &&
      !fitnessLog &&
      <View style={[styles.fitnessLogsContainer]}>
        <FlatList
          data={fitnessLogs}
          numColumns={1}
          onRefresh={() => refresh()}
          refreshing={isRefreshing}
          scrollEnabled={true}
          keyExtractor={item => item._id.toString()}
          renderItem={(item, index) => renderLog(item, index)}
          style={styles.fitnessLogsList}
        />
      </View>}

    </ScrollView>
  );
}

const height5 = Math.round(Dimensions.get('window').height * 0.00641);
const height14 = Math.round(Dimensions.get('window').height * 0.01794);
const height16 = Math.round(Dimensions.get('window').height * 0.02051);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height36 = Math.round(Dimensions.get('window').height * 0.04615);
const width16 = Math.round(Dimensions.get('window').width * 0.04266);
const width20 = Math.round(Dimensions.get('window').width * 0.0533);
const width28 = Math.round(Dimensions.get('window').width * 0.0746);

const styles = StyleSheet.create({
  contentContainerStyle: {
    justifyContent: 'flex-start',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.budget.background,
    paddingTop: Math.round(Dimensions.get('window').height * 0.04),
  },
  fitnessLogsList: {
    width: Math.round(Dimensions.get('window').width),
    backgroundColor: Colors.white,
  },
  fitnessLogsContainer: {
    width: Math.round(Dimensions.get('window').width),
    height: Math.round(Dimensions.get('window').height * 0.78),
    backgroundColor: Colors.white,
  },
  noLogs: {
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
    marginBottom: height5,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginLeft: width16,
    marginTop: height16,
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
    width: Math.round(Dimensions.get('window').width * 0.9) - width20,
  },
});

export default Layout1;
