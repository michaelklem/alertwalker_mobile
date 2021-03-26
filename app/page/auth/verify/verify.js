import React from 'react';

import Layout1 from './layout-1';

const Verify = ({ isLoading,
                    displayFormInputs,
                    displayComponents,
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
          displayComponents={displayComponents}
          guestAccessAllowed={guestAccessAllowed}
          segue={(toPage) => segue(toPage)}
        />);
    default:
      throw new Error('Unknown layout specified');
  }
};

export default Verify;
