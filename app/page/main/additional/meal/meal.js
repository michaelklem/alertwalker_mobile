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
import Day from './day';

export default class Meal extends Component
{
  // MARK: - Data fields
  _isMounted = false;

  // MARK: - Constructor
  constructor(props)
  {
    console.log('Meal()');
    super(props);
    this.state =
    {
      isLoading: false,
      meal:
      {
        monday:
        {
          breakfast:
          [
            { label: '' }
          ],
          snack:
          [
            { label: '' }
          ],
          lunch:
          [
            { label: '' }
          ],
          dinner:
          [
            { label: '' }
          ]
        },
        tuesday:
        {
          breakfast:
          [
            { label: '' }
          ],
          snack:
          [
            { label: '' }
          ],
          lunch:
          [
            { label: '' }
          ],
          dinner:
          [
            { label: '' }
          ]
        },
        wednesday:
        {
          breakfast:
          [
            { label: '' }
          ],
          snack:
          [
            { label: '' }
          ],
          lunch:
          [
            { label: '' }
          ],
          dinner:
          [
            { label: '' }
          ]
        },
        thursday:
        {
          breakfast:
          [
            { label: '' }
          ],
          snack:
          [
            { label: '' }
          ],
          lunch:
          [
            { label: '' }
          ],
          dinner:
          [
            { label: '' }
          ]
        }
        ,friday:
        {
          breakfast:
          [
            { label: '' }
          ],
          snack:
          [
            { label: '' }
          ],
          lunch:
          [
            { label: '' }
          ],
          dinner:
          [
            { label: '' }
          ]
        }
        ,saturday:
        {
          breakfast:
          [
            { label: '' }
          ],
          snack:
          [
            { label: '' }
          ],
          lunch:
          [
            { label: '' }
          ],
          dinner:
          [
            { label: '' }
          ]
        }
        ,sunday:
        {
          breakfast:
          [
            { label: '' }
          ],
          snack:
          [
            { label: '' }
          ],
          lunch:
          [
            { label: '' }
          ],
          dinner:
          [
            { label: '' }
          ]
        }
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
    console.log('Meal.loadData()');
    this.setState({ isLoading: true });
    try
    {
      let response = await ApiRequest.sendRequest("post", {}, "additional/meal");
      console.log(response.data);
      // Success
      if(response.data.error === null)
      {
        this.setState(
        {
          isLoading: false,
          meal: response.data.results
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
    console.log('Meal.saveData()');
    this.setState({ isLoading: true });
    try
    {
      let response = await ApiRequest.sendRequest("post", {meal: this.state.meal}, "additional/meal");
      // Success
      if(response.data.error === null)
      {
        this.setState(
        {
          isLoading: false,
          meal: response.data.results
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
            nextState.meal !== this.state.meal
    );
  }

  render()
  {
    console.log('Meal.render()');
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


        <Day
          title={AppText.mealPage.monday}
          data={this.state.meal.monday}
          onUpdate={nv => this.setState({ meal: { ...this.state.meal, monday: nv }})}
        />
        <Day
          title={AppText.mealPage.tuesday}
          data={this.state.meal.tuesday}
          onUpdate={nv => this.setState({ meal: { ...this.state.meal, tuesday: nv }})}
        />
        <Day
          title={AppText.mealPage.wednesday}
          data={this.state.meal.wednesday}
          onUpdate={nv => this.setState({ meal: { ...this.state.meal, wednesday: nv }})}
        />
        <Day
          title={AppText.mealPage.thursday}
          data={this.state.meal.thursday}
          onUpdate={nv => this.setState({ meal: { ...this.state.meal, thursday: nv }})}
        />
        <Day
          title={AppText.mealPage.friday}
          data={this.state.meal.friday}
          onUpdate={nv => this.setState({ meal: { ...this.state.meal, friday: nv }})}
        />
        <Day
          title={AppText.mealPage.saturday}
          data={this.state.meal.saturday}
          onUpdate={nv => this.setState({ meal: { ...this.state.meal, saturday: nv }})}
        />
        <Day
          title={AppText.mealPage.sunday}
          data={this.state.meal.sunday}
          onUpdate={nv => this.setState({ meal: { ...this.state.meal, sunday: nv }})}
          last
        />

      </ScrollView>
    );
  }
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    justifyContent: 'flex-start'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.budget.background,
    paddingTop: Math.round(Dimensions.get('window').height * 0.04)
  }
});
