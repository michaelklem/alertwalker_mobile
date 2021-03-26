import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { MyButton } from '../myButton';
import { ImageButton } from '../imageButton';
import { AppText, Colors, Images, Styles } from '../../constant';
import { WebRtcClient } from '../../client';
import ApiRequest from '../../helper/ApiRequest';

import { RTCView } from 'react-native-webrtc';
import InCallManager from 'react-native-incall-manager';

/**
    Call prop contains
    user
    contact
    status
*/
const CallTimeoutMs = 30000;
export default class AudioCall extends Component
{
  static _ref = null;
  _webRtcClient = null;
  _useInAppCall = false;

  constructor(props)
  {
    super(props);
    this.state =
    {
      call:
      {
        contact: null,
        user: null,
        status: '',
        _id: '',
        offer: null,
        answer: null
      },
      speakerOn: false,
      muted: false,
      allowVideo: false,
      connectionState: '',
      candidateState: '',
    };
  }

  async componentDidMount()
  {
    this._webRtcClient = await WebRtcClient.GetInstanceA(this.onConnectionStateChange, this.onCandidateStateChange, this.props.showAlert);

    const perm = await InCallManager.checkRecordPermission();
    console.log(perm);
  }

  static setRef(ref = {})
  {
    AudioCall._ref = ref;
  }

  static getRef()
  {
    return AudioCall._ref;
  }

  /**
    Show incoming call
    @param  {Object}  callObj   The call incoming
  */
  static ShowCall = async(callObj) =>
  {
    InCallManager.startRingtone('_DEFAULT_');
    AudioCall._ref.updateState({ call: callObj });
    setTimeout(() =>
    {
      const call = AudioCall._ref.getCall();
      console.log(call);
      // Not answered
      if(call.status === 'incomingAudioCall')
      {
        // Hang it up
        call.status = '';
        call.user = null;
        call.contact = null;
        call._id = '';
        call.offer = null;
        InCallManager.stopRingtone();
        AudioCall._ref.updateState({ call: call });
      }
    }, CallTimeoutMs);
  }

  static Hide()
  {
    AudioCall._ref.current.setState({ call: null });
  }

  getCall = () =>
  {
    return {...this.state.call};
  }

  updateState = (state) =>
  {
    this.setState(state);
  }

  updateMasterState = (state) =>
  {
    this.props.updateMasterState(state);
  }

  showAlert = (title, msg) =>
  {
    this.props.showAlert(title, msg);
  }

  createCall = (userId) =>
  {
    return this._webRtcClient.createCall(userId);
  }

  acceptCall = (offer, userId) =>
  {
    return this._webRtcClient.acceptCall(offer, userId);
  }

  callAnswered = (answer) =>
  {
    this._webRtcClient.callAnswered(answer);
  }

  declineCall = () =>
  {
    this._webRtcClient.declineCall();
  }

  onConnectionStateChange = (newState) =>
  {
    this.setState({ connectionState: newState });
  }

  onCandidateStateChange = (newState) =>
  {
    this.setState({ candidateState: newState });
  }


  /**
    Create a call
    @param  {Object}  callObj  {status: String, user: User, contact: Contact, _id: String}
  */
  static CreateCall = async(callObj) =>
  {
    console.log(callObj);
    console.log('\tAudioCall.createCall()');

    if(!this._useInAppCall)
    {
      if(callObj.contact)
      {
        console.log(callObj.contact.phoneNumbers[0]);
        if(callObj.contact.phoneNumbers.length > 0)
        {
          Linking.openURL(`tel:${callObj.contact.phoneNumbers[0]}`);
        }
      }
      else if(callObj.user)
      {
        Linking.openURL(`tel:${callObj.user.phone}`);
      }
      return;
    }

    AudioCall._ref.updateMasterState({ isLoading: true });
    try
    {
      let offer = null;
      let params = null;
      if(callObj.contact)
      {
        offer = await AudioCall._ref.createCall(callObj.contact.existingUser._id.toString());
        params =
        {
          offer: offer,
          otherUserId: callObj.contact.existingUser._id.toString()
        };
      }
      else if(callObj.user)
      {
        offer = await AudioCall._ref.createCall(callObj.user._id.toString());
        params =
        {
          offer: offer,
          otherUserId: callObj.user._id.toString()
        };
      }
      else
      {
        throw new Error('Invalid call object received');
      }

      let response = await ApiRequest.sendRequest("post", params, 'chat/call');
      console.log(response.data);

      // Success
      if(response.data.error !== null)
      {
        AudioCall._ref.updateMasterState({ isLoading: false });
        AudioCall._ref.showAlert('Error', response.data.error);
        return;
      }
      const call = AudioCall._ref.getCall();
      call._id = response.data.results._id;
      call.status = response.data.results.status;
      call.contact = callObj.contact;
      call.user = callObj.user;

      InCallManager.start({ media: 'audio', ringback: '_DEFAULT_', auto: true });
      //InCallManager.start({ media: 'video', auto: true });
      InCallManager.setForceSpeakerphoneOn(true);
      InCallManager.setSpeakerphoneOn(true);

      AudioCall._ref.updateState({ call: call });
      AudioCall._ref.updateMasterState({ isLoading: false });
    }
    catch(err)
    {
      console.log(err);
      AudioCall._ref.updateMasterState({ isLoading: false });
      AudioCall._ref.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  }

  /**
    Accept a call
  */
  static AcceptCall = async() =>
  {
    console.log('\tAudioCall.acceptCall()');
    AudioCall._ref.updateMasterState({ isLoading: true });
    try
    {
      const call = AudioCall._ref.getCall();
      const answer = await AudioCall._ref.acceptCall(call.offer, call.user._id.toString());

      let params =
      {
        answer: answer,
        id: call._id
      };

      let response = await ApiRequest.sendRequest("post", params, 'chat/answer-call');
      console.log(response.data);

      // Success
      if(response.data.error !== null)
      {
        AudioCall._ref.updateMasterState({ isLoading: false });
        AudioCall._ref.showAlert('Error', response.data.error);
        return;
      }

      call.status = 'active';
      call.answer = answer;

      InCallManager.start({ media: 'audio', auto: true });
      InCallManager.setForceSpeakerphoneOn(true);
      InCallManager.setSpeakerphoneOn(true);

      //InCallManager.stopRingback();
      InCallManager.stopRingtone();

      AudioCall._ref.updateState({ call: call });
      AudioCall._ref.updateMasterState({ isLoading: false });
    }
    catch(err)
    {
      console.log(err);
      AudioCall._ref.updateMasterState({ isLoading: false });
      AudioCall._ref.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  }

  static CallAnswered = async(answer) =>
  {
    console.log('\tAudioCall.callAnswered()');
    try
    {
      const call = AudioCall._ref.getCall();
      await AudioCall._ref.callAnswered(answer);

      call.status = 'active';
      call.answer = answer;

      InCallManager.stopRingback();
      InCallManager.stopRingtone();

      AudioCall._ref.updateState({ call: call });
    }
    catch(err)
    {
      console.log(err);
      AudioCall._ref.updateMasterState({ isLoading: false });
      AudioCall._ref.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  }

  static DeclineCall = async(callId) =>
  {
    console.log('\tAudioCall.declineCall()');
    const call = AudioCall._ref.getCall();

    if(callId.toString() !== call._id.toString())
    {
      console.log("Tried to hangup bad call ID " + callId);
      return;
    }

    // Kill sounds
    InCallManager.stop();
    InCallManager.stopRingback();
    InCallManager.stopRingtone();

    // Disable audio stream
    AudioCall._ref.declineCall();

    // Tell backend
    AudioCall._ref.updateMasterState({ isLoading: true });
    try
    {
      let params =
      {
        id: call._id
      };

      call.status = '';
      call.user = null;
      call.contact = null;
      call._id = '';
      call.answer = null;
      AudioCall._ref.updateState({ call: call });

      let response = await ApiRequest.sendRequest("post", params, 'chat/decline-call');
      console.log(response.data);

      // Success
      if(response.data.error !== null)
      {
        AudioCall._ref.updateMasterState({ isLoading: false });
        AudioCall._ref.showAlert('Error', response.data.error);
        return;
      }

      AudioCall._ref.updateMasterState({ isLoading: false });
    }
    catch(err)
    {
      console.log(err);
      InCallManager.stopRingback();
      InCallManager.stopRingtone();
      AudioCall._ref.updateMasterState({ isLoading: false });
      AudioCall._ref.showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  }

  shouldComponentUpdate(nextProps, nextState)
  {
    return (
      nextState.call.contact !== this.state.call.contact ||
      nextState.call.user !== this.state.call.user ||
      nextState.call.status !== this.state.call.status ||
      nextState.speakerOn !== this.state.speakerOn ||
      nextState.muted !== this.state.muted ||
      nextState.connectionState !== this.state.connectionState ||
      nextState.call.answer !== this.state.call.answer ||
      nextState.candidateState !== this.state.candidateState
    );
  }


  render()
  {
    console.log('\tAudioCall.render()');
    console.log(this.state.call);
    let photo = '';
    let firstName = '';
    let lastName = '';
    let company = '';
    let url = '';
    let city = '';

    if(this.state.call.contact || this.state.call.user)
    {
      photo = this.state.call.contact ? this.state.call.contact.existingUser.photo : this.state.call.user.photo;
      firstName = this.state.call.contact ? this.state.call.contact.firstName : this.state.call.user.firstName;
      lastName = this.state.call.contact ? this.state.call.contact.lastName : this.state.call.user.lastName;
      company = this.state.call.contact ? this.state.call.contact.company : '';
      url = this.state.call.contact ? this.state.call.contact.url : '';
      city = this.state.call.contact ? this.state.call.contact.city : '';
    }

    return (
      <Modal
        animationType={'slide'}
        transparent={true}
        visible={this.state.call.status !== ''}
      >
        <View style={styles.container}>
          <View style={styles.center}>
            <View style={styles.overlay} />
            <View style={styles.card}>

              <View style={styles.infoSection}>
                <ImageButton
                  imgSrc={photo ? {uri: photo, cache: 'force-cache'} : Images.noPhoto}
                  imageStyle={styles.userPhoto}
                />
                <View style={styles.textRow}>
                  <Text
                    style={styles.name}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >{`${firstName} ${lastName}`}</Text>
                  <Text
                    style={styles.subText}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >{`${company}`}</Text>
                  <Text
                    style={styles.subText}
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >{`${url} ${city}`}</Text>
                </View>
              </View>

              <View style={styles.actionSection}>

              {this.state.call.status === 'active' &&
                <ImageButton
                  imgSrc={Images.callSpeakerIcon}
                  imageStyle={styles.speakerIcon}
                  titleStyle={[styles.actionIcon, this.state.speakerOn ? {backgroundColor: Colors.green1} : '']}
                  onPress={() =>
                  {
                    console.log('AudioCall.toggleSpeaker: ' + !this.state.speakerOn);
                    InCallManager.setSpeakerphoneOn(!this.state.speakerOn);
                    this.setState({ speakerOn: !this.state.speakerOn });
                  }}
                />}
                {this.state.call.status === 'active' &&
                <ImageButton
                  imgSrc={Images.callMuteIcon}
                  imageStyle={styles.muteIcon}
                  titleStyle={[styles.actionIcon, this.state.muted ? {backgroundColor: Colors.green1} : '']}
                  onPress={async() =>
                  {
                    console.log('AudioCall.toggleMute: ' + !this.state.muted);
                    this._webRtcClient.toggleMute();
                    this.setState({ muted: !this.state.muted });
                  }}
                />}

                {this.state.call.status === 'outgoingAudioCall' &&
                <>
                  <View />
                  <View />
                  <View style={{justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.statusText}>{AppText.audioCall.calling.text}</Text>
                    <ImageButton
                      imgSrc={Images.callEndIcon}
                      imageStyle={styles.endIcon}
                      titleStyle={[styles.actionIcon, {backgroundColor: Colors.maroon1}]}
                      onPress={() =>
                      {
                        AudioCall.DeclineCall(AudioCall._ref.getCall()._id);
                      }}
                    />
                  </View>
                </>}

                {this.state.call.status === 'active' &&
                <ImageButton
                  imgSrc={Images.callEndIcon}
                  imageStyle={styles.endIcon}
                  titleStyle={[styles.actionIcon, {backgroundColor: Colors.maroon1}]}
                  onPress={() =>
                  {
                    console.log(AudioCall._ref);
                    AudioCall.DeclineCall(AudioCall._ref.getCall()._id);
                  }}
                />}

                {this.state.call.status === 'incomingAudioCall' &&
                <>
                  <View />
                  <View />
                  <View style={{justifyContent: 'flex-end', flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.statusText}>{AppText.audioCall.answer.text}</Text>
                    <ImageButton
                      imgSrc={Images.callStartIcon}
                      imageStyle={styles.endIcon}
                      titleStyle={[styles.actionIcon, {backgroundColor: Colors.yellow}]}
                      onPress={() =>
                      {
                        console.log('Accept');
                        AudioCall.AcceptCall();
                      }}
                    />
                  </View>
                </>}
              </View>

              {this._webRtcClient &&
              this.state.allowVideo &&
              <RTCView streamURL={this._webRtcClient.audioStream().toURL()} style={styles.rtcView}/>}

              <Text style={[styles.statusText, { color: Colors.white } ]}>{`Connection state: ${this.state.connectionState}`}</Text>
              <Text style={[styles.statusText, { color: Colors.white } ]}>{`Candidate state: ${this.state.candidateState}`}</Text>
              <TextInput
                value={'Answer: ' + JSON.stringify(this.state.call.answer)}
                multiline={true}
                style={{width: '100%', height: '100%', backgroundColor: Colors.white, color: Colors.black }}
              />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
};

/*
<Image
  source={this.state.isLinked ? Images.checkFilled : Images.checkEmpty}
  style={styles.check}
/>
<MyButton
  buttonStyle={styles.button}
  titleStyle={styles.buttonText}
  title={AppText.calendarButton.mobileCalendarButton.apple.text}
  linearGradient={[Colors.darkBlue2, Colors.darkBlue2]}
  onPress={async() => this.state.isLinked ? console.log("Already linked") : this.requestPermission()}
/>
*/

const sixteen = Math.round(Dimensions.get('window').width * 0.04);
const twelvePercentWidth = Math.round(Dimensions.get('window').width * 0.12);
const twentyWidth = Math.round(Dimensions.get('window').height * 0.0256);
const twentyFive = Math.round(Dimensions.get('window').height * 0.032);
const sixteenPercent = Math.round(Dimensions.get('window').width * 0.15);
const height18 = Math.round(Dimensions.get('window').height * 0.02307);
const height10 = Math.round(Dimensions.get('window').height * 0.01282);
const height16 = Math.round(Dimensions.get('window').height * 0.0205);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
  },
  center: {
    width: '100%',
    height: '100%',
  },
  textRow: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: twentyFive,
  },
  speakerIcon: {
    width: Math.round(Dimensions.get('window').width * 0.083),
    height: Math.round(Dimensions.get('window').height * 0.0294),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  muteIcon: {
    width: Math.round(Dimensions.get('window').width * 0.0583),
    height: Math.round(Dimensions.get('window').height * 0.03717),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  endIcon: {
    width: Math.round(Dimensions.get('window').width * 0.085),
    height: Math.round(Dimensions.get('window').height * 0.04),
    resizeMode: 'cover',
    alignSelf: 'center',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: Colors.black,
    opacity: 0.8,
  },
  card: {
    width: Math.round(Dimensions.get('window').width * 0.88),
    height: Math.round(Dimensions.get('window').height * 0.24),
    borderRadius: 25,
    backgroundColor: Colors.white,
    top: Math.round(Dimensions.get('window').height * 0.05),
    alignSelf: 'center',
    flexDirection: 'column',
  },
  infoSection: {
    flexDirection: 'row',
    width: '100%',
    height: '50%'
  },
  actionIcon: {
    width: sixteenPercent,
    height: sixteenPercent,
    borderRadius: sixteenPercent / 2,
    backgroundColor: Colors.white,
    borderColor: Colors.plainGray4,
    resizeMode: 'contain',
    borderWidth: 0.4,
    justifyContent: 'center',
  },
  actionSection: {
    flexDirection: 'row',
    width: '100%',
    height: '50%',
    justifyContent: 'space-between',
    paddingHorizontal: twentyWidth,
  },
  rtcView: {
    width: '100%',
    height: '50%',
  },
  userPhoto: {
    width: sixteenPercent,
    height: sixteenPercent,
    borderRadius: sixteenPercent / 2,
    resizeMode: 'cover',
    backgroundColor: Colors.black,
    borderColor: Colors.black,
    borderWidth: 1,
    margin: twentyWidth,
  },
  name: {
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
    textAlign: 'left',
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.035),
    color: Colors.budget.background,
  },
  subText: {
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
    fontSize: height10,
    textAlign: 'left',
    width: '100%',
    height: Math.round(Dimensions.get('window').height * 0.0205),
    color: Colors.budget.background,
  },
  statusText: {
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
    marginRight: sixteen,
    textAlign: 'center',
    color: Colors.blackText,
  },
});

module.exports = AudioCall;
