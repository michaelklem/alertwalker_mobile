import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';

import Styles from '../../constant/Styles';
import Colors from '../../constant/Colors';
import AppJson from '../../../app.json';


 const Layout1 = ({ }) =>
 {
   return (
     <View style={[Styles.fullScreen, Styles.backgroundColor]}>
       <Image
         source={require('../../asset/logo2.png')}
         style={styles.loadingLogo}
       />
       <Text
         adjustsFontSizeToFit={true}
         numberOfLines={1}
         style={styles.companyTitle}
       >{AppJson.displayName.toUpperCase()}</Text>
       <Text
         adjustsFontSizeToFit={true}
         numberOfLines={2}
         style={styles.description}
       >{AppJson.description}</Text>
     </View>
   );
 }

 const styles = StyleSheet.create({
   loadingLogo: {
     marginTop: Math.round(Dimensions.get('window').height * 0.33),
     width: Math.round(Dimensions.get('window').width * 0.33),
     height: Math.round(Dimensions.get('window').height * 0.085),
     alignSelf: 'center',
     resizeMode: 'contain',
   },
   companyTitle: {
     textAlign: 'center',
     textAlignVertical: 'center',
     marginTop: 10,
     fontSize: 76,
     fontWeight: 'bold',
     color: Colors.white,
     ...Platform.select({
       ios: {
         fontFamily: 'Arial'
       },
       android: {
         fontFamily: 'Roboto'
       },
       default: {
         fontFamily: 'Arial'
       }
     })
   },
   description: {
     textAlign: 'center',
     textAlignVertical: 'center',
     marginTop: 10,
     fontSize: 26,
     fontWeight: 'bold',
     color: Colors.white,
     ...Platform.select({
       ios: {
         fontFamily: 'Arial'
       },
       android: {
         fontFamily: 'Roboto'
       },
       default: {
         fontFamily: 'Arial'
       }
     })
   }
 });
 export default Layout1;
