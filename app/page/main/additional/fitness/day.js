import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet
} from 'react-native';
import { AppText, Colors, Styles } from '../../../../constant';
import { TitleRow } from '../../../../component/titleRow';
import { DatePickerFormInput } from '../../../../component/datePickerFormInput';
import Swipeout from 'react-native-swipeout';
import { FormInput } from '../../../../component/formInput';
import { FormInputWithIcon } from '../../../../component/formInputWithIcon';
const calendarIcon = require('../../../../asset/calendarIcon.png')

export default class Day extends Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      time: props.data.time
    }
  }

  getCumulativeDistance()
  {
    return "";
  }

  render()
  {
    return (
      <View style={{ marginBottom: this.props.last && 38}}>
        <TitleRow
          label={this.props.title}
          layout={1}
        />
        <DatePickerFormInput
          label={AppText.fitnessPage.date}
          containerStyle={2}
          labelStyle={2}
          textInputStyle={4}
          updateMasterState={(id, nv) => this.props.onUpdate({...this.props.data, date: nv.toISOString() })}
          value={this.props.data.date ? new Date(this.props.data.date) : undefined}
        />
        <FormInput
          placeholder={AppText.fitnessPage.workout}
          containerStyle={1}
          textInputStyle={4}
          updateMasterState={(id, nv) => this.props.onUpdate({...this.props.data, comments: nv })}
          value={this.props.data.comments}
          placeholderTextColor={Colors.plainGray4}
          otherTextInputProps={{ multiline: true }}
        />
        <FormInputWithIcon
          label={AppText.fitnessPage.time}
          containerStyle={2}
          labelStyle={2}
          textInputStyle={5}
          updateMasterState={(id, nv) => this.props.onUpdate({...this.props.data, time: nv })}
          value={this.props.data.time}
          doNotAnimateLabel
          icon={calendarIcon}
          keyboardType="numeric"
          otherTextInputProps={{ returnKeyType: "done" }}
        />
        <FormInput
          placeholder={AppText.fitnessPage.notes}
          containerStyle={1}
          textInputStyle={4}
          type={'number'}
          updateMasterState={(id, nv) => this.props.onUpdate({...this.props.data, distance: nv })}
          value={this.props.data.distance.toString()}
          placeholderTextColor={Colors.plainGray4}
          otherTextInputProps={{ multiline: true }}
        />
        {/* <FormInput
            placeholder={AppText.fitnessPage.cumulativeDistance}
            containerStyle={1}
            textInputStyle={3}
            value={this.getCumulativeDistance()}
            placeholderTextColor={Colors.plainGray4}
        /> */}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    width: '90%',
    display: 'flex',
    justifyContent: 'center'
  },
  row: {
    width: '100%',
    paddingHorizontal: 28,
    paddingBottom: 26
  },
});
