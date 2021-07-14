import React from 'react';
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
};


export default Login;
