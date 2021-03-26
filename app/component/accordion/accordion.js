import React, {Component} from 'react';
import { View, TouchableOpacity, Text, FlatList, ScrollView, StyleSheet, LayoutAnimation, Platform, UIManager} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Colors from '../../constant/Colors';
import Styles from '../../constant/Styles';
import MyForCell from './myForCell';
import MyAgainstCell from './myAgainstCell';
import DiscussionForCell from './discussionForCell';
import DiscussionAgainstCell from './discussionAgainstCell';
import OneVsOneCell from './oneVsOneCell';
import DiscussionCell from './discussionCell';

export default class Accordion extends Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      expanded : false,
    }

    if (Platform.OS === 'android')
    {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }

  separator = () =>
  {
    switch(this.props.separator)
    {
      case 'dashed':
        return (<View style={styles.dashedSeparator} />);
      default:
        return (<View style={styles.dashedSeparator} />);
    }
  }

  renderItem = (item, index) =>
  {
    // My 1v1 debates
    if(this.props.type === 'my')
    {
      if(item.usersPosition === 'for')
      {
        return (
          <TouchableOpacity key={`accordion-${this.props.rowIndex}-detail-touch-${index}`} onPress={()=> this.props.onClick(item)}>
            <View style={styles.detailRowBg} key={`accordion-${this.props.rowIndex}-detail-row-${index}`}>
              <View style={Styles.sideMarginsOnePercent} key={`accordion-${this.props.rowIndex}-detail-container-${index}`}>
                <MyForCell data={item} key={`accordion-${this.props.rowIndex}-detail-cell-${index}`}/>
              </View>
            </View>
          </TouchableOpacity>
        );
      }
      else
      {
        return (
          <TouchableOpacity key={`accordion-${this.props.rowIndex}-detail-touch-${index}`} onPress={()=> this.props.onClick(item)}>
            <View style={styles.detailRowBg} key={`accordion-${this.props.rowIndex}-detail-row-${index}`}>
              <View style={Styles.sideMarginsOnePercent} key={`accordion-${this.props.rowIndex}-detail-container-${index}`}>
                <MyAgainstCell data={item} key={`accordion-${this.props.rowIndex}-detail-cell-${index}`}/>
              </View>
            </View>
          </TouchableOpacity>
        );
      }
    }

    // My discussions
    else if(this.props.type === 'discussion')
    {
      if(item.usersPosition === 'for')
      {
        return (
          <TouchableOpacity key={`accordion-${this.props.rowIndex}-detail-touch-${index}`} onPress={()=> this.props.onClick(item)}>
            <View style={styles.detailRowBg} key={`accordion-${this.props.rowIndex}-detail-row-${index}`}>
              <View style={Styles.sideMarginsOnePercent} key={`accordion-${this.props.rowIndex}-detail-container-${index}`}>
                <DiscussionForCell data={item} key={`accordion-${this.props.rowIndex}-detail-cell-${index}`}/>
              </View>
            </View>
          </TouchableOpacity>
        );
      }
      else if(item.usersPosition === 'against')
      {
        return (
          <TouchableOpacity key={`accordion-${this.props.rowIndex}-detail-touch-${index}`} onPress={()=> this.props.onClick(item)}>
            <View style={styles.detailRowBg} key={`accordion-${this.props.rowIndex}-detail-row-${index}`}>
              <View style={Styles.sideMarginsOnePercent} key={`accordion-${this.props.rowIndex}-detail-container-${index}`}>
                <DiscussionAgainstCell data={item} key={`accordion-${this.props.rowIndex}-detail-cell-${index}`}/>
              </View>
            </View>
          </TouchableOpacity>
        );
      }
      // Discussion we are not in
      else
      {
        return (
        <TouchableOpacity key={`accordion-${this.props.rowIndex}-detail-touch-${index}`} onPress={()=> this.props.onClick(item)}>
          <View style={styles.detailRowBg} key={`accordion-${this.props.rowIndex}-detail-row-${index}`}>
            <View style={Styles.sideMarginsOnePercent} key={`accordion-${this.props.rowIndex}-detail-container-${index}`}>
              <DiscussionForCell data={item} key={`accordion-${this.props.rowIndex}-detail-cell-${index}`}/>
            </View>
          </View>
        </TouchableOpacity>
      );
      }
    }

    // All one vs one
    else if(this.props.type === 'all-one')
    {
      return (
      <TouchableOpacity key={`accordion-${this.props.rowIndex}-detail-touch-${index}`} onPress={()=> this.props.onClick(item)}>
        <View style={styles.detailRowBg} key={`accordion-${this.props.rowIndex}-detail-row-${index}`}>
          <View style={Styles.sideMarginsOnePercent} key={`accordion-${this.props.rowIndex}-detail-container-${index}`}>
            <OneVsOneCell data={item} key={`accordion-${this.props.rowIndex}-detail-cell-${index}`}/>
          </View>
        </View>
      </TouchableOpacity>
      );
    }

    // All discussion
    else
    {
      return (
      <TouchableOpacity key={`accordion-${this.props.rowIndex}-detail-touch-${index}`} onPress={()=> this.props.onClick(item)}>
        <View style={styles.detailRowBg} key={`accordion-${this.props.rowIndex}-detail-row-${index}`}>
          <View style={Styles.sideMarginsOnePercent} key={`accordion-${this.props.rowIndex}-detail-container-${index}`}>
            <DiscussionCell data={item} key={`accordion-${this.props.rowIndex}-detail-cell-${index}`}/>
          </View>
        </View>
      </TouchableOpacity>
      );
    }
  }

  render()
  {
    //console.log(this.props);
    return (
    <ScrollView
      style={[styles.container, this.props.containerStyle]}
      contentContainerStyle={{flexGrow: 1}}
    >
     <View>
      <TouchableOpacity
        style={[styles.categoryRow,
          this.state.expanded ? styles.categoryRowActive : styles.categoryRowInactive,
          this.props.rowIndex === 0 ? styles.firstRow : '',
          this.state.expanded && this.props.rowIndex === 0 ? styles.firstRowActive : ''
        ]}
        onPress={()=>this.toggleExpand()}
      >
        <View style={[Styles.row]}>
          <View />
          <View style={[styles.titleHr, (this.state.expanded ? styles.titleHrActive : styles.titleHrInactive)]}/>
          <View />
        </View>
        <View style={[styles.titleRow]}>
          {!this.state.expanded && <View />}
          <Text style={[styles.title, (this.state.expanded ? styles.titleActive : '')]} adjustsFontSizeToFit={true}>{`${this.props.title} (${this.props.data.length})`}</Text>
          {this.state.expanded && <View />}
          <Icon
            name={this.state.expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={20}
            color={this.state.expanded ? Colors.cAccordionArrowActive : Colors.cAccordionArrowInactive}
          />
        </View>
      </TouchableOpacity>
      {
        this.state.expanded &&
          <FlatList
            data={this.props.data}
            numColumns={1}
            scrollEnabled={true}
            renderItem={ ({item, index}) => this.renderItem(item, index) }
            ItemSeparatorComponent={this.separator}
            nestedScrollEnabled={true}
            keyExtractor={item => item._id.toString()}
          />
      }
    </View>
  </ScrollView>
  );
  }

  toggleExpand=()=>{
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({expanded : !this.state.expanded})
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dashedSeparator: {
    borderStyle: 'dashed',
    borderColor: Colors.dashedSeparator,
    borderWidth: 1,
    backgroundColor: Colors.cAccordionDetailBg
  },
  firstRow: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  firstRowActive: {
    paddingTop: 30,
    height: 86,
  },
  categoryRow: {
    height:56,
    paddingRight:18,
    flexDirection: 'column',
    borderBottomColor: Colors.cAccordionArrowInactive,
    borderBottomWidth: 1
  },
  categoryRowActive: {
    backgroundColor: Colors.white,
    borderBottomColor: Colors.cAccordionArrowActive,
  },
  categoryRowInactive: {
    backgroundColor: Colors.cAccordionRowInactive,
  },
  titleRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    flex: 1,
    marginTop: 10,
  },
  title:{
      fontSize: 14,
      fontWeight:'bold',
      color: Colors.cAccordionTitleTextColor,
  },
  titleHr: {
    marginTop: 5,
    borderStyle: 'solid',
    borderWidth: 3,
    borderRadius: 10,
    width: 60,
    height: 4,
  },
  titleHrActive: {
    borderColor: Colors.cAccordionArrowActive
  },
  titleHrInactive: {
    borderColor: Colors.cAccordionArrowInactive,
  },


  subject: {
    fontSize: 24,
    color: Colors.cAccordionRowInactive,
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
  titleActive: {
    marginHorizontal: 10,
  },
  itemInActive:{
      fontSize: 12,
      color: '#5E5E5E',
  },
  childHr:{
    height:1,
    backgroundColor: '#FFF',
    width:'100%',
  },
  button:{
    width:'100%',
    height:54,
    alignItems:'center',
    paddingLeft:35,
    paddingRight:35,
    fontSize: 12,
  },
  btnActive:{
    borderColor: '#0da935',
  },
  btnInActive:{
    borderColor:'#5E5E5E',
  },

  // Detail cell related
  detailRowBg: {
    flexDirection: 'row',
    flex: 1,
    justifyContent:'space-between',
    backgroundColor: Colors.cAccordionDetailBg,
  },
});
