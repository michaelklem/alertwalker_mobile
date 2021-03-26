import React from 'react';

import Layout1 from './layout-1';
import Layout2 from './layout-2';
import Layout3 from './layout-3';
import Layout4 from './layout-4';
import Layout5 from './layout-5';

const Login = ({isLoading,
                displayFormInputs,
                layout,
                guestAccessAllowed,
                segue,
                components,
                updateMasterState }) =>
{

  function getLoginContainerPropValue(prop)
  {
    // Find form component
    let formComponent = null;
    for(let i = 0; i < components.length; i++)
    {
      if(components[i].type === 'form')
      {
        // Find _login_container_
        for(let i = 0; i < components[i].form.length; i++)
        {
          if(components[i].form[i].type === '_login_container_')
          {
            return components[i].form[i][prop];
          }
        }
        break;
      }
    }
  }


  switch(layout)
  {
    case 1:
      return (
      <Layout1
        isLoading={isLoading}
        displayFormInputs={displayFormInputs}
        segue={(toPage) => segue(toPage)}
        guestAccessAllowed={guestAccessAllowed}
      />);
    case 2:
      return (
        <Layout2
          isLoading={isLoading}
          displayFormInputs={displayFormInputs}
          segue={(toPage) => segue(toPage)}
          guestAccessAllowed={guestAccessAllowed}
        />);
    case 3:
      return (
        <Layout3
          isLoading={isLoading}
          displayFormInputs={displayFormInputs}
          segue={(toPage) => segue(toPage)}
          guestAccessAllowed={guestAccessAllowed}
      />);
    case 4:
      return (
        <Layout4
          isLoading={isLoading}
          displayFormInputs={displayFormInputs}
          segue={(toPage) => segue(toPage)}
          guestAccessAllowed={guestAccessAllowed}
          components={components}
          getLoginContainerPropValue={getLoginContainerPropValue}
          updateFormInput={(prop, val) =>
          {
            // Find form component
            for(let i = 0; i < components.length; i++)
            {
              if(components[i].type === 'form')
              {
                // Find _login_container_
                for(let i = 0; i < components[i].form.length; i++)
                {
                  if(components[i].form[i].type === '_login_container_')
                  {
                    components[i].form[i][prop] = val;
                    updateMasterState({ 'components': components });
                    return;
                  }
                }
                break;
              }
            }
          }}
      />);
    case 5:
      return (
        <Layout5
          isLoading={isLoading}
          displayFormInputs={displayFormInputs}
          segue={(toPage) => segue(toPage)}
          guestAccessAllowed={guestAccessAllowed}
          components={components}
          getLoginContainerPropValue={getLoginContainerPropValue}
          updateFormInput={(prop, val) =>
          {
            // Find form component
            for(let i = 0; i < components.length; i++)
            {
              if(components[i].type === 'form')
              {
                // Find _login_container_
                for(let i = 0; i < components[i].form.length; i++)
                {
                  if(components[i].form[i].type === '_login_container_')
                  {
                    components[i].form[i][prop] = val;
                    updateMasterState({ 'components': components });
                    return;
                  }
                }
                break;
              }
            }
          }}
      />);
    default:
      throw new Error('Unknown layout specified');
  }
};


export default Login;
