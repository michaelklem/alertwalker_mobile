import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Dimensions,
  Image,
} from 'react-native';

//import {  Image,  Defs, ClipPath, Svg, Polygon } from 'react-native-svg';

import Colors from '../../constant/Colors';
import Styles from '../../constant/Styles';
import AppText from '../../constant/Text';

import {getMinutesApart, formatDateOnly} from '../../helper/datetime';

const DsicussionForCell = ({ data }) =>
{
  console.log(data);
  // Date times
  let startedOn = null;
  if(data.startedOn)
  {
    startedOn = new Date(data.startedOn);
    let endsOn = new Date(data.startedOn);
    endsOn.setTime(startedOn.getTime() + (24*60*60*1000));
    let minutesTilFinish = getMinutesApart(new Date(), endsOn);
    minutesTilFinish = (minutesTilFinish < 0 ? 0 : minutesTilFinish);
    startedOn = '// ' + formatDateOnly(startedOn);
  }

  let nameAndDate = '   ' + data.owner.name + ' ';
  if(startedOn != null)
  {
    nameAndDate += startedOn;
  }
  else
  {
    nameAndDate += '// ' + formatDateOnly(new Date(data.createdOn));
  }

  const lastComment = data.lastComment ? data.lastComment.message : '';

  return(
    <View style={Styles.detailRowHolder}>

      <View style={Styles.forBar} />

      <View style={Styles.column}>

        <View style={Styles.dicussionCellRow}>

          <View style={Styles.discussionCellPictureColumn}>
            <View style={styles.bottomImage}>
              <Image
                source={{uri: data[data.positionKey].photo }}
                style={Styles.discussionCellImage}
              />
            </View>
          </View>

          <View style={Styles.discussionCellTextColumn}>
            <Text style={Styles.discussionCellHeaderText} numberOfLines={2} adjustsFontSizeToFit={true}>{data.subject}</Text>
            <View style={Styles.discussionCellRowInner}>
              <Text style={styles.joinDebateText} adjustsFontSizeToFit={true}>{AppText.pHomeDetailJoinDebateText}</Text>
              <Text style={styles.nameAndDateText} adjustsFontSizeToFit={true}>{nameAndDate}</Text>
            </View>
            <View style={Styles.discussionCellSeparator} />
          </View>

        </View>

        <View style={Styles.dicussionCellRow}>
          <Text style={Styles.lastCommentPreviewText} adjustsFontSizeToFit={true} numberOfLines={3}>{lastComment}</Text>
        </View>

      </View>
    </View>


  );
};

const styles = StyleSheet.create({
  nameAndDateText: {
    color: Colors.nameDateDetailText,
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
    }),
  },
  joinDebateText: {
    color: Colors.dashedSeparator,
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
    }),
    fontStyle: 'italic',
  },
  bottomImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    paddingLeft: 5, // To account for for bar
    top: 0,
    left: 0,
  },
  pictureHolder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DsicussionForCell;
