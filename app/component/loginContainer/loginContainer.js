import React, { Component } from 'react';
import { Dimensions, KeyboardAvoidingView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { FormInput } from '../formInput';
import {  AppleLoginButton,
          EmailLoginButton,
          GoogleLoginButton,
      } from '../loginButton';
import { MyButton } from '../myButton';
import { ImageButton } from '../imageButton';
import { AppText, Colors, Images, Styles } from '../../constant';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

export default class LoginContainer extends Component
{
  constructor(props)
  {
    super(props);
    this.state =
    {
      accessToken: '',
      externalId: '',
      email: '',
      photo: '',
      firstName: '',
      lastName: '',
      password: '',
      loggedIn: false,
      user: []
    };
  }

  componentWillUnmount() {
    console.log('[loginContainer.willunmount]')
  }
  
  componentDidMount()
  {
    // If only one method enabled just display that
    let enabledMethods = [];
    for(let i = 0; i < this.props.formInput.methods.length; i++)
    {
      if(this.props.formInput.methods[i].isEnabled)
      {
        enabledMethods.push(this.props.formInput.methods[i]);
      }
    }
    // If email just set it to active
    if(enabledMethods.length === 1 && enabledMethods[0].type === 'email')
    {
      this.props.updateFormInput('source', enabledMethods[0].type);
    }


    console.log('[loginContainer.componentDidMount] configuring GoogleSignIn')
    GoogleSignin.configure({
      scopes: ['email'], // what API you want to access on behalf of the user, default is email and profile
      webClientId:'888763880230-d83okh3eu057qhbr638jric6ho0fjj03.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    }); 

   // const subscriber = auth().onAuthStateChanged(this.onAuthStateChanged);

  }

  signOut = async () => {
    try {
      console.log('signout called')
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      auth()
        .signOut()
        .then(
          // () => alert('Your are signed out!')
          );
      this.setState({user:[]});
      this.setState({loggedIn:false});
      // setuserInfo([]);
    } catch (error) {
      console.error(error);
    }
  };

  onAuthStateChanged = (user) => {
    console.log('onAuthStateChanged called with user: ' + JSON.stringify(user))
    this.setState({user:user});
    if (user) this.setState({loggedIn:true});
  }

  // This function is only used by the google login button
  // if we use other third party logins, we need to add specific names for them.
  // can be refactored to be cleaner too.
  login = async () =>
  {
    //await this.signOut() // for testing

    try {
        // this.props.showAlert("Error","login 1")

        await GoogleSignin.hasPlayServices();

        const {accessToken, idToken} = await GoogleSignin.signIn();
        console.log('[loginContainer.login] accessToken: ' + JSON.stringify(accessToken))
        console.log('[loginContainer.login] idToken: ' + JSON.stringify(idToken))

        // this.props.showAlert("Error","login 2")

        const credential = auth.GoogleAuthProvider.credential(
          idToken,
          accessToken,
        );

        console.log('[loginContainer.login] credential: ' + JSON.stringify(credential))

        // this.props.showAlert("Error","login 3")

        let status = await auth().signInWithCredential(credential);
        console.log( `[Auth.thirdPartyLogin] firebase auth status ${JSON.stringify(status)}`);
        console.log( `[Auth.thirdPartyLogin] firebase auth status2 ${JSON.stringify(status.user.providerData)}`);

        const params = {
          accessToken: credential,
          externalId: status.user.providerData[0].uid,
          email:status.user.email,
          source: 'google',
          //source: status.user.providerData.providerId,  // should work with this too
          firstName: 'Google', // should not need this
          lastName: 'User', // should not need this
          photo: '',
          password:'',
          url:''
        };
        params.cb = () =>
        {
          // Clear source
          console.log('[loginContainer.login] in params cb ');
          this.props.updateFormInput('source', '');
          this.setState({ source: '' });
        };

        console.log('[loginContainer.login] calling props login with: ' + JSON.stringify(params ));
        await this.props.login(params);
    } catch (error) {
      console.log('[loginContainer.login] error: ' + error)
      this.props.showAlert("Error","logging in error: " + error.message)

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  }

  login_old = async (updateParams) =>
  {
    console.log('[loginContainer.login] updateParams: ' + JSON.stringify(updateParams ));

    if(updateParams.source === 'google')
    {
      const params = {...updateParams};
      params.cb = () =>
      {
        // Clear source
        console.log('[loginContainer.login] in params cb ');
        this.props.updateFormInput('source', '');
        this.setState({ source: '' });
      };

      console.log('[loginContainer.login] calling props login with: ' + JSON.stringify(params ));
      await this.props.login(params);
    }
    else
    {
      this.setState(updateParams);
      if(updateParams.source)
      {
        this.props.updateFormInput('source', updateParams.source);
      }
    }
  }





  formInput = (formInput) =>
  {
    //console.log(formInput);
    let label = formInput.name.replace(/([A-Z])/g, ' $1').trim()
    // Handle confirmation field
    if(label.indexOf('_confirm_') !== -1)
    {
      const cleanName = label.replace('_confirm_', '');
      label = 'Confirm ' + cleanName[0].toUpperCase() + cleanName.slice(1);
    }
    else
    {
      label = label[0].toUpperCase() + label.slice(1);
    }
    const otherTextInputProps =
    {
      maxLength: formInput.maxLength,
      minLength: formInput.minLength
    }
    if(formInput.type === 'select')
    {
      //console.log(formInput);
      label = formInput.label;
    }
    // Handle secure text field
    if(formInput.type === 'secure')
    {
      otherTextInputProps.secureTextEntry = true;
      otherTextInputProps.autoCompleteType = 'off';
      otherTextInputProps.autoCorrect = false;
      otherTextInputProps.textContentType = 'none';
    }
    //console.log(formInput);
    return (
        <FormInput
          key={formInput.name}
          id={formInput.name}
          updateMasterState={(id, val) =>
          {
            this.setState({ [id]: val });
          }}
          value={this.setState[formInput.name]}
          label={label}
          autoCompleteType={formInput.name}
          textInputStyle={1}
          containerStyle={1}
          type={formInput.type}
          showLabel={false}
          placeholder={label}
          values={[]}
          validationType={FormInput.ValidationType[formInput.name]}
        />
    );
  }

  render()
  {
    console.log('\tLoginContainer.render()');

    let enabledMethods = [];
    for(let i = 0; i < this.props.formInput.methods.length; i++)
    {
      if(this.props.formInput.methods[i].isEnabled)
      {
        enabledMethods.push(this.props.formInput.methods[i]);
      }
    }
    let emailInputs = [];
    if(this.props.formInput)
    {
      for(let i = 0; i < this.props.formInput.methods.length; i++)
      {
        if(this.props.formInput.methods[i].type === 'email')
        {
          emailInputs = this.props.formInput.methods[i].fields;
        }
      }
    }
    return (
      <>
        <View style={styles.userPhotoOutline}>
          {this.state.photo !== '' &&
            <ImageButton
              imgSrc={this.state.photo ? {uri: this.state.photo} : Images.noPhoto}
              imageStyle={styles.userPhotoImg}
            />}
        </View>

        <View
          key={this.props.formInput.name}
          style={styles.loginContainer}
        >
          {this.props.formInput.header &&
          this.props.formInputInComponent.source === '' &&
          <Text style={styles.loginContainerHeader}>{this.props.formInput.header}</Text>}

          <KeyboardAvoidingView>
            {false &&
            this.props.formInputInComponent.source === 'email' &&
            <TouchableOpacity
              onPress={(e)=> this.props.updateFormInput('source', '')}
              style={styles.backRow}
            >
              <Icon
                name={'check'}
                size={20}
                color={Colors.loginContainer.backCheck}
              />
              <Text style={styles.backText}>{'Back to login with Google'}</Text>
            </TouchableOpacity>}

            {this.props.formInput.methods.map( (method, i) =>
            {
              //console.log(method);
              if(method.isEnabled)
              {
                switch(method.type)
                {
                  case 'apple':
                    return (
                      this.props.formInputInComponent.source === '' &&
                      <AppleLoginButton
                        key={this.props.formInput.name + '-apple-login-btn'}
                        login={this.login}
                      />
                    );
                  case 'email':
                    return (
                      this.props.formInputInComponent.source === '' &&
                      <EmailLoginButton
                        key={this.props.formInput.name + '-email-login-btn'}
                        buttonStyle={Styles.authSubmitBtn}
                        titleStyle={Styles.authSubmitBtnText}
                        title={this.props.formInput.title}
                        onPress={() =>
                        {
                          this.props.updateFormInput('source', 'email');
                        }}
                      />);
                  case 'google':
                    return (
                      (this.props.formInputInComponent.source === '') &&
                      <GoogleLoginButton
                        formInput={{name: 'google-login-btn'}}
                        updateMasterState={this.props.updateMasterState}
                        login={this.login}
                        key={'google-login-btn-container'}
                        showAlert={this.props.showAlert}
                      /> );
                  }
              }
            })}

            {this.props.formInputInComponent.source === 'email' &&
            emailInputs.map( (input, i) =>
            {
              if(input.field.type !== '_forgot_password_')
              {
                return (this.formInput(input.field))
              }
            })}

            {this.state.externalId !== '' &&
            <MyButton
              buttonStyle={styles.loginBtn}
              titleStyle={styles.loginBtnText}
              title={'Login as ' + this.state.firstName + ' ' + this.state.lastName + '?'}
              onPress={async() =>
              {
                const params = {...this.state};
                params.source = this.props.formInputInComponent.source;
                params.cb = () =>
                {
                  // Clear source
                  this.props.updateFormInput('source', '');
                  this.setState({ source: '' });
                };
                await this.props.login(params);
              }}
            />}

            {this.state.externalId !== '' &&
            <MyButton
              buttonStyle={styles.cancelBtn}
              titleStyle={styles.cancelBtnText}
              title={'Not ' + this.state.firstName + ' ' + this.state.lastName + '? Switch Account'}
              onPress={async() =>
              {
                this.props.updateFormInput('source', '')
                this.setState({ externalId: '', firstName: '', lastName: '', photo: '', email: '' })
              }}
            />}

            {this.state.externalId === '' &&
            this.props.formInputInComponent.source !== 'email' &&
            (enabledMethods.length !== 1 && enabledMethods[0].type !== 'google') &&
            <MyButton
              buttonStyle={styles.registerBtn}
              titleStyle={styles.registerBtnText}
              title={this.props.formInput.register.text}
              onPress={() => this.props.segue('register')}
            />}

            {this.props.formInputInComponent.source === 'email' &&
            <TouchableOpacity
              onPress={(e)=> this.props.segue('reset')}
              style={styles.backRow}
            >
              <Text style={styles.forgotPassword}>{'Forgot password'}</Text>
            </TouchableOpacity>}

            {this.state.externalId === '' &&
            this.props.formInputInComponent.source === 'email' &&
            <MyButton
              buttonStyle={styles.emailLoginBtn}
              titleStyle={styles.emailLoginBtnText}
              title={this.props.formInput.login.text}
              onPress={() =>
              {
                const params = {...this.state};
                params.source = this.props.formInputInComponent.source;
                this.props.login(params);
              }}
            />}
          </KeyboardAvoidingView>
        </View>
      </>);
  }
};

const font18 = Math.round(Dimensions.get('window').height * 0.02307);
const font11 = Math.round(Dimensions.get('window').height * 0.0141);

const styles = StyleSheet.create({
  loginBtn: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.white,
    justifyContent: 'center',
  },
  loginBtnText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: font18,
    textAlign: 'center',
    marginLeft: 16,
    color: Colors.loginContainer.loginText,
  },
  registerBtn: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.backgroundBlue,
    justifyContent: 'center',
  },
  registerBtnText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: font18,
    textAlign: 'center',
    color: Colors.white,
  },
  cancelBtn: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.transparent,
    justifyContent: 'center',
  },
  cancelBtnText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: font18,
    textAlign: 'center',
    marginLeft: 16,
    color: Colors.white,
  },

  loginContainerHeader: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: font18,
    marginBottom: 21,
    textAlign: 'left',
    marginLeft: 16,
    color: Colors.white,
  },
  backText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: font11,
    marginBottom: 10,
    textAlignVertical: 'center',
    textAlign: 'left',
    marginLeft: 16,
    color: Colors.loginContainer.loginText,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  userPhotoOutline: {
    alignSelf: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  userPhotoImg: {
    width: Math.round(Dimensions.get('window').width * 0.33),
    height: Math.round(Dimensions.get('window').width * 0.33),
    borderRadius: Math.round(Dimensions.get('window').width * 0.33) / 2,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  backRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  forgotPassword: {
    color: Colors.loginContainer.backCheck,
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: font11,
    marginBottom: 10,
    textAlign: 'left',
    marginLeft: 16,
    textAlignVertical: 'center',
  },
  emailLoginBtn: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.loginContainer.emailLoginBtn,
    justifyContent: 'center',
  },
  emailLoginBtnText: {
    ...Platform.select({
      ios: {
        fontFamily: 'Roboto-Medium'
      },
      android: {
        fontFamily: 'Roboto-Medium'
      },
      default: {
        fontFamily: 'Arial'
      }
    }),
    fontSize: font18,
    textAlign: 'center',
    color: Colors.white,
  },
});

module.exports = LoginContainer;
