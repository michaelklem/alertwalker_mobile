import AppJson from '../../app.json';
import React from 'react';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  MediaStream,
  MediaStreamTrack,
  mediaDevices,
  registerGlobals
} from 'react-native-webrtc';

import { WebsocketClient } from '.';
import { AppManager } from '../manager';


// TODO: Change the answer/offer from the datbase schema to be objects instead of text
export default class WebRtcClient
{
  static #instance = null;
  #appMgr = null;
  // RTCPeerConnection
  #client = null;
  // Our stream
  #audioStream = null;
  // Partner stream
  #remoteStream = null;

  #partnerUserId = '';

  #iceCandidatesQueue = [];

  #status = null;

  onConnectionStateChangeCb = null;
  onCandidateStateChangeCb = null;
  showAlert = null;

  // Singleton accessor
  /**
    @returns {WebRtcClient}
   */
  static async GetInstanceA(onConnectionStateChangeCb, onCandidateStateChangeCb, showAlert)
  {
    // Initialize
    if(WebRtcClient.#instance == null)
    {
      WebRtcClient.#instance = new WebRtcClient();
      WebRtcClient.#instance.#appMgr = AppManager.GetInstance();
      WebRtcClient.#instance.showAlert = showAlert;
    }

    // Establish connection
    if(WebRtcClient.#instance.#client === null)
    {
      const iceServers = WebRtcClient.#instance.#appMgr.getIceServers();

      // Setup connection to STUN server
      WebRtcClient.#instance.#client = new RTCPeerConnection({
        iceServers: iceServers
      });

      console.log('\t\tClient.<WebRtc> peer connection created');
      console.log(iceServers);

      // Grab audio stream and connect it to our RTCPeerConnection
      WebRtcClient.#instance.#audioStream = await mediaDevices.getUserMedia({ audio: true/*, video: true*/ });
      WebRtcClient.#instance.#client.addStream(WebRtcClient.#instance.#audioStream);

      // Setup handlers
      WebRtcClient.#instance.#client.onaddstream = WebRtcClient.#instance.onAddStream;
      WebRtcClient.#instance.#client.onicecandidate = WebRtcClient.#instance.onIceCandidate;
      WebRtcClient.#instance.#client.onconnectionstatechange = WebRtcClient.#instance.onConnectionStateChange;
      WebRtcClient.#instance.#client.onicegatheringstatechange = WebRtcClient.#instance.onIceGatheringStateChanged;

      WebRtcClient.#instance.onConnectionStateChangeCb = onConnectionStateChangeCb;
      WebRtcClient.#instance.onCandidateStateChangeCb = onCandidateStateChangeCb;

      console.log('\t\tClient.<WebRtc> instantiated');
    }

    return WebRtcClient.#instance;
  }

  static GetInstance()
  {
    return WebRtcClient.#instance;
  }

  audioStream()
  {
    return this.#audioStream;
  }

  /**
    Called when remote connects to us
  */
  onAddStream(evt)
  {
    console.log('On Add Stream', evt.stream);
    WebRtcClient.#instance.#remoteStream = evt.stream;
  }

  /**
    Called when ICE candidate found, need to send to remote
  */
  onIceCandidate(evt)
  {
    console.log('On Ice Candidate', evt.candidate);
    if(evt.candidate !== null)
    {
      WebsocketClient.GetInstance().sendIceCandidate(evt.candidate, WebRtcClient.#instance.#partnerUserId.toString());
    }
  }

  onIceGatheringStateChanged(evt)
  {
    WebRtcClient.#instance.onCandidateStateChangeCb(evt.target.iceGatheringState);
    console.log('On Ice Gather State Changed', evt.target.iceGatheringState);
  }

  onConnectionStateChange(evt)
  {
    // TODO: Add debug mode option to make this pop up alerts so others can see it and forward to me
    WebRtcClient.#instance.onConnectionStateChangeCb(evt.target.connectionState);
    console.log('On Connection State Changed', evt.target.connectionState);
  }

  async setIceCandidate(candidate)
  {
    try
    {
      if(candidate !== null)
      {
        if(this.#client === null)
        {
          await this.openConnection();
        }
        if(this.#status === 'answered')
        {
          this.#client.addIceCandidate(new RTCIceCandidate(candidate));
        }
        else
        {
          this.#iceCandidatesQueue.push(candidate);
        }
      }
      console.log('\t\tClient.<WebRTC> setIceCandidate received null candidate');
    }
    catch(err)
    {
      this.showAlert('Uh-oh', err.message);
    }
  }

  /**
    Sends an offer to the backend and lets it try to contact the other user
    @param  {String}  otherUserId The ID of the user to call
    @returns  {Offer} offer
  */
  async createCall(otherUserId)
  {
    console.log('\tWebRtc.createCall(' + otherUserId + ')');

    this.#partnerUserId = otherUserId;
    console.log('Partner ID: ' + this.#partnerUserId);

    if(this.#client === null)
    {
      await this.openConnection();
    }

    // Create offer and set it
    const offer = await this.#client.createOffer();
    await this.#client.setLocalDescription(offer);

    return offer;
  }

  /**
    Accept an offer and join the call
    @param  {Offer} offer   WebRTC Offer
    @param  {String}  otherUserId The ID of the user making call
    @returns  {Answer}  WebRTCAnswer
  */
  async acceptCall(offer, otherUserId)
  {
    try
    {
      this.#partnerUserId = otherUserId;
      console.log('Partner ID: ' + this.#partnerUserId);

      if(this.#client === null)
      {
        await this.openConnection();
      }

      await this.#client.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.#client.createAnswer();
      await this.#client.setLocalDescription(answer);

      this.#status = 'answered';
      this.processIceCandidateQueue();

      console.log('Answer', answer);

      console.log('\t\tClient.<WebRtc> call answered');
      return answer;
    }
    catch(err)
    {
      this.showAlert('Uh-oh', err.message);
    }
  }

  /**
    Decline a call
  */
  async declineCall()
  {
    this.#remoteStream = null;
    this.#client.close();
    this.#client = null;
    this.#partnerUserId = null;

    this.#status = null;
  }

  async openConnection()
  {
    try
    {
      const iceServers = this.#appMgr.getIceServers();

      // Setup connection to STUN server
      WebRtcClient.#instance.#client = new RTCPeerConnection({
        iceServers: iceServers
      });

      console.log('\t\tClient.<WebRtc> peer connection created', iceServers);

      // Grab audio stream and connect it to our RTCPeerConnection
      WebRtcClient.#instance.#audioStream = await mediaDevices.getUserMedia({ audio: true/*, video: true*/ });
      WebRtcClient.#instance.#client.addStream(WebRtcClient.#instance.#audioStream);

      // Setup handlers
      WebRtcClient.#instance.#client.onaddstream = WebRtcClient.#instance.onAddStream;
      WebRtcClient.#instance.#client.onicecandidate = WebRtcClient.#instance.onIceCandidate;
      WebRtcClient.#instance.#client.onconnectionstatechange = WebRtcClient.#instance.onConnectionStateChange;
      WebRtcClient.#instance.#client.onicegatheringstatechange = WebRtcClient.#instance.onIceGatheringStateChanged;

      console.log('\t\tClient.<WebRtc> instantiated');
    }
    catch(err)
    {
      this.showAlert('Uh-oh', err.message);
    }
  }

  /**
    Call was answered, connect the initiator to the acceptor
    @param  {Answer} answer   WebRTC Answer
  */
  async callAnswered(answer)
  {
    try
    {
      console.log('Answer', answer);
      //await this.#client.setRemoteDescription(new RTCSessionDescription(JSON.parse(answer.replace(/[\r]?[\n]/g, '\\n'))));
      await this.#client.setRemoteDescription(new RTCSessionDescription(JSON.parse(JSON.stringify(answer))));
      this.#status = 'answered';
      this.processIceCandidateQueue();
    }
    catch(err)
    {
      console.log(err);
      this.showAlert('Uh-oh', err.message);
    }
  }

  async toggleMute()
  {
    this.#audioStream._tracks[0].enabled = !this.#audioStream._tracks[0].enabled;
  }

  processIceCandidateQueue()
  {
    try
    {
      for(let i = 0; i < this.#iceCandidatesQueue.length; i++)
      {
        this.#client.addIceCandidate(new RTCIceCandidate(this.#iceCandidatesQueue[i]));
      }
      this.#iceCandidatesQueue = [];
    }
    catch(err)
    {
      this.showAlert('Uh-oh', err.message);
    }
  }
}
