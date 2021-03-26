import React from 'react';

import Layout1 from './layout-1';
import Layout2 from './layout-2';
import Layout3 from './layout-3';

const Reset = ({ isLoading,
                    displayFormInputs,
                    layout,
                    guestAccessAllowed,
                    segue }) =>
{
  switch(layout)
  {
    case 1:
      return (
        <Layout1
          isLoading={isLoading}
          displayFormInputs={displayFormInputs}
          guestAccessAllowed={guestAccessAllowed}
          segue={(toPage) => segue(toPage)}
        />);
    case 2:
      return (
        <Layout2
          isLoading={isLoading}
          displayFormInputs={displayFormInputs}
          guestAccessAllowed={guestAccessAllowed}
          segue={(toPage) => segue(toPage)}
        />);
    case 3:
      return (
        <Layout3
          isLoading={isLoading}
          displayFormInputs={displayFormInputs}
          guestAccessAllowed={guestAccessAllowed}
          segue={(toPage) => segue(toPage)}
        />);
    default:
      throw new Error('Unknown layout specified');
  }
};

export default Reset;
