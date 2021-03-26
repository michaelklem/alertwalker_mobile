import React from 'react';
import {
  Animated,
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  View,
  Image,
  Text,
  TextInput,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icon from "react-native-vector-icons/MaterialIcons";

import { MyButton } from '../../../../component/myButton';
import { ImageButton } from '../../../../component/imageButton';
import { FormInput } from '../../../../component/formInput';
import { CommentContainer } from '../../../../component/comment';
import { AppText, Colors, Styles } from '../../../../constant';
import { Timer } from '../../../../component/timer';
import More from './more';

import {getMinutesApart, formatDateOnly} from '../../../../helper/datetime';

const Layout1 = ({  isLoading,
                    detail,
                    customDetails,
                    updateMasterState,
                    commentText,
                    commentFieldAnimation,
                    performAction,
                    userId,
                    subCommentText,
                    activeCellIdx,
                    activeCellId,
                    nestedComments,
                    commentsEnabled,
                    toggleCommentKeyboard,
                    moreDetailVisible,
                  }) =>
{
  console.log(customDetails);

  let forUserName = detail.ownerStance === 'for' ? (detail.owner?.name ?? '') : (detail.opponent?.name ?? '');
  let againstUserName =  detail.ownerStance === 'against' ? (detail.owner?.name ?? '') : (detail.opponent?.name ?? '');

  // Setup challenger name
  if(!detail.opponent && customDetails.pushNotificationPendingInviteFromOther)
  {
    if(detail.ownerStance === 'against')
    {
      if(againstUserName !== customDetails.pushNotificationPendingInviteFromOther.triggeredByUser.name)
      {
        forUserName = customDetails.pushNotificationPendingInviteFromOther.triggeredByUser.name + '?';
      }
    }
    else
    {
      if(forUserName !== customDetails.pushNotificationPendingInviteFromOther.triggeredByUser.name)
      {
        againstUserName = customDetails.pushNotificationPendingInviteFromOther.triggeredByUser.name + '?';
      }
    }
  }

  // If no winner yet figure out how much longer debate will run for
  let minutesTilFinish = 0;
  if(detail.winner === "")
  {
    let startedOn = new Date(detail.startedOn);
    let endsOn = new Date(detail.startedOn);
    endsOn.setTime(startedOn.getTime() + (24*60*60*1000));
    minutesTilFinish = getMinutesApart(new Date(), endsOn);
    minutesTilFinish = (minutesTilFinish < 0 ? 0 : minutesTilFinish);
  }

  // Handle winner styling
  let winnerStyle = "";
  let winnerText = "";
  if(detail.winner === "owner")
  {
    winnerStyle = detail.ownerStance === "for" ? styles.forNameText : styles.againstNameText;
    winnerText = detail.ownerStance === "for" ? forUserName : againstUserName;
  }
  else if(detail.winner === "opponent")
  {
    winnerStyle = detail.ownerStance === "for" ? styles.againstNameText : styles.forNameText;
    winnerText = detail.ownerStance === "for" ? againstUserName : forUserName;
  }

  // Display detail
  if(!moreDetailVisible)
  {
    return (
    <KeyboardAwareScrollView style={[{backgroundColor: Colors.cAccordionRowInactive}, Styles.fullScreen, Styles.contentContainer]}>
      <View style={Styles.sideMarginsFivePercent}>
        <ActivityIndicator
          size="large"
          color={Colors.burnoutGreen}
          animating={isLoading}
          style={Styles.loading}
        />

        <View style={[Styles.row]}>
          <Text style={[styles.nameText, styles.forNameText]} adjustsFontSizeToFit={true}>{forUserName}</Text>
          <Text style={[styles.nameText, styles.vsText]} adjustsFontSizeToFit={true}>{AppText.pDetailVsText}</Text>
          <Text style={[styles.nameText, styles.againstNameText]} adjustsFontSizeToFit={true}>{againstUserName}</Text>
        </View>

        <Text style={[Styles.subjectText, {fontSize: 42}, {height: Math.round(Dimensions.get('window').height * 0.09)}]} adjustsFontSizeToFit={true} numberOfLines={2}>{detail.subject}</Text>

        <View style={[Styles.row, {marginTop: 15}]}>
          <View style={{flex: 0.2}} />
          <ImageButton
            titleStyle={styles.linkImg}
            imgSrc={require('../../../../asset/link.png')}
            onPress={(val) => updateMasterState('moreDetailVisible', !moreDetailVisible)}
          />
          <Text style={styles.customIdText} adjustsFontSizeToFit={true}>{`/${detail.customId}`}</Text>
        </View>
      </View>

      <View style={[Styles.row, styles.statsRow]}>
        <View style={[Styles.column, styles.block, styles.leftBlock]}>
          {customDetails.ourStance === 1 && <Text style={styles.yourStanceForText}>{AppText.pDetailYourStanceText}</Text>}
          <ImageButton
            titleStyle={styles.thumbImage}
            onPress={() => performAction({ action: 'vote', id: detail._id, value: 1 })}
            imgSrc={require('../../../../asset/forThumb.png')}
          />
          <Text style={styles.likeNumberText} adjustsFontSizeToFit={true} numberOfLines={1}>{customDetails.likes}</Text>
          <Text style={styles.stanceLabelText} adjustsFontSizeToFit={true} numberOfLines={1}>{AppText.pDetailForText}</Text>
        </View>
        <View style={[Styles.column, styles.block, styles.centerBlock]}>
          {detail.winner === "" && detail.opponent &&
            <Timer totalMinutes={minutesTilFinish} isActive={true} textStyle={styles.timeText}/>
          }

          {winnerText !== '' &&
            <View style={Styles.column}>
              <Text style={[styles.nameText, winnerStyle]} adjustsFontSizeToFit={true} numberOfLines={1}>{winnerText}</Text>
              <Text style={[Styles.subjectText, styles.wonText]} adjustsFontSizeToFit={true} allowFontScaling={true} numberOfLines={1}>{AppText.pDetailWonText}</Text>
            </View>
          }
          {winnerText === '' &&
          !customDetails.pushNotificationPendingInviteFromUs  &&
          !customDetails.pushNotificationPendingInviteFromOther &&
          !detail.opponent &&
          detail.isOpenToPublic &&
          detail.owner._id.toString() !== userId.toString() &&
            <MyButton
              onPress={() => performAction({ action: 'invite', id: detail._id, value: 0 })}
              title={AppText.pDetailChallengeText}
              titleStyle={[Styles.authSubmitBtnText, {marginBottom: 5}]}
            />
          }
          {winnerText === '' && customDetails.pushNotificationPendingInviteFromUs && !detail.opponent &&
            <Text style={[Styles.subjectText, styles.wonText]} adjustsFontSizeToFit={true} allowFontScaling={true} numberOfLines={2}>{AppText.pDetailWaitingForResponseText}</Text>
          }
          {winnerText === '' && customDetails.pushNotificationPendingInviteFromOther && !detail.opponent &&
          <View>
            <MyButton
              onPress={() => performAction({ action: 'respondToNotification', id: detail._id, value: 1, pushNotification: customDetails.pushNotificationPendingInviteFromOther })}
              title={AppText.pDetailAcceptText}
              titleStyle={[Styles.authSubmitBtnText]}
            />
            <MyButton
              onPress={() => performAction({ action: 'respondToNotification', id: detail._id, value: -1, pushNotification: customDetails.pushNotificationPendingInviteFromOther })}
              title={AppText.pDetailDeclineText}
              titleStyle={[Styles.authSubmitBtnText]}
            />
          </View>
          }

          <View style={Styles.row}>
            <View styles={Styles.column}>
              <ImageButton
                titleStyle={styles.thumbImage}
                onPress={() => performAction({ action: 'vote-type', id: detail._id, value: 'brutal' })}
                imgSrc={customDetails.typeVote === 'brutal' ? require('../../../../asset/brutal.png') : require('../../../../asset/emptyBrutal.png')}
              />
              <Text style={styles.categoryTitleText}>{AppText.pDetailBrutalText}</Text>
            </View>
            <View styles={Styles.column}>
              <ImageButton
                titleStyle={styles.thumbImage}
                onPress={() => performAction({ action: 'vote-type', id: detail._id, value: 'funny' })}
                imgSrc={customDetails.typeVote === 'funny' ? require('../../../../asset/funniest.png') : require('../../../../asset/emptyFunniest.png')}
              />
              <Text style={styles.categoryTitleText}>{AppText.pDetailFunniestText}</Text>
            </View>
          </View>

        </View>
        <View style={[Styles.column, styles.block, styles.rightBlock]}>
          {customDetails.ourStance === -1 && <Text style={styles.yourStanceForText}>{AppText.pDetailYourStanceText}</Text>}
          <ImageButton
            titleStyle={styles.thumbImage}
            onPress={() => performAction({ action: 'vote', id: detail._id, value: -1 })}
            imgSrc={require('../../../../asset/againstThumb.png')}
          />
          <Text style={styles.likeNumberText} adjustsFontSizeToFit={true}>{customDetails.dislikes}</Text>
          <Text style={styles.stanceLabelText} adjustsFontSizeToFit={true}>{AppText.pDetailAgainstText}</Text>
        </View>
      </View>

      {commentsEnabled &&
      <Animated.View style={[Styles.commentTextFieldContainer, { height: commentFieldAnimation }]}>
        <TextInput
          value={commentText}
          style={Styles.commentTextField}
          underlineColorAndroid='transparent'
          onChangeText={(val) => updateMasterState('commentText', val)}
          placeholder={AppText.pDetailCommentPlaceholderText}
        />
        <View style={{flex: 0.1}}>
          <ImageButton
            titleStyle={Styles.commentIcon}
            onPress={() => performAction({ action: 'comment', id: detail._id, index: null, value: commentText, parent: null })}
            imgSrc={require('../../../../asset/commentIcon.png')}
          />
        </View>
      </Animated.View>}

      {commentsEnabled &&
      <View style={styles.commentContainer}>
        <CommentContainer
          comments={customDetails.comments}
          updateMasterState={updateMasterState}
          performAction={performAction}
          userId={userId}
          entityId={detail._id}
          activeCellIdx={activeCellIdx}
          activeCellId={activeCellId}
          subCommentText={subCommentText}
          nestedComments={nestedComments}
          toggleCommentKeyboard={toggleCommentKeyboard}
        />
      </View>}
    </KeyboardAwareScrollView>
    );
  }
  // Display more information on detail
  else
  {
    return (
      <More
        detail={detail}
      />);
  }
};

const styles = StyleSheet.create({
  yourStanceForText: {
    top: 5,
    left: 5,
    fontSize: 12,
    zIndex: 1,
    position: 'absolute',
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
  commentContainer: {
    backgroundColor: Colors.cAccordionDetailBg,
    height: '100%',// Math.round(Dimensions.get('window').height * 0.375),
  },
  wonText: {
    textAlignVertical: "center",
    textAlign: "center",
  },
  categoryTitleText: {
    color: Colors.separatorGray,
    fontSize: 12,
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
    })
  },
  timeText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 42,
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
    })
  },
  stanceLabelText: {
    color: Colors.white,
    fontSize: 19,
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
    })
  },
  centerBlock: {
    flex: 0.46,
  },
  leftBlock: {
    borderRightWidth: 2,
    flex: 0.27
  },
  rightBlock: {
    borderLeftWidth: 2,
    flex: 0.27
  },
  block: {
    borderColor: Colors.black,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeNumberText: {
    color: Colors.white,
    fontSize: 36,
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
    })
  },
  statsRow: {
    height: Math.round(Dimensions.get('window').height * 0.175),
    marginTop: 10,
  },
  thumbImage: {
    alignSelf: 'center',
    width:  Math.round(Dimensions.get('window').width * 0.105),
    height: Math.round(Dimensions.get('window').height * 0.045),
    resizeMode: 'contain',
  },
  customIdText: {
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
    }),
    flex: 0.6,
    color: Colors.cAccordionDetailBg,
    textAlign: 'left',
  },
  linkImg: {
    width: Math.round(Dimensions.get('window').width * 0.068),
    height: Math.round(Dimensions.get('window').height * 0.021),
    overflow: 'visible',
    resizeMode: 'contain',
    padding: 0,
    flex: 0.2,

  },
  forNameText: {
    color: Colors.orange,
    textAlign: 'right',
    flex: 0.45,
  },
  vsText: {
    color: Colors.vsTextColor,
    flex: 0.1,
    textAlign: 'center',
  },
  againstNameText: {
    color: Colors.purple,
    textAlign: 'left',
    flex: 0.45,
  },
  nameText: {
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
    }),
  }
});

export default Layout1;
