import React, { useState } from 'react';

import Layout1 from './layout-1';

const Welcome = ({ isLoading,
                    updateGlobalState,
                    layout,
                    user,
                    segue,
                    inviteCodeRequired,
                    updateMasterState,
                    inviteCode,
                    verifyInviteCode }) =>
{
  switch(layout)
  {
    case 1:
      return (
        <Layout1
          isLoading={isLoading}
          updateGlobalState={updateGlobalState}
          user={user}
          segue={(toPage) => segue(toPage)}
          inviteCodeRequired={inviteCodeRequired}
          updateMasterState={updateMasterState}
          inviteCode={inviteCode}
          verifyInviteCode={verifyInviteCode}
        />);
    default:
      throw new Error('Unknown layout specified');
  }
};

export default Welcome;
