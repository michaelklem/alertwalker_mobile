import { Platform } from 'react-native';
import Axios 	from 	'axios';
import AppJson from '../../app.json';
import AsyncStorage from '@react-native-community/async-storage';
import { getUniqueId } from 'react-native-device-info';
import { WebsocketClient } from '../client';

class ApiRequest
{
	/**
	 Send HTTP request (get or post).
	 @param 	{string} 	method 	get|post
	 @param 	{Object}	data 	JSON formatted data to be the body of the request
	 @param 	{string}	path 	Route path for backend API
	 @return 	{Promise}	A promise containing the result of the request
	 */
	static async sendRequest(method, params, path, contentType = 'application/json')
	{
		let token = await AsyncStorage.getItem('token');
		let requestUrl = AppJson.backendUrl + path;
		if(token === null)
		{
			token = "guest";
		}
		try
		{
			let config =
			{
				method: 	method,
				url:		requestUrl,
				headers:
				{
					'Content-Type': 		contentType,
					'x-access-token': 	token,
					'x-device-id':			getUniqueId(),
					'x-request-source': 'mobile',
					'x-device-service-name': Platform.select(
					{
			      ios: 'ios',
			      android: 'android',
			      default: 'android'
			    }),
					'x-device-service-version': parseInt(Platform.Version)
				},
				data:		params
			};
			const response = await Axios.request(config);

			// If token returned is different than ours, then system refreshed it for us
			// save local copy
			if(response.data.token && response.data.token !== token)
			{
				await AsyncStorage.setItem('token', response.data.token);
				console.log('ApiRequest.sendRequest() updated token: ' + response.data.token);
			}

			// TODO: Check if token returned, and if different than token we sent in, update our end
			return response;
		}
		catch(err)
		{
			console.error('[ApiRequest:sendRequest] url: ' + requestUrl + ' error: ' + err);
			throw err;
		}
	}


	/**
	 Upload file
	 @param 	{FormData}	formData 	JSON formatted data to be the body of the request
	 @param 	{string}	path 	Route path for backend API
	 @return 	{Promise}	A promise containing the result of the request
	 */
	static async upload(formData, path)
	{
		const token = await AsyncStorage.getItem('token');
		try
		{
			let config =
			{
				method: 	'post',
				url:		AppJson.backendUrl + path,
				headers:
				{
					'x-access-token': 	token,
					'x-device-id':			getUniqueId(),
					'x-request-source': 'mobile',
					'x-device-service-name': Platform.select(
					{
			      ios: 'ios',
			      android: 'android',
			      default: 'android'
			    }),
					'x-device-service-version': parseInt(Platform.Version)
				},
				data: formData
			};

			const response = await Axios.request(config);

			// If token returned is different than ours, then system refreshed it for us
			// save local copy
			if(response.data.token && response.data.token !== token)
			{
				await AsyncStorage.setItem('token', response.data.token);
				WebsocketClient.GetInstance().validateEmail(response.data.token);
				console.log('ApiRequest.upload() updated token');
			}

			return response;
		}
		catch(err)
		{
			console.error(err);
			throw err;
		}
	}



	/**
	 Send HTTP request (get or post) to external provider
	 @param 	{string} 	method 	get|post
	 @param 	{Object}	data 	JSON formatted data to be the body of the request
	 @param 	{string}	endpoint 	Endpoint to hit
	 @return 	{Promise}	A promise containing the result of the request
	 */
	static async ExternalRequest(method, params, endpoint, contentType = 'application/json')
	{
		try
		{
			let config =
			{
				method: 	method,
				url:			endpoint,
				headers:
				{
					'Content-Type': 		contentType,
				},
				data:		params
			};
			const response = await Axios.request(config);
			return response;
		}
		catch(err)
		{
			console.error(err);
			throw err;
		}
	}
}


export default ApiRequest;
