import React, { Component } from 'react';
import { Dimensions, FlatList, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';


import ApiRequest from '../../helper/ApiRequest';
import { AppManager, DataManager, OauthManager } from '../../manager';
import { MyButton } from '../myButton';
import { LoadFacebookDataCommand } from '../../command/widget';
import { AppText, Colors, Styles } from '../../constant';
import { formatDateOnly, formatAMPM } from '../../helper/datetime';

export default class FacebookWidget extends Component
{
  _oauthMgr = null;
  _dataMgr = null;
  _appMgr = null;

  constructor(props)
  {
    super(props);
    console.log('\tFacebookWidget()');
    this._oauthMgr = OauthManager.GetInstance();
    this._oauthMgr.addListener('facebookWidget', this.onOauthNotification);
    const tokens = this._oauthMgr.getOauthTokens();

    this._dataMgr = DataManager.GetInstance();
    this._appMgr = AppManager.GetInstance();

    this.state =
    {
      accessToken: tokens.facebookToken ? tokens.facebookToken.token : null,
      isRefreshing: false,
      thirdpartyAccount: null
    };
  }

  async componentDidMount()
  {
    if(this.state.accessToken)
    {
      // Only load data if data store not cached yet
      let data = this._dataMgr.getData('facebookWidget');
      if(!data || !data.feed || data.feed.length === 0)
      {
        let hasThirdPartyAccount = await this.getThirdPartyAccount();
        if(hasThirdPartyAccount)
        {
          await this.getFeed();
        }
      }
    }
  }

  getFeed = async() =>
  {
    const data = await this._dataMgr.execute(await new LoadFacebookDataCommand(
      this.state.accessToken,
      this.state.thirdPartyAccount.externalId,
      this.props.updateFeedVersion
    ));
  };

  /**
    Check if we have any third party account linked for this service
    @returns  {Bool}  true if account exist
  */
  getThirdPartyAccount = async() =>
  {
    const thirdPartyAccount = this._appMgr.getThirdPartyAccount('facebook');
    console.log(thirdPartyAccount);
    if(thirdPartyAccount !== null)
    {
      this.setState({ thirdPartyAccount: thirdPartyAccount });
      return thirdPartyAccount;
    }
    else
    {
      const response = await ApiRequest.sendRequest('post',
                                                    { source: 'facebook' },
                                                    'oauth/third-party-account');
      //console.log(response.data);
      if(response.data.error !== null)
      {
        //this.setState({ isLoading: false });
        this.props.showAlert('Un-oh', response.data.error);
        return;
      }

      this.setState({ thirdPartyAccount: response.data.result });
      return response.data.result !== null
    }
  }

  onOauthNotification = (message) =>
  {
    if(message)
    {
      console.log('\tFacebookWidget.onOauthNotification(' + JSON.stringify(message) + ')');
      if(message.source === 'facebook')
      {
        this.setState({
          accessToken: message.token ? message.token.token : null,
        }, async() =>
        {
          let hasThirdPartyAccount = await this.getThirdPartyAccount();
          if(hasThirdPartyAccount)
          {
            await this.getFeed();
          }
        });
      }
    }
  }

  renderItem = (item, index) =>
  {
    return (
      <TouchableOpacity
        onPress={async() =>
        {
          console.log(this.state.thirdPartyAccount);
          if(!this.state.thirdPartyAccount)
          {
            let thirdPartyAccount = await this.getThirdPartyAccount();
            const isSupported = await Linking.canOpenURL(thirdPartyAccount.url);
            if(isSupported)
            {
              await Linking.openURL(thirdPartyAccount.url);
            }
            return;
          }
          else
          {
            const isSupported = await Linking.canOpenURL(this.state.thirdPartyAccount.url);
            if(isSupported)
            {
              await Linking.openURL(this.state.thirdPartyAccount.url);
            }
          }
        }}>
        <View style={styles.itemContainer}>
          <Text style={styles.message}>{item.message}</Text>
          {item.date !== '' && <Text style={styles.date}>{`${formatDateOnly(item.date)} ${formatAMPM(item.date)}`}</Text>}
        </View>
        <View style={styles.bottomBorder} />
      </TouchableOpacity>
    )
  }

  shouldComponentUpdate(nextProps, nextState)
  {
    return (this.props.feedVersion !== nextProps.feedVersion ||
          this.state.accessToken !== nextState.accessToken);
  }

  render()
  {
    console.log('\tFacebookWidget.render()');
    const data = this._dataMgr.getData('facebookWidget');
    console.log(data);
    return (
      <View
        style={[styles.container, { display: this.state.accessToken ? 'flex' : 'none' }]}
      >
        <View style={styles.widget}>
          <FlatList
            data={data.feed ? data.feed : []}
            numColumns={1}
            onRefresh={() => this.getFeed()}
            refreshing={this.state.isRefreshing}
            scrollEnabled={true}
            keyExtractor={item => item.id.toString()}
            renderItem={(item, index) => this.renderItem(item.item, index)}
          />
        </View>
        <Text
          style={styles.title}
        >{`${AppText.widgets.facebook.title.text}`}</Text>
        <Text
          style={styles.subtitle}
        >{`${data.subtitle}`}</Text>
      </View>
    );
  }
};

const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height14 = Math.round(Dimensions.get('window').height * 0.0166);
const height10 = Math.round(Dimensions.get('window').height * 0.01282);
const height11 = Math.round(Dimensions.get('window').height * 0.014102);
const height8 = Math.round(Dimensions.get('window').height * 0.01025);
const height4 = Math.round(Dimensions.get('window').height * 0.00512);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    display: 'flex',
    width: Math.round(Dimensions.get('window').width * 0.4444),
  },
  widget: {
    height: Math.round(Dimensions.get('window').height * 0.192),
    width: Math.round(Dimensions.get('window').width * 0.4444),
    justifyContent: 'center',
    backgroundColor: Colors.widgets.facebook.background,
    borderRadius: 25,
  },
  itemContainer: {
    padding: 15,
    flexDirection: 'column',
  },
  title: {
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
    marginTop: height10,
    opacity: 0.1,
    textAlign: 'center',
    color: Colors.white,
  },
  subtitle: {
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
    marginTop: height4,
    opacity: 0.1,
    textAlign: 'center',
    color: Colors.white,
  },
  message: {
    color: Colors.white,
    marginBottom: height10,
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
    fontSize: height11,
  },
  date: {
    color: Colors.white,
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
    fontSize: height8,
  },
  bottomBorder: {
    height: 1,
    backgroundColor: Colors.white,
    opacity: 0.1,
  }
});

module.exports = FacebookWidget;
