import React, { Component } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  View,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';

import ApiRequest from '../../../../helper/ApiRequest';
import { LayoverMenu } from '../../../../component/layoverMenu';
import { AppText, Colors, Images, Styles } from '../../../../constant';
import List from "./list";

export default class Grocery extends Component
{
  // MARK: - Data fields
  _isMounted = false;

  // MARK: - Constructor
  constructor(props)
  {
    console.log('Grocery()');
    super(props);
    this.state =
    {
      isLoading: false,
      groceryList:
      {
        produce:
        [
          {
            label: "Eggs"
          }
        ],
        protein:
        [
          {
            label: "Lentils"
          }
        ],
        grains:
        [
          {
            label: "Rice"
          }
        ],
        misc:
        [
          {
            label: "Coffee"
          }
        ]
      }
    };

    props.navigation.addListener('blur', async () =>
    {
      await this.saveData();
    });
  }

  async componentDidMount()
  {
    await this.loadData();
    this._isMounted = true;
  }

  // MARK: - APIs
  loadData = async () =>
  {
    console.log('Grocery.loadData()');
    this.setState({ isLoading: true });
    try
    {
      let response = await ApiRequest.sendRequest("post", {}, "additional/grocery-list");
      console.log(response.data);
      // Success
      if(response.data.error === null)
      {
        this.setState(
        {
          isLoading: false,
          groceryList: response.data.results
        });
      }
      else
      {
        this.setState({ isLoading: false });
        this.props.showAlert('Error', response.data.error);
      }
    }
    catch(err)
    {
      console.log(err);
      this.setState({ isLoading: false });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  }

  saveData = async () =>
  {
    console.log('Grocery.saveData()');
    this.setState({ isLoading: true });
    try
    {
      let response = await ApiRequest.sendRequest("post", {groceryList: this.state.groceryList}, "additional/grocery-list");
      console.log(response.data);
      // Success
      if(response.data.error === null)
      {
        this.setState(
        {
          isLoading: false,
          groceryList: response.data.results
        });
      }
      else
      {
        this.setState({ isLoading: false });
        this.props.showAlert('Error', response.data.error);
      }
    }
    catch(err)
    {
      console.log(err);
      this.setState({ isLoading: false });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  }

  // MARK: - Render
  shouldComponentUpdate(nextProps, nextState)
  {
    return (nextProps.user !== this.props.user ||
            nextState.isLoading !== this.state.isLoading ||
            nextState.groceryList !== this.state.groceryList
    );
  }

  render()
  {
    console.log('Grocery.render()');
    return (
      <ScrollView
        contentContainerStyle={styles.contentContainerStyle}
        style={styles.container}
      >

        <ActivityIndicator
          size="large"
          color={Colors.burnoutGreen}
          animating={this.state.isLoading}
          style={Styles.loading}
        />

        <List
          title={AppText.groceryPage.produce}
          data={this.state.groceryList.produce}
          onUpdate={nv => this.setState({ groceryList: { ...this.state.groceryList, produce: nv }})}
        />
        <List
          title={AppText.groceryPage.proteins}
          data={this.state.groceryList.protein}
          onUpdate={nv => this.setState({ groceryList: { ...this.state.groceryList, protein: nv }})}
        />
        <List
          title={AppText.groceryPage.grainsStarch}
          data={this.state.groceryList.grains}
          onUpdate={nv => this.setState({ groceryList: { ...this.state.groceryList, grains: nv }})}
        />
        <List
          title={AppText.groceryPage.misc}
          data={this.state.groceryList.misc}
          onUpdate={nv => this.setState({ groceryList: { ...this.state.groceryList, misc: nv }})}
          last
        />

      </ScrollView>
    );
  }
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    justifyContent: 'flex-start',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.budget.background,
    paddingTop: Math.round(Dimensions.get('window').height * 0.04),
  }
});
