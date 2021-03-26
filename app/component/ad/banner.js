import React from 'react';
import { AdMobBanner } from 'react-native-admob';

const AdBanner = ({ toggleIsShowing, adUnitID }) =>
{
  console.log(adUnitID);
  return (
  <AdMobBanner
    adSize="largeBanner"
    adUnitID={adUnitID}
    testDevices={[AdMobBanner.simulatorId]}
    onAdFailedToLoad={(err) => { console.log('onAdFailedToLoad' + err.message); toggleIsShowing() }}
    onAdLoaded={(msg) => { console.log('OnAdLoaded: ' + msg.toString()); toggleIsShowing(); }}
    onAdClosed={(msg) => { console.log('onAdFailedToLoad' + err); toggleIsShowing(); }}
  />);
};

export default AdBanner;
