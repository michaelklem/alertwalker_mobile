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
import { DrawingBoard } from '../../../component/drawingBoard';
import { actions, RichEditor, RichToolbar } from '../../../component/editor';
import {AppText, Colors, Images, Styles} from '../../../constant';

const Layout1 = ({  editorInitialized,
                    isLoading,
                    note,
                    menu,
                    templates,
                    user,
                    notes,
                    onEditorInitialized,
                    showAlert,
                    textEditorRef,
                    drawingBoardRef,
                    cropViewRef,
                    drawingBoard,
                    updateMasterState,
                    addNote,
                    textEditorOnChange,
                    drawingBoardOnChange,
                    isRefreshing,
                    refresh,
                    titleOnChange,
                    selectTemplate,
                    selectedTemplateIndex,
                    openImagePicker,
                    openCamera,
                    openImagePickerWithCrop,
                    saveNote,
                    renderNote,
                    saveDrawing,
                    headerManager
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
      title={AppText.notesPage.layout1.layoverMenuTitle}
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
    />}


    <DrawingBoard
      visible={drawingBoard.isOpen}
      penColor={Colors.black}
      onChange={drawingBoardOnChange}
      onClose={() =>
      {
        const tempBoard = {...drawingBoard};
        tempBoard.isOpen = false;
        updateMasterState({ drawingBoard: tempBoard })
      }}
      onSave={() =>
      {
        saveDrawing();
      }}
      strokeWidth={2}
      ref={(r) => (drawingBoardRef = r)}
    />


    {!note.isOpen &&
    <View style={styles.filterRow}>
      <View style={styles.filterText}>
        <Text style={styles.text}>{AppText.notesPage.layout1.filterText}</Text>
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
    </View>}

    {notes.length === 0 &&
    !note.isOpen &&
    <Text style={styles.noNotes}>{AppText.notesPage.layout1.noNotes}</Text>}

    {notes.length > 0 &&
    !note.isOpen &&
    <View style={styles.notesContainer}>
      <FlatList
        data={notes}
        numColumns={1}
        onRefresh={() => refresh()}
        refreshing={isRefreshing}
        scrollEnabled={true}
        keyExtractor={item => item._id.toString()}
        renderItem={(item, index) => renderNote(item, index)}
        style={styles.notesList}
      />
    </View>}

    {true &&
    <KeyboardAwareScrollView>
      <View style={[styles.typeRow, (!note.isOpen || !note.isEditing) ? {display: 'none'} : '']}>
        <MyButton
          onPress={() =>
          {
            let tempNote = {...note};
            tempNote.isTemplate = true;
            updateMasterState({ note: tempNote });
          }}
          titleStyle={note.isTemplate ? styles.typeActive : styles.typeInactive}
          title={AppText.notesPage.layout1.templateCategory}
        />
        <MyButton
          onPress={() =>
          {
            let tempNote = {...note};
            tempNote.isTemplate = false;
            updateMasterState({ note: tempNote });
          }}
          titleStyle={[!note.isTemplate ? styles.typeActive : styles.typeInactive, styles.noteType]}
          title={AppText.notesPage.layout1.noteCategory}
        />
      </View>
      <View style={[styles.typeRow, (!note.isOpen || !note.isEditing) ? {display: 'none'} : '']}>
        <Text style={styles.typeActive}>{AppText.notesPage.layout1.templates}</Text>
      </View>
      <View style={[styles.typeRow, (!note.isOpen || !note.isEditing) ? {display: 'none'} : '']}>
        <View style={Styles.column}>
          {templates.map( (template, i) =>
          {
            return (
              <TouchableOpacity onPress={() => selectTemplate(i)}>
                <ImageButton
                  imgSrc={Images.templateIcon}
                  imageStyle={styles.templateIcon}
                  onPress={() => selectTemplate(i)}
                />
                <Text style={[i === selectedTemplateIndex ? styles.typeActive : styles.typeInactive ]}>{template.title}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      <View style={[styles.typeRow, { alignItems: 'center' }, !note.isOpen ? {display: 'none'} : '']}>
        <ImageButton
          imgSrc={Images.backArrow}
          imageStyle={styles.backArrow}
          titleStyle={styles.backArrowContainer}
          onPress={() =>
          {
            let tempNote = {...note};
            tempNote.isOpen = false;

            let notes2 = [...notes];
            let found = false;
            for(let i = 0; i < notes.length; i++)
            {
              console.log(notes2);
              if(notes2[i]._id.toString() === tempNote._id.toString())
              {
                found = true;
                break;
              }
            }

            if(!found)
            {
              addNote(tempNote);
            }
            updateMasterState({ note: tempNote });

            headerManager.show('right');
          }}
        />
        <TextInput
          value={note.title}
          style={styles.titleText}
          underlineColorAndroid='transparent'
          placeholder={AppText.notesPage.layout1.titlePlaceHolder}
          placeholderTextColor={Colors.notesPage.title}
          onChangeText={titleOnChange}
          multiline={true}
          editable={note.isEditing}
        />
      </View>

      <View style={!note.isOpen ? {display: 'none'} : ''}>
        {editorInitialized &&
        note.isEditing &&
        <RichToolbar
        	editor={textEditorRef}
          topActions={[
            actions.uploadImage,
            actions.captureImage,
            actions.drawImage,
            actions.cropImage,
            actions.uploadPdf,
            actions.editPdf
          ]}
        	bottomActions={[
            actions.setFont,
            actions.setFontSize,
            actions.insertBulletsList,
            actions.heading2,
        		actions.setBold,
        		actions.setItalic,
            actions.setUnderline,
        		//actions.insertOrderedList,
        		//actions.insertImage
        	]}
        	iconMap={{
        		customAction: Images.settingsIcon,
        	}}
        />}
        <RichEditor
          ref={textEditorRef}
          editorInitializedCallback={() => onEditorInitialized()}
          initialContentHTML={false ? `Hello <b>${user.firstName ? user.firstName : 'user'}</b> <p>what's on your mind?</p>` : ''}
          onChange={textEditorOnChange}
          openImagePicker={openImagePicker}
          editable={note.isEditing}
          openCamera={openCamera}
          openDrawingBoard={() =>
          {
            const tempBoard = {...drawingBoard};
            tempBoard.isOpen = true;
            updateMasterState({ drawingBoard: tempBoard });
          }}
          openImagePickerWithCrop={openImagePickerWithCrop}
          showAlert={showAlert}
          user={user}
          updateMasterState={updateMasterState}
          filePurpose={'note:' + note._id.toString()}
        />
        {note.isEditing &&
        <MyButton
          buttonStyle={styles.bottomBtn}
          titleStyle={styles.bottomBtnText}
          title={AppText.notesPage.layout1.saveBtn}
          onPress={async() =>
          {
            saveNote();
          }}
        />}
      </View>
    </KeyboardAwareScrollView>
    }

  </View>
  );
};

const height5 = Math.round(Dimensions.get('window').height * 0.00641);
const height11 = Math.round(Dimensions.get('window').height * 0.0141);
const height14 = Math.round(Dimensions.get('window').height * 0.01794);
const height15 = Math.round(Dimensions.get('window').height * 0.01923);
const height16 = Math.round(Dimensions.get('window').height * 0.02051);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height20 = Math.round(Dimensions.get('window').height * 0.0256);
const height30 = Math.round(Dimensions.get('window').height * 0.0384);
const height36 = Math.round(Dimensions.get('window').height * 0.04615);
const width16 = Math.round(Dimensions.get('window').width * 0.04266);
const width30 = Math.round(Dimensions.get('window').width * 0.08);
const width20 = Math.round(Dimensions.get('window').width * 0.0533);
const width28 = Math.round(Dimensions.get('window').width * 0.0746);

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
    marginBottom: height5,
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
    marginLeft: width16,
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
    width: Math.round(Dimensions.get('window').width * 0.9) - width20,
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
    height: Math.round(Dimensions.get('window').height * 0.78),
    backgroundColor: Colors.white,
  }
});

export default Layout1;
