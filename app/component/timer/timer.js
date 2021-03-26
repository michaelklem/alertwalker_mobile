import React, { Component } from 'react';
import { Text } from 'react-native';

export default class Timer extends Component
{
  _intervalId = null;
  constructor(props)
  {
    super(props);
    this.state =
    {
      remainingMins: props.totalMinutes,
      isActive: props.isActive
    }
  }

  componentDidMount()
  {
    if (this.state.isActive)
    {
      this._intervalId = setInterval(() =>
      {
        this.setState({ remainingMins: this.state.remainingMins - 1 });
      }, 60 * 1000);
    }
    else if (!this.state.isActive && this.state.remainingMins !== 0)
    {
      this.setState({ remainingMins: 0 });
    }
  }

  componentDidUpdate()
  {
    if(this.state.remainingMins <= 0)
    {
      clearInterval(this._intervalId);
    }
  }

  formatNumber = (number) =>
  {
    return `0${number}`.slice(-2);
  }
  getRemaining = () =>
  {
    const mins = Math.floor(this.state.remainingMins / 60);
    const secs = this.state.remainingMins - mins * 60;
    return { mins: this.formatNumber(mins), secs: this.formatNumber(secs) };
  }

  render()
  {
    const { mins, secs } = this.getRemaining(this.state.remainingMins);

    return (
      <Text style={this.props.textStyle}>{`${mins}:${secs}`}</Text>
    );
  }
};
