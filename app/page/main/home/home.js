import React, { Component } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Image,
  View,
  Text,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import LinearGradient from 'react-native-linear-gradient';

import { AppText, Colors, Styles } from '../../../constant';
import { AppManager, OauthManager } from '../../../manager';
import ApiRequest from '../../../helper/ApiRequest';

import { AdBanner } from '../../../component/ad';
import { Groups } from '../../../component/groups';
import { Feed } from '../../../component/feed';
import { FacebookWidget, InstagramWidget } from '../../../component/widget';
import { Map } from '../../../component/map';

import {extractValueFromPointer} from '../../../helper/coreModel';

export default class Home extends Component
{
  _manager = null;
  _oauthMgr = null;
  _isMounted = false;
  _componentRef = null;

  // MARK: - Constructor
  constructor(props)
  {
    console.log('Home()');
    super(props);

    // Get components on page
    this._manager = AppManager.GetInstance();
    const components = this._manager.getComponentsForPage('home');

    // OAuth manager
    this._oauthMgr = OauthManager.GetInstance();

    this.state =
    {
      isLoading: false,
      components: components,
      facebookFeedVersion: 0,
      instagramFeedVerison: 0,
    };

    // Refresh data
    props.navigation.addListener('focus', () =>
    {
      if(this._isMounted !== true)
      {
        this._isMounted = true;
      }
      else
      {
        this._componentRef.current.loadData();
      }
    });

    this._componentRef = React.createRef();
  }

  async componentDidMount()
  {
    const tosRequired = await AsyncStorage.getItem('tosRequired');
    console.log('Tos required: ' + tosRequired);
    if(tosRequired === 'true' || tosRequired === true)
    {
      this.props.navigation.navigate('tos', { });
    }
    else
    {
      await this.loadData();
    }
  }


  // MARK: - API related
  /**
  */
  loadData = async () =>
  {
    /*console.log('Home.loadData()');
    this.setState({ isLoading: true });

    try
    {
      let params = {};
      let response = await ApiRequest.sendRequest("post", params, "user/get-home-page");

      console.log(response.data);

      // Success
      if(response.data.error === null)
      {
        var results = [response.data.results];
        if(response.data.results.length > 0)
        {
          results = response.data.results;
        }
        else if(response.data.results.length === 0)
        {
          results = [];
        }
        console.log(this.state);
        const components = [...this.state.components];
        for(let i = 0; i < components.length; i++)
        {
          if(components[i].type === 'detail')
          {
            components[i].data = results;
            break;
          }
        }
        console.log(components);
        this.setState(
        {
          isLoading: false,
          components: components,
        });
      }
      else
      {
        this.setState({ isLoading: false  });
        this.props.showAlert('Error', response.data.error);
      }
    }
    catch(err)
    {
      this.setState({ isLoading: false  });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 9 ' + err, 'danger');
    }*/
  }

  /**
    Allow another class to update our components state
    @param  {Int}  idx  Index of component to update
    @param  {String}  prop  The property to update in the component
    @param  {Any}     value   The value to update to
  */
  updateComponent = (idx, prop, value) =>
  {
    let components = [...this.state.components];
    components[idx][prop] = value;
    this.setState({ components: components });
  }

  // MARK: - Search related
  cancelSearch = () =>
  {
    this.setState({ searchText: '' });
  };


  filterSearchResults = (section) =>
  {
    if(!section.data)
    {
      return section;
    }
    else
    {
      const components = [...this.state.components];
      for(let i = 0; i < components.length; i++)
      {
        if(components[i].type === 'search')
        {
          const searchText = components[i].searchText.toLowerCase();
          let modifiableSection = {...section};
          const matchedResults = [];

          // Iterate all data sets
          for(let j = 0; j < section.data.length; j++)
          {
            console.log(components[i]);
            // Iterate all fields to search on
            for(let k = 0; k < components[i].fields.length; k++)
            {
              // Match
              if(extractValueFromPointer(components[i].fields[k], section.data[j]).toLowerCase().indexOf(searchText) !== -1)
              {
                matchedResults.push(section.data[j]);
                break;
              }
            }
          }
          modifiableSection.data = matchedResults;
          console.log(modifiableSection);
          return modifiableSection;
        }
      }
    }
  }

  // MARK: - Detail interactions
  /**
    Handle detail clicked event
    @param  {JSON}  detail  The detail record selected
  */
  detailOnClick = (detail) =>
  {
    console.log(detail);
    this.props.navigation.navigate('detail', { id: detail._id });
  }

  shouldComponentUpdate(nextProps, nextState)
  {
    return (
      this.state.isLoading !== nextState.isLoading ||
      this.state.components !== nextState.components ||
      this.state.facebookFeedVersion !== nextState.facebookFeedVersion ||
      this.state.instagramFeedVerison !== nextState.instagramFeedVerison
    );
  }

  // MARK: - Render
  render()
  {
    //console.log(this.state);
    console.log('Home.render()');
    return (
      <LinearGradient
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        colors={[Colors.white, Colors.white]}
        style={[Styles.fullScreen]}
      >


        {this.state.components &&
        this.state.components.map( (component, i) =>
        {
          if(component.type === 'admob')
          {
            return (
              component.isEnabled &&
              <View style={component.isShowing ? '' : {height: 0}} key={`component-${i}-container`}>
                <AdBanner
                  adUnitID={Platform.select({ios: component.iosUnitId, android: component.androidUnitId, default: component.androidUnitId })}
                  toggleIsShowing={() =>
                  {
                    this.updateComponent(i, 'isShowing', !component.isShowing);
                  }}
                />
              </View>
              );
          }
          else if(component.type === 'feed')
          {
            return (
            <Feed
              ref={this._componentRef}
              key={`component-${i}-feed`}
              dynamicData={true}
              component={component}
              deepLink={this.props.deepLink}
              updateMasterState={(state) => this.setState(state)}
              separator={'dashed'}
              showAlert={this.props.showAlert}
              onClick={this.props.onClick}
              navigation={this.props.navigation}
              user={this.props.user}
            />);
          }
          else if(component.type === 'accordion')
          {
            return this.props.data.map( (section, i) =>
            {
              return (<Accordion
                        ref={this._componentRef}
                        key={`detail-cell-${i}`}
                        rowIndex={i}
                        deepLink={this.props.deepLink}
                        title={section.title}
                        data={section.data}
                        type={section.type}
                        separator={'dashed'}
                        onClick={this.props.onClick}
                      />);
            });
          }
          else if(component.type === 'groups')
          {
            return (
              <Groups
                ref={this._componentRef}
                key={`component-${i}-container`}
                component={component}
                data={null}
                dynamicData={true}
                deepLink={this.props.deepLink}
                updateMasterState={(state) => this.setState(state)}
                navigation={this.props.navigation}
                showAlert={this.props.showAlert}
                user={this.props.user}
              />
            );
          }
          else if(component.type === 'widgets')
          {
            return (
              <View style={styles.widgetContainer} key={`component-${i}-widgets-container`}>
                <Text key={`component-${i}-widgets-no-text`} style={styles.noWidgets}>{AppText.homePage.noWidgets.text}</Text>
                <FacebookWidget
                  key={`component-${i}-widgets-facebook`}
                  feedVersion={this.state.facebookFeedVersion}
                  updateFeedVersion={() =>
                  {
                    this.setState({ facebookFeedVersion: this.state.facebookFeedVersion + 1 });
                  }}
                  showAlert={this.props.showAlert}
                />
                <InstagramWidget
                  key={`component-${i}-widgets-instagram`}
                  feedVersion={this.state.instagramFeedVerison}
                  updateFeedVersion={() =>
                  {
                    console.log('Updating instagram feed version to: ' + (this.state.instagramFeedVerison + 1));
                    this.setState({ instagramFeedVerison: this.state.instagramFeedVerison + 1 });
                  }}
                  showAlert={this.props.showAlert}
                />
              </View>
            );
          }
          else if(component.type === 'map')
          {
            return (
              <View style={styles.mapContainer} key={`component-${i}-map-container`}>
                <Text key={`component-${i}-widgets-no-text`} style={styles.noWidgets}>{`Welcome ${this._oauthMgr.getOauthTokens().googleToken.createdBy.email}`}</Text>
                <Map
                  ref={this._componentRef}
                  updateMasterState={(state) => this.setState(state)}
                  showAlert={this.props.showAlert}
                  createMode={false}
                  navigation={this.props.navigation}
                />
              </View>
            );
          }
        })}
      </LinearGradient>
    );
  }
}

/*
this._manager.displayComponents(this.state.components,
                                this.updateComponent,
                                this.filterSearchResults,
                                this.detailOnClick,
                                this.updateMasterState,
                                this.props.showAlert,
                                this.props.user,
                                this.props.navigation,
                                this.props.deepLink,
                                this.state.forceReload)}
*/

const height18 = Math.round(Dimensions.get('window').height * 0.02307);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.white,
    justifyContent: 'flex-start',
  },
  widgetContainer: {
    paddingTop: Math.round(Dimensions.get('window').height * 0.065),
    marginHorizontal: Math.round(Dimensions.get('window').width * 0.037),
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mapContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  noWidgets: {
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
    marginTop: 16,
    textAlign: 'center',
    color: Colors.black,
  },
});
