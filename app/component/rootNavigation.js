import * as React from 'react';

export const NavigationRef = React.createRef();

export function navigate(name, params)
{
  NavigationRef.current?.navigate(name, params);
}

export function getCurrentRoute()
{
  let rootState = NavigationRef.current.getRootState();
  let subRoute = rootState.routes[rootState.index];
  while (subRoute && subRoute.state)
  {
    subRoute = subRoute.state.routes[subRoute.state.index];
  }
  return subRoute.name;
}
