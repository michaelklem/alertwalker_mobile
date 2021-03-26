import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Dimensions,
} from 'react-native';

import {  Image,  Defs, ClipPath, Svg, Polygon } from 'react-native-svg';

import Colors from '../../constant/Colors';
import Styles from '../../constant/Styles';

import {Timer} from '../timer';
import {getMinutesApart, formatDateOnly} from '../../helper/datetime';

const MyForCell = ({ data }) =>
{
  // Setup triangle images
  const height = parseInt(Math.round(Dimensions.get('window').height * 0.1));
  const width = parseInt(Math.round(Dimensions.get('window').width * 0.3));

  const roundedTopLeftBorderTopImg = '5 0, 4 1, 3 2, 2 3, 1 4, 0 5';
  const roundedTopRightBorderTopImg = `${width} 5, ${width - 1} 4, ${width - 2} 3, ${width - 3} 2, ${width - 4} 1, ${width - 5} 0`;
  let roundedBottomLeftBorderTopImg = `0 ${height - 18}, 1 ${height - 17}, 2 ${height - 16}, 3 ${height - 15}, 4 ${height - 14}, 5 ${height - 13}`;

  const roundedTopRightBorderBtmImg = `${width} 18, ${width - 1} 17, ${width - 2} 16, ${width - 3} 15, ${width - 4} 14, ${width - 5} 13`;
  const roundedBottomLeftBorderBtmImg = `0 ${height - 5}, 1 ${height - 4}, 2 ${height - 3}, 3 ${height - 2}, 4 ${height - 1}, 5 ${height}`;
  const roundedBottomRightBorderBtmImg = `${width - 5} ${height}, ${width - 4} ${height - 1}, ${width - 3} ${height - 2}, ${width - 2} ${height - 3}, ${width - 1} ${height - 4}, ${width} ${height - 5}`;

  // Figure out who we're battling
  const otherUser = data.positionKey === 'opponent' ? data['owner'] : data['opponent'];

  // Date times
  let minutesTilFinish = 0;
  let startedOn = new Date(data.startedOn);
  // If no winner yet figure out how much longer debate will run for
  if(data.winner === "")
  {
    let endsOn = new Date(data.startedOn);
    endsOn.setTime(startedOn.getTime() + (24*60*60*1000));
    minutesTilFinish = getMinutesApart(new Date(), endsOn);
    minutesTilFinish = (minutesTilFinish < 0 ? 0 : minutesTilFinish);
  }
  startedOn = '// ' + formatDateOnly(startedOn);

  // Handle winner styling
  let winnerStyle = "";
  let winnerText = "";
  if(data.winner === "owner")
  {
    winnerStyle = data.ownerStance === "for" ? Styles.forName : Styles.againstName;
    winnerText = data.ownerStance === "for" ? data[data.positionKey].name : otherUser.name;
  }
  else if(data.winner === "opponent")
  {
    winnerStyle = data.ownerStance === "for" ? Styles.againstName : Styles.forName;
    winnerText = data.ownerStance === "for" ? otherUser.name : data[data.positionKey].name;
  }
  const lastComment = data.lastComment ? data.lastComment.message : '';
  return(
    <View style={Styles.detailRowHolder}>

      <View style={Styles.forBar} />

      <View style={[Styles.column]}>

        <View style={[Styles.dicussionCellRow]}>
          <View style={Styles.discussionCellPictureColumn}>
            <View style={styles.bottomImage}>
              <Svg height={'100%'} width={'100%'}>
                <Defs>
                  <ClipPath id="clip">
                    <Polygon points={`${roundedTopLeftBorderTopImg}, ${roundedBottomLeftBorderTopImg}, ${roundedTopRightBorderTopImg}`} fill={Colors.black} />
                  </ClipPath>
                </Defs>
                <Image
                  href={{uri: data[data.positionKey].photo }}
                  clipPath="url(#clip)"
                  width="100%"
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  viewBox="0 0 100 100"
                />
              </Svg>
            </View>
            <View style={styles.bottomImage}>
              <Svg height={'100%'} width={'100%'}>
                <Defs>
                  <ClipPath id="clip">
                    <Polygon points={`${roundedBottomLeftBorderBtmImg}, ${roundedBottomRightBorderBtmImg}, ${roundedTopRightBorderBtmImg}`} fill={Colors.black} />
                  </ClipPath>
                </Defs>
                <Image
                  href={{uri: otherUser.photo }}
                  clipPath="url(#clip)"
                  width="100%"
                  height="100%"
                  preserveAspectRatio="xMidYMid slice"
                  viewBox="0 0 100 100"
                />
              </Svg>
            </View>
          </View>

          <View style={Styles.discussionCellTextColumn}>
            <Text style={Styles.discussionCellHeaderText} numberOfLines={2} adjustsFontSizeToFit={true}>{data.subject}</Text>
            <Text style={Styles.preview} numberOfLines={2} ellipsizeMode='tail'>{data.body}</Text>
            <View style={Styles.discussionCellSeparator} />
          </View>

        </View>

        <View style={[Styles.dicussionCellRow, {paddingTop: 5}]}>

          <View style={Styles.discussionCellPictureColumn}>
            <Text style={Styles.forName} adjustsFontSizeToFit={true}>{data[data.positionKey].name}</Text>
            <View style={Styles.discussionCellRowInner}>
              <Text style={styles.vsText} adjustsFontSizeToFit={true}>vs </Text>
              <Text style={Styles.againstText} adjustsFontSizeToFit={true}>{otherUser.name}</Text>
            </View>
            <Text style={styles.vsText} adjustsFontSizeToFit={true}>{startedOn}</Text>
            <View style={Styles.discussionCellRowInner}>
            {data.winner === "" &&
              <>
                <Timer totalMinutes={minutesTilFinish} isActive={true} textStyle={Styles.discussionCellTimerText}/>
                <Text style={styles.vsText} adjustsFontSizeToFit={true}> to go</Text>
              </>
            }
            {data.winner !== "" &&
              <View style={Styles.column}>
                <Text style={winnerStyle} adjustsFontSizeToFit={true} numberOfLines={1}>{winnerText}</Text>
                <Text style={styles.vsText} adjustsFontSizeToFit={true} numberOfLines={1}>WON</Text>
              </View>
            }
            </View>
          </View>

          <View style={[Styles.discussionCellTextColumn]}>
            <Text style={Styles.lastCommentPreviewText} adjustsFontSizeToFit={true} numberOfLines={3}>{lastComment}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    paddingLeft: 5, // To account for for bar
    top: 0,
    left: 0,
  },
  nameRow: {
    paddingLeft: 5,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  vsText: {
    color: Colors.vsTextColor,
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
  pictureHolder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inFavorOfPhoto: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  }
});

export default MyForCell;
