import React, { Component } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';

import ApiRequest from '../../../../helper/ApiRequest';
import { FormInput } from '../../../../component/formInput';
import { AppText, Colors, Styles } from '../../../../constant';
import { TitleRow } from '../../../../component/titleRow';
import BudgetOutputText from './budgetOutputText';
import Swipeout from 'react-native-swipeout';

export default class Budget extends Component
{
  // MARK: - Data fields
  _isMounted = false;

  // MARK: - Constructor
  constructor(props)
  {
    console.log('Budget()');
    super(props);
    this.state =
    {
      isLoading: false,
      budgetTotals:
      {
        income: 1000,
        fixedExpenses: 50,
        variableExpenses: 50,
        deposits: 50
      },
      budget:
      {
        incomes:
        [
          {
            label: 'Main Job',
            amount: 1000
          }
        ],
        fixedExpenses:
        [
          {
            label: 'Example expense',
            budgeted: 100,
            actual: 50
          }
        ],
        variableExpenses:
        [
          {
            label: 'Example expense',
            budgeted: 100,
            actual: 50
          }
        ],
        deposits:
        [
          {
            label: 'Savings',
            budgeted: 100,
            actual: 50
          }
        ]
      }
    };

    props.navigation.addListener('blur', async () =>
    {
      console.log('Budget.blur()');
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
    console.log('Budget.loadData()');
    this.setState({ isLoading: true });
    try
    {
      let response = await ApiRequest.sendRequest("post", {}, "additional/budget");
      console.log(response.data);
      // Success
      if(response.data.error === null)
      {
        let newBudget = response.data.results;
        let newTotals = {...this.state.budgetTotals};
        newTotals.income = newBudget.incomes.map(x => x.amount).reduce((acc, value) => Number(acc) + Number(value), 0);
        newTotals.fixedExpenses = newBudget.fixedExpenses.map(x => x.actual).reduce((acc, value) => Number(acc) + Number(value), 0);
        newTotals.variableExpenses = newBudget.variableExpenses.map(x => x.actual).reduce((acc, value) => Number(acc) + Number(value), 0);
        newTotals.deposits = newBudget.deposits.map(x => x.actual).reduce((acc, value) => Number(acc) + Number(value), 0);
        this.setState(
        {
          isLoading: false,
          budget: newBudget,
          budgetTotals: newTotals
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
    console.log('Budget.saveData()');
    this.setState({ isLoading: true });
    try
    {
      let response = await ApiRequest.sendRequest("post", {budget: this.state.budget}, "additional/budget");
      console.log(response.data);
      // Success
      if(response.data.error === null)
      {
        this.setState(
        {
          isLoading: false,
          budget: response.data.results
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

  deleteIncome(index)
  {
    let newBudget = {...this.state.budget};
    newBudget.incomes.splice(index, 1);
    let newTotals = {...this.state.budgetTotals};
    newTotals.income = newBudget.incomes.map(x => x.amount).reduce((acc, value) => Number(acc) + Number(value), 0);
    this.setState({ budget: newBudget, budgetTotals: newTotals });
  }

  addIncome()
  {
    let newBudget = {...this.state.budget};
    newBudget.incomes.push({ label: "", amount: 0 });
    this.setState({ budget: newBudget });
  }

  updateIncome(index, label, amount)
  {
    let newBudget = {...this.state.budget};
    let i = newBudget.incomes[index];
    newBudget.incomes[index] = {
      label: label ?? i.label,
      amount: amount ?? i.amount
    };
    let newTotals = {...this.state.budgetTotals};
    newTotals.income = newBudget.incomes.map(x => x.amount).reduce((acc, value) => Number(acc) + Number(value), 0);
    this.setState({ budget: newBudget, budgetTotals: newTotals });
  }

  addFixedExpenses()
  {
    let newBudget = {...this.state.budget};
    newBudget.fixedExpenses.push({ label: "", budgeted: 0, actual: 0 });
    this.setState({ budget: newBudget });
  }

  deleteFixedExpense(index)
  {
    let newBudget = {...this.state.budget};
    newBudget.fixedExpenses.splice(index, 1);
    let newTotals = {...this.state.budgetTotals};
    newTotals.fixedExpenses = newBudget.fixedExpenses.map(x => x.actual).reduce((acc, value) => Number(acc) + Number(value), 0);
    this.setState({ budget: newBudget, budgetTotals: newTotals });
  }

  updateFixedExpenses(index, label, budgeted, actual)
  {
    let newBudget = {...this.state.budget};
    let c = newBudget.fixedExpenses[index];
    newBudget.fixedExpenses[index] = {
      label: label ?? c.label,
      budgeted: budgeted ?? c.budgeted,
      actual: actual ?? c.actual
    };
    let newTotals = {...this.state.budgetTotals};
    newTotals.fixedExpenses = newBudget.fixedExpenses.map(x => x.actual).reduce((acc, value) => Number(acc) + Number(value), 0);
    this.setState({ budget: newBudget, budgetTotals: newTotals });
  }

  addVariableExpenses()
  {
    let newBudget = {...this.state.budget};
    newBudget.variableExpenses.push({ label: "", budgeted: 0, actual: 0 });
    this.setState({ budget: newBudget });
  }

  deleteVariableExpense(index)
  {
    let newBudget = {...this.state.budget};
    newBudget.variableExpenses.splice(index, 1);
    let newTotals = {...this.state.budgetTotals};
    newTotals.variableExpenses = newBudget.variableExpenses.map(x => x.actual).reduce((acc, value) => Number(acc) + Number(value), 0);
    this.setState({ budget: newBudget, budgetTotals: newTotals });
  }

  updateVariableExpenses(index, label, budgeted, actual)
  {
    let newBudget = {...this.state.budget};
    let c = newBudget.variableExpenses[index];
    newBudget.variableExpenses[index] = {
      label: label ?? c.label,
      budgeted: budgeted ?? c.budgeted,
      actual: actual ?? c.actual
    };
    let newTotals = {...this.state.budgetTotals};
    newTotals.variableExpenses = newBudget.variableExpenses.map(x => x.actual).reduce((acc, value) => Number(acc) + Number(value), 0);
    this.setState({ budget: newBudget, budgetTotals: newTotals });
  }

  addDeposits()
  {
    let newBudget = {...this.state.budget};
    newBudget.deposits.push({ label: "", budgeted: 0, actual: 0 });
    this.setState({ budget: newBudget });
  }

  deleteDeposit(index)
  {
    let newBudget = {...this.state.budget};
    newBudget.deposits.splice(index, 1);
    let newTotals = {...this.state.budgetTotals};
    newTotals.deposits = newBudget.deposits.map(x => x.actual).reduce((acc, value) => Number(acc) + Number(value), 0);
    this.setState({ budget: newBudget, budgetTotals: newTotals });
  }

  updateDeposits(index, label, budgeted, actual)
  {
    let newBudget = {...this.state.budget};
    let c = newBudget.deposits[index];
    newBudget.deposits[index] = {
      label: label ?? c.label,
      budgeted: budgeted ?? c.budgeted,
      actual: actual ?? c.actual
    };
    let newTotals = {...this.state.budgetTotals};
    newTotals.deposits = newBudget.deposits.map(x => x.actual).reduce((acc, value) => Number(acc) + Number(value), 0);
    this.setState({ budget: newBudget, budgetTotals: newTotals });
  }

  // MARK: - Render
  shouldComponentUpdate(nextProps, nextState)
  {
    return (nextProps.user !== this.props.user ||
            nextState.isLoading !== this.state.isLoading ||
            nextState.budget !== this.state.budget
    );
  }

  render()
  {
    console.log('Budget.render()');
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

        {/** Total Income */}
        <TitleRow
          label={AppText.budgetPage.incomeText}
          onAddItem={() => this.addIncome()}
          layout={1}
        />
        <View style={styles.budgetContainer}>
          {this.state.budget.incomes.map((value, index) => (
            <Swipeout
              style={{backgroundColor: Colors.transparent}}
              right={[{ text: 'Delete', backgroundColor: 'red', onPress: () => this.deleteIncome(index)}]}
              autoClose={true}
              key={`total-income-${index}`}>
              <View style={styles.budgetRow}>
                <View style={{ width: '47%' }}>
                  <FormInput
                    updateMasterState={(id, nv) => this.updateIncome(index, nv, undefined)}
                    value={value.label}
                    textInputStyle={2}
                  />
                  <Text style={styles.inputLabel}>{AppText.budgetPage.incomeLabel}</Text>
                </View>
                <View style={{ width: '47%' }}>
                  <FormInput
                    updateMasterState={(id, nv) => this.updateIncome(index, undefined, nv)}
                    value={value.amount.toString()}
                    containerStyle={styles.inputContainerStyle}
                    textInputStyle={2}
                    keyboardType="numeric"
                    otherTextInputProps={{ returnKeyType: "done" }}
                  />
                  <Text style={styles.inputLabel}>{AppText.budgetPage.actualText}</Text>
                </View>
              </View>
            </Swipeout>
          ))}
          <BudgetOutputText
            color={Colors.lightBlue1}
            amount={this.state.budgetTotals.income}
            label={AppText.budgetPage.totalIncomeText}
          />
        </View>
        {/** End Total Income */}

        {/** Fixed Expenses */}
        <TitleRow
          label={AppText.budgetPage.fixedExpensesText}
          onAddItem={() => this.addFixedExpenses()}
          layout={2}
        />
        <View style={styles.budgetContainer}>
          {this.state.budget.fixedExpenses.map((value, index) => (
            <Swipeout
              style={{backgroundColor: Colors.transparent}}
              right={[{ text: 'Delete', backgroundColor: 'red', onPress: () => this.deleteFixedExpense(index)}]}
              autoClose={true}
              key={`fixed-expenses-${index}`}>
              <View style={styles.budgetRow}>
                <View style={{ width: '30%' }}>
                  <FormInput
                    updateMasterState={(id, nv) => this.updateFixedExpenses(index, nv, undefined, undefined)}
                    value={value.label}
                    textInputStyle={2}
                  />
                  <Text style={styles.inputLabel}>{AppText.budgetPage.fixedText}</Text>
                </View>
                <View style={{ width: '30%' }}>
                  <FormInput
                    updateMasterState={(id, nv) => this.updateFixedExpenses(index, undefined, nv, undefined)}
                    value={value.budgeted.toString()}
                    textInputStyle={2}
                    keyboardType="numeric"
                    otherTextInputProps={{ returnKeyType: "done" }}
                  />
                  <Text style={styles.inputLabel}>{AppText.budgetPage.budgetedText}</Text>
                </View>
                <View style={{ width: '30%' }}>
                  <FormInput
                    updateMasterState={(id, nv) => this.updateFixedExpenses(index, undefined, undefined, nv)}
                    value={value.actual.toString()}
                    textInputStyle={2}
                    keyboardType="numeric"
                    otherTextInputProps={{ returnKeyType: "done" }}
                  />
                  <Text style={styles.inputLabel}>{AppText.budgetPage.actualText}</Text>
                </View>
              </View>
            </Swipeout>
          ))}
          <BudgetOutputText
            color={Colors.maroon}
            amount={this.state.budgetTotals.fixedExpenses}
            label={AppText.budgetPage.totalFixedExpensesText}
          />
        </View>
        {/** End Fixed Expenses */}

        {/** Variable Expenses */}
        <TitleRow
          label={AppText.budgetPage.variableExpensesText}
          onAddItem={() => this.addVariableExpenses()}
          layout={3}
        />
        <View style={styles.budgetContainer}>
          {this.state.budget.variableExpenses.map((value, index) => (
            <Swipeout
              style={{backgroundColor: Colors.transparent}}
              right={[{ text: 'Delete', backgroundColor: 'red', onPress: () => this.deleteVariableExpense(index)}]}
              autoClose={true}
              key={`variable-expense-${index}`}>
              <View style={styles.budgetRow}>
                <View style={{ width: '30%' }}>
                  <FormInput
                    updateMasterState={(id, nv) => this.updateVariableExpenses(index, nv, undefined, undefined)}
                    value={value.label}
                    textInputStyle={2}
                  />
                  <Text style={styles.inputLabel}>{AppText.budgetPage.variableExpensesText}</Text>
                </View>
                <View style={{ width: '30%' }}>
                  <FormInput
                    updateMasterState={(id, nv) => this.updateVariableExpenses(index, undefined, nv, undefined)}
                    value={value.budgeted.toString()}
                    textInputStyle={2}
                    keyboardType="numeric"
                    otherTextInputProps={{ returnKeyType: "done" }}
                  />
                  <Text style={styles.inputLabel}>{AppText.budgetPage.budgetedText}</Text>
                </View>
                <View style={{ width: '30%' }}>
                  <FormInput
                    updateMasterState={(id, nv) => this.updateVariableExpenses(index, undefined, undefined, nv)}
                    value={value.actual.toString()}
                    textInputStyle={2}
                    keyboardType="numeric"
                    otherTextInputProps={{ returnKeyType: "done" }}
                  />
                  <Text style={styles.inputLabel}>{AppText.budgetPage.actualText}</Text>
                </View>
              </View>
            </Swipeout>
          ))}
          <BudgetOutputText
            color={Colors.yellow}
            amount={this.state.budgetTotals.variableExpenses}
            label={AppText.budgetPage.totalVariableExpensesText}
          />
        </View>
        {/** End Fixed Expenses */}

        {/** Deposits */}
        <TitleRow
          label={AppText.budgetPage.deptSavingsText}
          onAddItem={() => this.addDeposits()}
          layout={4}
        />
        <View style={styles.budgetContainer}>
          {this.state.budget.deposits.map((value, index) => (
            <Swipeout
              style={{backgroundColor: Colors.transparent}}
              right={[{ text: 'Delete', backgroundColor: 'red', onPress: () => this.deleteDeposit(index)}]}
              autoClose={true}
              key={`deposit-${index}`}>
              <View style={styles.budgetRow}>
                <View style={{ width: '30%' }}>
                  <FormInput
                    updateMasterState={(id, nv) => this.updateDeposits(index, nv, undefined, undefined)}
                    value={value.label}
                    textInputStyle={2}
                  />
                  <Text style={styles.inputLabel}>{'Savings'}</Text>
                </View>
                <View style={{ width: '30%' }}>
                  <FormInput
                    updateMasterState={(id, nv) => this.updateDeposits(index, undefined, nv, undefined)}
                    value={value.budgeted.toString()}
                    textInputStyle={2}
                    keyboardType="numeric"
                    otherTextInputProps={{ returnKeyType: "done" }}
                  />
                  <Text style={styles.inputLabel}>{AppText.budgetPage.budgetedText}</Text>
                </View>
                <View style={{ width: '30%' }}>
                  <FormInput
                    updateMasterState={(id, nv) => this.updateDeposits(index, undefined, undefined, nv)}
                    value={value.actual.toString()}
                    textInputStyle={2}
                    keyboardType="numeric"
                    otherTextInputProps={{ returnKeyType: "done" }}
                  />
                  <Text style={styles.inputLabel}>{AppText.budgetPage.actualText}</Text>
                </View>
              </View>
            </Swipeout>
          ))}
          <BudgetOutputText
            color={Colors.white}
            amount={this.state.budgetTotals.deposits}
            label={AppText.budgetPage.totalDeptSavingsText}
          />
        </View>
        {/** End Deposits */}

        {/** Total Expenses Container */}
        <View style={styles.totalExpensesContainer}>
          <View style={styles.totalExpensesRowContainer}>
            <View style={styles.totalExpensesRow}>
              <View style={{ width: '40%' }}>
                <BudgetOutputText
                  color={Colors.lightBlue1}
                  amount={this.state.budgetTotals.income}
                  label={AppText.budgetPage.totalIncomeText}
                  style={2}
                />
              </View>
              <View style={{ width: '40%' }}>
                <BudgetOutputText
                  color={Colors.maroon}
                  amount={this.state.budgetTotals.fixedExpenses}
                  label={AppText.budgetPage.totalFixedExpensesText}
                  style={2}
                />
              </View>
            </View>
          </View>
          <View style={styles.totalExpensesRowContainer}>
            <View style={styles.totalExpensesRow}>
              <View style={{ width : '40%' }}>
                <BudgetOutputText
                  color={Colors.yellow}
                  amount={this.state.budgetTotals.variableExpenses}
                  label={AppText.budgetPage.totalVariableExpensesText}
                  style={2}
                />
              </View>
              <View style={{ width: '40%' }}>
                <BudgetOutputText
                  color={Colors.white}
                  amount={this.state.budgetTotals.deposits}
                  label={AppText.budgetPage.totalDeptSavingsText}
                  style={2}
                />
              </View>
            </View>
          </View>
        </View>
        {/* End Total Expenses Container */}
      </ScrollView>
    );
  }
};

const styles = StyleSheet.create({
  contentContainerStyle: {
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: Colors.budget.background,
    paddingTop: Math.round(Dimensions.get('window').height * 0.04),
  },
  budgetContainer: {
    width: '90%',
    display: 'flex',
    paddingTop: 26,
    paddingBottom: 27,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 26
  },
  totalExpensesContainer: {
    width: '100%',
    marginBottom: 38
  },
  totalExpensesRowContainer: {
    paddingTop: 38,
    paddingBottom: 26,
    borderTopColor: Colors.white,
    borderTopWidth: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  totalExpensesRow: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  inputLabel: {
    color: Colors.plainGray3
  }
});
