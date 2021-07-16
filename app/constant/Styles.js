'use strict';

import { Dimensions, Platform, StyleSheet } from 'react-native';
import Colors from './Colors';

const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height10 = Math.round(Dimensions.get('window').height * 0.01282);

export default StyleSheet.create({
  homeDetailContainer: {
    width: Math.round(Dimensions.get('window').width),
    backgroundColor: Colors.transparent,
    flex: 0.72,
  },
  loading: {
    position: 'absolute',
    left: '49%',
    top: '50%',
    width: '2%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  fullScreen: {
    width: '100%',
    height: '100%'
  },
  greenArrowBtn: {
    width: 54,
    height: 57,
    backgroundColor: Colors.burnoutGreen,
    borderRadius: 16,
  },
  forBar: {
    backgroundColor: Colors.orange,
    width: 5,
    height: '95%',
    borderRadius: 25,
  },
  centerContent: {
    justifyContent: 'center',
    flexDirection: 'row'
  },
  lastCommentPreviewText: {
    color: Colors.cAccordionArrowInactive,
    fontSize: 19,
    fontFamily: 'Times New Roman',
    paddingLeft: 5, // To account for for bar
  },
  detailRowHolder: {
    marginTop: height10,
    marginHorizontal: 5,
    flexDirection: 'row',
    flex: 1,
    height: Math.round(Dimensions.get('window').height * 0.2),
    justifyContent:'space-between',
    backgroundColor: Colors.transparent,
    width: '100%',
  },
  commentTextField: {
    flex: 0.9,
    paddingLeft: 10,
    paddingRight: 10,
    color: Colors.cAccordionArrowInactive,
    fontSize: 20,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
  },
  commentIcon: {
    height: '100%',
    paddingRight: 10,
    justifyContent: 'center',
  },
  saveBtn: {
    width: '100%',
    height: 57,
    backgroundColor: Colors.burnoutGreen,
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  pinnableScrollView: {
    flexGrow: 1,
    flexDirection: 'column',
    height: '100%',
  },
  column: {
    flexDirection: 'column',
  },
  pinnableScrollViewContent: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  pinToBottom: {
    justifyContent: 'flex-end',
  },
  rowSpaceBetween: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  rowLtr: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  rowOfContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  alignCenter: {
      alignItems:'center'
  },
  formInput: {
    marginTop: 22,
  },
  forgotPasswordBtnL2: {
    marginTop: Math.round(Dimensions.get('window').height * 0.03),
    textAlign: 'center',
    fontWeight: 'bold',
    color: Colors.white,
    fontSize: height18,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    })
  },
  forgotPasswordBtnL3: {
    textAlign: 'right',
    fontWeight: 'bold',
    color: Colors.descriptionGray,
    fontSize: height18,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    })
  },
  sectionTitle: {
    fontSize: 35,
    fontFamily: 'Arial',
    color: Colors.black,
    textAlign: 'center',
    height: 42,
    marginTop: 30,
  },
  sectionContainer: {
    marginLeft: Math.round(Dimensions.get('window').width * 0.10),
    marginRight: Math.round(Dimensions.get('window').width * 0.10),
    marginTop: Math.round(Dimensions.get('window').height * 0.03),
  },
  sideMargins: {
    marginLeft: Math.round(Dimensions.get('window').width * 0.10),
    marginRight: Math.round(Dimensions.get('window').width * 0.10),
  },
  sideMarginsFivePercent: {
    marginLeft: Math.round(Dimensions.get('window').width * 0.03),
    marginRight: Math.round(Dimensions.get('window').width * 0.03),
  },
  sideMarginsOnePercent: {
    marginLeft: Math.round(Dimensions.get('window').width * 0.01),
    marginRight: Math.round(Dimensions.get('window').width * 0.01),
  },
  settingsBtn: {
    width: 25,
    height: 25,
    alignContent: 'center',
    marginRight: 10,
    opacity: 0.4,
  },
  logoutBtn: {
    width: 25,
    height: 25,
    alignContent: 'center',
    marginRight: 10,
  },
  dicussionCellRow: {
    flexDirection: 'row',
    height: '50%',
    width: '100%',
  },
  discussionCellRowInner: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  discussionCellHeaderText: {
    color: Colors.cAccordionRowInactive,
    fontSize: 29,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontWeight: 'bold',
    height:  Math.round(Dimensions.get('window').height * 0.056),
  },
  discussionCellTextColumn: {
    width: '70%',
    backgroundColor: Colors.transparent,
    paddingLeft: 5, // To account for for bar
  },
  discussionCellImage: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  discussionCellSeparator: {
    backgroundColor: Colors.separatorGray,
    width: '95%',
    height: 2,
    borderRadius: 25,
    marginTop: height10,
  },
  discussionCellPictureColumn: {
    paddingLeft: 5, // To account for for bar
    width: '30%',
    height: '100%',
    backgroundColor: Colors.transparent,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  discussionCellAgainstBar: {
    backgroundColor: Colors.purple,
    width: 5,
    height: '95%',
    borderRadius: 25,
    alignSelf: 'flex-end',
    top: 0,
    position: 'absolute',
    right: -2,
  },
  discussionCellTimerText: {
    color: Colors.orange,
    fontWeight: 'bold',
    fontSize: 24,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    })
  },

  paper: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 4,
    padding: 20,
    backgroundColor: Colors.white,
    width:'96%'
  },
  paperNoPadding: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  navigationTitle:
  {
    fontFamily: 'Arial',
    color: Colors.almostBlack,
    fontSize: 14,
  },
  activityIndicator:
  {
    position: 'absolute',
    left: Math.round((Dimensions.get('window').width * 0.5) - 20),
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  backgroundColorFull:
  {
    backgroundColor: Colors.orange,
    height: Dimensions.get('window').height,
  },
  backgroundColor:
  {
    backgroundColor: Colors.orange,
  },
  transparentBackground:
  {
    backgroundColor: Colors.transparent,
  },
  classTitleText:
  {
    color: Colors.white,
    fontFamily: 'Arial',
    fontSize: 14,
    alignSelf: 'center',
  },
  classTitleBtn: {
    width: 25,
    height: 25,
    alignContent: 'center',
    marginRight: 10,
  },
  flexContainer:
  {
    flex: 1,
  },
  activeTabBarBtn:
  {
    color: Colors.white,
    backgroundColor: Colors.lightBlue1,
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
    fontSize: height10,
    textAlign: 'center',
  },
  contentContainer:
  {
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: 'column'
  },
  inactiveTabBarBtn:
  {
    color: Colors.white,
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
    fontSize: height10,
    textAlign: 'center',
  },

  authWelcomeText: {
    marginTop: height10,
    fontSize: 42,
    color: Colors.white,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    })
  },
  authSubWelcomeText: {
    fontSize: 22,
    color: Colors.white,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    })
  },
  authRememberMeBtn: {
    opacity: 0.31,
    alignSelf: 'flex-end',
    color: Colors.white,
    marginRight: 10,
    fontSize: 22,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    })
  },
  authSubmitBtn: {
    backgroundColor : Colors.white,
    borderRadius : 35,
    paddingVertical: 14,
    marginTop: Math.round(Dimensions.get('window').height * 0.04),
  },
  authSubmitBtnText: {
    fontWeight : 'bold',
    fontSize : 28,
    textAlign: 'center',
    color: Colors.lightBlue,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    })
  },
  authLogo: {
    width: Math.round(Dimensions.get('window').width * 0.28),
    height: Math.round(Dimensions.get('window').height * 0.07),
  },
  authCircle: {
    borderWidth: 1,
    borderRadius: 25,
    width: 25,
    height: 25,
    borderColor: Colors.white,
    opacity: 0.31,
  },
  authCheck: {
    width: 25,
    height: 25,
    opacity: 0.31,
  },
  authBottomBtn: {
    fontWeight: 'bold',
    fontSize : height18,
    textAlign: 'right',
    color: Colors.descriptionGray,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    })
  },
  authBottomText: {
    fontWeight: 'bold',
    fontSize : height18,
    textAlign: 'left',
    color: Colors.descriptionGray,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    })
  },

  againstTriangle: {
    backgroundColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'red',
    borderRightWidth: Math.round(Dimensions.get('window').width * 0.3),
    borderTopWidth: Math.round(Dimensions.get('window').width * 0.3)
  },
  makeForTriangle: {
    transform: [
      {rotate: '180deg'}
    ]
  },

  againstText: {
    color: Colors.cAccordionRowInactive,
    fontWeight: 'bold',
    fontSize: 12,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    })
  },
  forName: {
    color: Colors.orange,
    fontWeight: 'bold',
    marginBottom: 1,
    fontSize: 12,
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    })
  },
  previewText: {
    color: Colors.cAccordionArrowInactive,
    fontSize: 19,
    fontFamily: 'Times New Roman',
  },
  subjectText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    color: Colors.white,
    textAlign: 'center',
  },
  skipText: {
    color: Colors.purple,
    fontSize: height18,
    fontWeight: 'bold',
    textAlign: 'center',
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
  },
  date: {
    color: '#9b9da0',
  },
  name: {
    ...Platform.select({
      ios: {
        fontFamily: 'Arial'
      },
      android: {
        fontFamily: 'Roboto'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize:12
  },
  nameAndDateHolder: {
    marginLeft: 10,
    width: '90%',
  },
  loadingLogo: {
    width: Math.round(Dimensions.get('window').width * 0.5),
    height: Math.round(Dimensions.get('window').height * 0.25),
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  userPhotoImgSmall: {
    width: Math.round(Dimensions.get('window').width * 0.1),
    height: Math.round(Dimensions.get('window').width * 0.1),
    borderRadius: Math.round(Dimensions.get('window').width * 0.33) / 2,
    borderWidth: 1,
    borderColor: Colors.cAccordionArrowInactive,
  },
  tabBarIcon: {
    width: Math.round(Dimensions.get('window').width * 0.05),
    height: Math.round(Dimensions.get('window').height * 0.023),
    overflow: 'visible',
    resizeMode: 'contain',
    padding: 0,
  }
});
