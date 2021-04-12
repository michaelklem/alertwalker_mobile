import React from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Qs from 'query-string';

import AppJson from '../../app.json';
import OauthManager from './oauthManager';
import ApiRequest    from '../helper/ApiRequest.js';
import { AppText, Colors, Images, Styles } from '../constant';
import { PushManager } from '.';
import { FormInput } from '../component/formInput';
import { Chat } from '../component/chat';
import { Conversations } from '../component/conversations';
import { TosButton } from '../component/tos';
import { RememberMe } from '../component/rememberMe';
import { VerifySms } from '../component/verifySms';
import { LoginContainer } from '../component/loginContainer';
import { MyButton }from '../component/myButton';
import { ImageButton } from '../component/imageButton';
import { Groups } from '../component/groups';
import { WebsocketClient } from '../client';

export default class AppManager
{
    static singleton = null;
    #_components = null;
    #_pages = null;
    #_pageValuesCache = null;
    #_guestAccessAllowed = false;
    #_termsOfService = [];
    #_shareText = '';
    #_inviteText = '';
    #_frontendUrl = '';
    // OAuth manager should manage this but for now it is what it is
    #_thirdPartyAccounts = [];

    // Field types that are internal
    #_internalTypes = [];

    #_mapCreateRadius = 1;


    // TODO: Move this to a component manager and move individual components out
    // Animation for search expanding past categories
    _searchBarAnimation = new Animated.Value(0);
    _categoryInterpolate =  this._searchBarAnimation.interpolate({inputRange:[0,1],outputRange:[1,0]});
    _searchBarInterpolate = this._searchBarAnimation.interpolate({inputRange:[0,1],outputRange:['50%','100%']});
    _searchBarTransitionOn = Animated.spring(this._searchBarAnimation,{ toValue: 1 });
    _searchBarTransitionOff = Animated.spring(this._searchBarAnimation,{ toValue: 0 });
    searchOnFocus = () =>
    {
      //console.log('searchOnFocus');
      this._searchBarTransitionOn.start();
    }
    searchOnBlur = () =>
    {
      //console.log('searchOnBlur');
      this._searchBarTransitionOff.start();
    }
    // Categories they can filter on
    #_categories = [];//['recent', 'rated', 'brutal', 'funniest'];

    // Singleton
    /**
      @returns {AppManager}
     */
    static async GetInstanceAsync()
    {
      // Initialize and load styles
      if(AppManager.singleton == null)
      {
        AppManager.singleton = new AppManager();
        await AppManager.singleton.init();
      }
      return AppManager.singleton;
    }

    static GetInstance()
    {
      if(AppManager.singleton === null)
      {
        throw new Error('Attempted to access AppManager before it was instantiated');
      }
      return AppManager.singleton;
    }

    async init(cookies)
    {
      console.log('AppManager.init()');
  		try
  		{
  			// Get users
  			var response = await ApiRequest.sendRequest("post", {}, "site/init");
  			if(response.data.error !== null)
  			{
  				console.error('AppManager.init error1: ' + response.data.error);
          return false;
  			}

        //console.log(response.data);

  			var componentMap = new Map();
        var fields = null;
        var field = null;
        var componentName = ""

        // Build set of {K: Component, V: Fields}
        for(var i = 0; i < response.data.components.length; i++)
        {
          componentName = response.data.components[i].name;
          fields = response.data.components[i].fields;

          if(!componentMap.has(componentName))
          {
            componentMap.set(componentName, new Map());
          }

          // BUild set of {K: FieldName, V: Field}
          for(var j = 0; j < fields.length; j++)
          {
            field = fields[j];
            var existingFieldSet = componentMap.get(componentName);
            existingFieldSet.set(field.name, field);
            componentMap.set(componentName, existingFieldSet);
          }
        }

        // Build set of {K: PageName, V: PageModel }
        let pageMap = new Map();
        for(var i = 0; i < response.data.pages.length; i++)
        {
          if(!pageMap.has(response.data.pages[i].name))
          {
            pageMap.set(response.data.pages[i].name, response.data.pages[i]);
          }
        }

        this.#_components = componentMap;
        this.#_pages = pageMap;
        this.#_internalTypes = response.data.internalTypes;
        this.#_pageValuesCache = new Map();
        this.#_guestAccessAllowed = response.data.guestAccessAllowed;
        this.#_termsOfService = response.data.termsOfService;
        this.#_shareText = response.data.shareText;
        this.#_inviteText = response.data.inviteText;
        this.#_frontendUrl = response.data.frontendUrl;
        this.#_thirdPartyAccounts = response.data.thirdPartyAccounts;
        this.#_mapCreateRadius = response.data.mapCreateRadius;


        OauthManager.GetInstance().setOauthTokens(response.data.oauthTokens);
        return true;
      }
      catch(err)
      {
        console.error('AppManager.init error2: ' + err + '\nStack:\n' + err.stack);
        console.log(OauthManager);
        return false;
      }
    }

    /** Method to retrieve data from backend and store it here as
        Format: map{key: component, value: map{key: fieldName, value: field }}
        Have fields setup to use styled-components and retrieve their colors from this class
      */
    getColorFor = (componentName, fieldName) =>
    {
      if(!this.#_components)
      {
        console.warn("AppManager.getColorFor(" + componentName + ", " + fieldName + ") was unloadable\n");
        return '#FF0000;';
      }
      else if(this.#_components.get(componentName) === undefined)
      {
        console.warn("AppManager.getColorFor(" + componentName + ") could not locate component\n");
        return '#FF0000;';
      }
      else if(this.#_components.get(componentName).get(fieldName) === undefined)
      {
        console.warn("AppManager.getColorFor(" + componentName + ", " + fieldName + ") could not locate field\n");
        return '#FF0000;';
      }
      return this.#_components.get(componentName).get(fieldName).color;
    }

    isGuestAccessAllowed = () =>
    {
      return this.#_guestAccessAllowed;
    }

    getPage = (page) =>
    {
      return this.#_pages.get(page);
    }

    getTermsOfService = () =>
    {
      return this.#_termsOfService;
    }

    getShareText = () =>
    {
      return this.#_shareText;
    }

    getInviteText = () =>
    {
      return this.#_inviteText;
    }

    getFrontEndUrl = () =>
    {
      return this.#_frontendUrl;
    }

    getMapCreateRadius = () =>
    {
      return parseInt(this.#_mapCreateRadius);
    }

    processFormInputsForPage = (pageName) =>
    {
      const formInputs = {};
      const page = this.getPage(pageName);
      if(page)
      {
        let formComponent = null;
        for(let i = 0; i < page.components.length; i++)
        {
          if(page.components[i].type === 'form')
          {
            formComponent = page.components[i];
          }
        }

        if(formComponent)
        {
          //console.log(formComponent);
          for(let i = 0; i < formComponent.form.length; i++)
          {
            formInputs[formComponent.form[i].name] = formComponent.form[i];
            if(formComponent.form[i].type !== 'select')
            {
              formInputs[formComponent.form[i].name].value = '';
            }
          }
        }
        this.#_pageValuesCache.set(page.name, page);
      }
      return formInputs;
    }

    getThirdPartyAccount = (source) =>
    {
      console.log('Third party accounts');
      console.log(this.#_thirdPartyAccounts);
      for(let i = 0; i < this.#_thirdPartyAccounts.length; i++)
      {
        if(this.#_thirdPartyAccounts[i].source.toLowerCase() === source.toLowerCase())
        {
          return this.#_thirdPartyAccounts[i];
        }
      }
      return null;
    }

    setThirdPartyAccounts = (thirdPartyAccounts) =>
    {
      this.#_thirdPartyAccounts = thirdPartyAccounts;
    }

    getCustomForPage = (pageName) =>
    {
      const page = this.getPage(pageName);
      return page.custom;
    }

    getComponentsForPage = (pageName) =>
    {
      const page = this.getPage(pageName);
      return page.components;
    }

    getComponentIndexByName = (components, name) =>
    {
      for(let i = 0; i < components.length; i++)
      {
        if(components[i].type === name)
        {
          return i;
        }
      }
      return -1;
    }

    /**
      Generate components from JSON
      @param  {Array.<JSON>}  components  Array of components to display
      @param  {Function}  updateComponent   Method to update component in parent
      @param  {Function}  filterSearchResults   Ability for caller to have search results filtered between detail/search components
      @param  {Function}  detailOnClick Handle click of detail record
    */
    displayComponents = (components,
                        updateComponent,
                        filterSearchResults,
                        detailOnClick,
                        updateMasterState,
                        showAlert,
                        user,
                        navigation,
                        deepLink,
                        segue,
                        updateGlobalState) =>
    {
      if(!components)
      {
        return;
      }
      const componentKeys = Object.keys(components);
      return componentKeys.map( (componentKey, i) =>
      {
        const component = components[componentKey];

        // Groups
        if(component.type === 'groups')
        {
          return (
            <Groups
              key={`component-${i}-container`}
              component={component}
              data={null}
              dynamicData={true}
              deepLink={deepLink}
              updateMasterState={(state) => updateMasterState(state)}
              navigation={navigation}
              showAlert={showAlert}
              user={user}
            />
          );
        }
        else if(component.type === 'chat')
        {
          return (
            <Chat
              key={`component-${i}-container`}
              component={component}
              deepLink={deepLink}
              updateMasterState={(state) => updateMasterState(state)}
              navigation={navigation}
              showAlert={showAlert}
              user={user}
            />
          );
        }
        else if(component.type === 'conversations')
        {
          return (
            <Conversations
              key={`component-${i}-container`}
              component={component}
              deepLink={deepLink}
              updateMasterState={(state) => updateMasterState(state)}
              navigation={navigation}
              showAlert={showAlert}
              user={user}
            />
          );
        }
        else if(component.type === 'verify-sms')
        {
          return (
            <VerifySms
              key={`component-${i}-container`}
              component={component}
              updateMasterState={(state) => updateMasterState(state)}
              navigation={navigation}
              showAlert={showAlert}
              segue={segue}
              updateGlobalState={updateGlobalState}
            />
          );
        }
      });
    }

    getCachedPageValues = (pageName) =>
    {
      const pageValues = this.#_pageValuesCache.get(pageName);
      return pageValues;
    }

    setCachedPageValues = (pageName, values) =>
    {
      this.#_pageValuesCache.set(pageName, values);
    }



    /**
      Generate form input from JSON
      @param  {JSON}  formInputs  Form inputs to process
      @param  {Function}  updateMasterState Update state of master component
      @param  {Function}  queryMasterState   Function to query master components state
      @param  {Object}    navigation  React navigation prop so we can forward to page
      @param  {Function}  updateStack Allow this page to update the main stack if necessary
      @param  {Function}  showAlert Dipslay an alert message
      @param  {Function}  updateGlobalState Update global app state
    */
    displayFormInputs = ({ formInputs,
                          updateMasterState,
                          queryMasterState,
                          navigation,
                          updateStack,
                          showAlert,
                          updateGlobalState,
                          segue,
                          deepLink,
                          login,
                          components }) =>
    {
      const formInputKeys = Object.keys(formInputs);
      return formInputKeys.map( (formInputKey, i) =>
      {
        const formInput = formInputs[formInputKey];
        //console.log(formInput);
        // Remember me field
        if(formInput.name === '_remember_me_')
        {
          return (
            <RememberMe
              toggleRememberMe={() => updateMasterState(formInput.name, !formInput.value)}
              rememberMe={formInput.value}
              key={formInput.name + i}
            />);
        }

        // Button
        else if(formInput.type === 'button')
        {
          return (
            <MyButton
              key={formInput.name + i}
              buttonStyle={styles['buttonStyle' + '3']}
              titleStyle={styles['buttonTextStyle' + 1]}
              title={formInput.title}
              onPress={() => this.btnOnSubmit(
              {
                segue: segue,
                buttonParams: formInput,
                updateMasterState: updateMasterState,
                queryMasterState: queryMasterState,
                formInputs: formInputs,
                navigation: navigation,
                updateStack: updateStack,
                showAlert: showAlert,
                updateGlobalState: updateGlobalState,
                deepLink: deepLink
              })}
            />);
        }

        // Forgot password
        else if(formInput.type === '_forgot_password_')
        {
          return (
            <MyButton
              key={formInput.name + i}
              titleStyle={Styles.forgotPasswordBtnL3}
              title={AppText.pLoginForgotPasswordBtnText}
              onPress={() => segue('reset')}
          />);
        }

        // TOS Button
        else if(formInput.type === '_tos_')
        {
          return (
            <TosButton
              key={formInput.name + i}
              title={AppText.loginPage.layout4.termsText}
            />);
        }

        // Instagram login
        else if(formInput.type === '_login_container_')
        {
          // Find _login_container_
          // TODO: Make this whole thing render the component and not the form inputs themselves,
          // dumb design for intercomponent communication, good design for controling things off the backend
          let formInputInComponent = null;
          for(let i = 0; i < components.length; i++)
          {
            if(components[i].type === 'form')
            {
              // Find _login_container_
              for(let i = 0; i < components[i].form.length; i++)
              {
                if(components[i].form[i].type === '_login_container_')
                {
                  formInputInComponent = components[i].form[i];
                  break;
                }
              }
              break;
            }
          }
          return (
            <LoginContainer
              key={formInput.name + i}
              updateMasterState={updateMasterState}
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
                        updateMasterState('components', components);
                        return;
                      }
                    }
                    break;
                  }
                }
              }}
              formInput={formInput}
              formInputInComponent={formInputInComponent}
              login={login}
              segue={segue}
              showAlert={showAlert}
              onPress={() => this.btnOnSubmit(
              {
                segue: segue,
                buttonParams: formInput,
                updateMasterState: updateMasterState,
                queryMasterState: queryMasterState,
                formInputs: formInputs,
                navigation: navigation,
                updateStack: updateStack,
                showAlert: showAlert,
                updateGlobalState: updateGlobalState,
                deepLink: deepLink
              })}
            />);
        }

        // Schema field
        else
        {
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
                id={formInput.name}
                updateMasterState={updateMasterState}
                value={formInput.value}
                textInputStyle={9}
                containerStyle={4}
                label={label}
                autoCompleteType={formInput.name}
                type={formInput.type}
                otherTextInputProps={otherTextInputProps}
                helperText={AppText.formHelperText + formInput.name}
                showHelperText={false}
                showLabel={false}
                placeholder={label}
                values={formInput.values ? formInput.values.split(',') : []}
                validationType={FormInput.ValidationType[formInput.name]}
              />
          );
        }
      });
    }


    /**
      Handle button submit action
      @param  {JSON}  buttonParams  Form input to process for button
      @param  {Function}  updateMasterState Update state of master component
      @param  {Function}  queryMasterState   Function to query master components state
      @param  {JSON}    formInputs    The form inputs to validate against
      @param  {Object}    navigation  React navigation prop so we can forward to page
      @param  {Function}  updateStack Allow this page to update the main stack if necessary
      @param  {Function}  showAlert Dipslay an alert message
      @param  {Function}  updateGlobalState Update global app state
      @param  {String}    deepLink  Deep link data
    */
    btnOnSubmit = async ({ buttonParams,
                          updateMasterState,
                          queryMasterState,
                          formInputs,
                          navigation,
                          updateStack,
                          showAlert,
                          updateGlobalState,
                          deepLink = "",
                          segue = null}) =>
    {
      if(queryMasterState('isLoading'))
      {
        return;
      }

      updateMasterState('isLoading', true);

      // Build params
      let params = { };
      const keys = Object.keys(formInputs);
      for(let i = 0; i < keys.length; i++)
      {
        // Filter out buttons and internal types
        if(formInputs[keys[i]].type && this.#_internalTypes.indexOf(formInputs[keys[i]].type) === -1)
        {
          params[formInputs[keys[i]].name] = formInputs[keys[i]].value;
        }
      }

      // Check for hidden data
      if(buttonParams.hiddenData)
      {
        let querystring = Qs.parse(deepLink.substr(deepLink.indexOf('?') + 1));
        console.log(querystring);
        for(let i = 0; i < buttonParams.hiddenData.length; i++)
        {
          // Read query string
          if(buttonParams.hiddenData[i].data === '_qs_')
          {
            params[buttonParams.hiddenData[i].id] = querystring[buttonParams.hiddenData[i].dataField];
          }
          // Static data
          else
          {
            params[buttonParams.hiddenData[i].id] = buttonParams.hiddenData[i].data;
          }
        }
      }

      //console.log(params);

      try
      {
        //console.log(params);
        let response = await ApiRequest.sendRequest("post", params, buttonParams.route);

        //console.log(response.data);
        //console.log(buttonParams.successActions);

        // Success
        if(response.data.error === null)
        {
          updateMasterState('isLoading', false);

          for(let i = 0; i < buttonParams.successActions.length; i++)
          {
            switch(buttonParams.successActions[i].action)
            {
              case 'alert':
                showAlert(buttonParams.successActions[i].title, buttonParams.successActions[i].message);
                break;
              case 'clearField':
                updateMasterState(buttonParams.successActions[i].id, '');
                break;
              case 'requestPermission':
                PushManager.RequestPermissions();
                break;
              case 'segue':
                // Main page requires swapping out the current stack
                if(buttonParams.successActions[i].page === 'main')
                {
                  updateStack('main');
                }
                else
                {
                  // Handle cached segue
                  if(buttonParams.successActions[i].type === 'segue')
                  {
                    segue(buttonParams.successActions[i].page);
                  }
                  // Do react navigation segue
                  else
                  {
                    navigation.navigate(buttonParams.successActions[i].page);
                  }
                  return;
                }
                break;
              case 'oauthToken':
                console.log('Setting oauth token');
                const oauthToken = response.data[buttonParams.successActions[i].dataField];
                if(oauthToken)
                {
                  OauthManager.GetInstance().addOauthToken(oauthToken.source + 'Token', oauthToken);
                }
                break;
              case 'setCookie':
                // AsyncStorage doesn't allow objects so convert to string if need be
                const dataType = typeof response.data[buttonParams.successActions[i].dataField];
                const data =  (dataType === 'object' ? JSON.stringify(response.data[buttonParams.successActions[i].dataField]) : response.data[buttonParams.successActions[i].dataField].toString());
                console.log('Setting ' + buttonParams.successActions[i].cookieField.toString() + ' to ' + data);
                await AsyncStorage.setItem(buttonParams.successActions[i].cookieField.toString(), data);
                if(buttonParams.successActions[i].cookieField.toString() === 'token')
                {
                  WebsocketClient.GetInstance().validateToken(data);
                }
                break;
              case 'setGlobalState':
                console.log('Setting global state');
                console.log(response.data[buttonParams.successActions[i].dataField]);
                updateGlobalState(buttonParams.successActions[i].id, response.data[buttonParams.successActions[i].dataField]);
                break;
              case 'setState':
                updateMasterState(buttonParams.successActions[i].id, response.data[buttonParams.successActions[i].dataField]);
                break;
              case 'validate':
                if(response.data[buttonParams.successActions[i].dataField] === buttonParams.successActions[i].isEqualTo)
                {
                  if(buttonParams.successActions[i].successAction.type === 'segue')
                  {
                    segue(buttonParams.successActions[i].successAction.segue);
                  }
                  else
                  {
                    navigation.navigate(buttonParams.successActions[i].successAction.segue);
                  }
                  return;
                }
                break;
              default:
                break;
            }
          }
        }
        else
        {
          updateMasterState('isLoading', false);
          showAlert('Error', response.data.error);
        }
      }
      catch(err)
      {
        console.log(err.stack);
        updateMasterState('isLoading', false);
        showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 2 ' + err);
      }
    }
}

const font18 = Math.round(Dimensions.get('window').height * 0.02307);
const font28 = Math.round(Dimensions.get('window').height * 0.03589);

const styles = StyleSheet.create({
  buttonStyle1: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.loginContainer.emailLoginBtn,
    justifyContent: 'center',
  },
  buttonTextStyle1: {
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

  buttonStyle2: {
    backgroundColor : Colors.white,
    borderRadius : 35,
    paddingVertical: 14,
    marginTop: Math.round(Dimensions.get('window').height * 0.04),
  },
  buttonTextStyle2: {
    fontWeight : 'bold',
    fontSize : font28,
    textAlign: 'center',
    color: Colors.lightBlue,
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

  buttonStyle3: {
    height: Math.round(Dimensions.get('window').height * 0.1),
    backgroundColor: Colors.lightBlue2,
    justifyContent: 'center',
  },
});
