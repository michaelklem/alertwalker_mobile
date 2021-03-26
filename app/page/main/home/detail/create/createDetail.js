import React, { Component } from 'react';
import { Animated, Dimensions, Platform, SafeAreaView, StyleSheet, View } from 'react-native';

import AppManager from '../../../../../manager/appManager';

import Layout1 from './layout-1';
import Colors from '../../../../../constant/Colors';
import Styles from '../../../../../constant/Styles';
import ApiRequest from '../../../../../helper/ApiRequest';


export default class CreateDetail extends Component
{
  _manager = null;
  _pageName = 'create';
  _defaultProps = null;

  constructor(props)
  {
    console.log('CreateDetail()');
    super(props);

    // Fetch page data
    this._manager = AppManager.GetInstance();
    const page = this._manager.getPage(this._pageName);

    // MARK: - Custom
    this._defaultProps =
    {
      owner: props.user._id,
      showInFeed: true
    };

    this.state =
    {
      isLoading: false,
      detail: {...this._defaultProps},
      presets: {},
      modal: {},
      page: page,
      modalVisible: false,
    };
  }

  create = async () =>
  {
    console.log('CreateDetail.create()');
    this.setState({ isLoading: true });

    try
    {
      let params = {  detail: this.state.detail };
      params.detail.customId = params.detail.customId.replace('/', '');
      let response = await ApiRequest.sendRequest("post", params, "detail/create");
      if(response.data.error === null)
      {
        // MARK: - Custom
        const detail = {...this._defaultProps};
        let presets = {...this.state.presets};
        detail.customId = presets.customId;
        presets.customId = presets.customId.substr(0, presets.customId.lastIndexOf('-') + 1) + parseInt(presets.customId.substr(presets.customId.lastIndexOf('-') + 1, presets.customId.length)) + 1;

        this.setState({ isLoading: false, detail: detail, presets: presets });
        this.props.showAlert('Success', response.data.message);
        return;
      }

      this.setState({ isLoading: false  });
      this.props.showAlert('Error', response.data.error.toString());
    }
    catch(err)
    {
      this.setState({ isLoading: false  });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 5 ' + err.message, 'danger');
    }
  }

  loadPresets = async () =>
  {
    console.log('CreateDetail.loadPresets()');
    this.setState({ isLoading: true });

    try
    {
      let response = await ApiRequest.sendRequest("post", {}, "detail/presets");
      if(response.data.error === null)
      {
        // Apply preset values to detail
        const detail = this.state.detail;
        const keys = Object.keys(response.data.results);
        for(let i = 0; i < keys.length; i++)
        {
          detail[keys[i]] = response.data.results[keys[i]];
        }

        // MARK: - Custom
        // If selected already make selected
        const modal = response.data.modal;
        modal.originalData = modal.data;
        if(detail.invitedUsers)
        {
          for(let i = 0; i < modal.data.length; i++)
          {
            if(detail.invitedUsers.indexOf(modal.data[i]._id) !== -1)
            {
              modal.data[i]._isSelected = true;
              modal.data[i]._styleClassName = 'selectedRow';
            }
          }
        }

        this.setState(
        {
          isLoading: false,
          detail: detail,
          presets: response.data.results,
          modal: modal
        });
        return;
      }

      this.setState({ isLoading: false  });
      this.props.showAlert('Error', response.data.error.toString());
    }
    catch(err)
    {
      console.log(err.stack);
      this.setState({ isLoading: false  });
      this.props.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 6 ' + err.message);
    }
  }

  /**
    Allow child page to update our formInput state
    @param  {String}  id  Id of state to update
    @param  {Any}     value   The value to update to
    @param  {Bool}    isDetail  If we are modifying the detail record
  */
  updateMasterState = (id, value, isDetail) =>
  {
    if(isDetail)
    {
      const detail = {...this.state.detail};
      detail[id] = value;
      // MARK: - Custom
      if(id === 'customId')
      {
        detail[id] = ('/' + value.replace('/', '').replace(' ', '-')).toLowerCase();
      }
      this.setState({ 'detail': detail });
    }
    else
    {
      this.setState({ [id]: value });
    }
  }

  selectModalRow = (row) =>
  {
    // Adjust modal data
    const modal = {...this.state.modal};
    const record = modal.data[row];
    record._isSelected = !record._isSelected;
    record._styleClassName = (record._isSelected ? 'selectedRow' : '');
    modal.data[row] = record;

    // Adjust detail data
    // MARK: - Custom
    let detail = {...this.state.detail};
    let invitedUsers = detail.invitedUsers;

    // Remove if already there
    let removed = false;
    for(let i = 0; i < invitedUsers.length; i++)
    {
      if(invitedUsers[i]._id.toString() === record._id.toString())
      {
        invitedUsers.splice(i, 1);
        removed = true;
        break;
      }
    }
    // Add if not
    if(!removed)
    {
      invitedUsers.push(record);
    }


    this.setState({ modal: modal, detail: detail });
  }

  async componentDidMount()
  {
    this.loadPresets();
  }

  render()
  {
    console.log('CreateDetail.render()');
    return (
      <View style={{backgroundColor: Colors.purple}}>
        <Layout1
          isLoading={this.state.isLoading}
          detail={this.state.detail}
          updateMasterState={this.updateMasterState}
          create={this.create}
          modalVisible={this.state.modalVisible}
          modalData={this.state.modal.data}
          selectModalRow={this.selectModalRow}
          showAlert={this.props.showAlert}
        />
      </View>
    );
  }
}
