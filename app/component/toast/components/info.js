import React from 'react';

import BaseToast from './base';
import { Colors, Images } from '../../../constant';

function InfoToast(props) {
  return (
    <BaseToast
      {...props}
      style={{ borderLeftColor: Colors.toast.lightSkyBlue }}
      leadingIcon={Images.toastInfo}
    />
  );
}

InfoToast.propTypes = BaseToast.propTypes;

export default InfoToast;
