import ApiRequest from '../../helper/ApiRequest';
import { PushManager } from '../../manager';
import { Command } from '..';

import RNCalendarEvents from "react-native-calendar-events";

const StartDate = '2020-01-01T00:00:00.000Z';
const EndDate = '2021-01-01T00:00:00.000Z';
const DefaultCalendarSortBy = 1;

export async function LoadCalendarEventsCommand(updateMasterState, params, dataVersion)
{
  return new Command(async(dataStore, showAlert) =>
  {
    console.log('\t\tLoadCalendarEventsCommand.execute()');
    updateMasterState ? updateMasterState({ isLoading: true }) : '';

    try
    {
      // Get event and build API params
      const status = await RNCalendarEvents.checkPermissions();
      let events = [];
      if(status === 'authorized')
      {
        events = await RNCalendarEvents.fetchAllEvents(StartDate, EndDate);
      }
      let apiParams = params;
      if(!apiParams)
      {
        apiParams =
        {
          sortBy: DefaultCalendarSortBy,
          events: events
        };
      }
      else
      {
        apiParams.events = events;
      }

      let response = await ApiRequest.sendRequest("post", apiParams, 'calendar/sync-events');
      console.log(response.data);

      if(response.data.error !== null)
      {
        updateMasterState ? updateMasterState({ isLoading: false }) : '';
        showAlert('Error', response.data.error);
        dataStore.set('calendar', { calendarEvents: []});
        return;
      }

      // Schedule events
      let date = null;
      for(let i = 0; i < response.data.results.length; i++)
      {
        date = new Date(response.data.results[i].startOn);
        // Don't schedule event if already passed
        if(date.getSeconds() > Date.now())
        {
          PushManager.ScheduleNotification({
            message: 'Calendar event occurring in 30 minutes',
            date: date,
            id: response.data.results[i]._id.toString(),
            delaySeconds: 60 * 30,
          });
        }
      }

      let data =
      {
        calendarEvents: response.data.results
      };
      dataStore.set('calendar', data);

      updateMasterState ? updateMasterState({
        isLoading: false,
        dataVersion: dataVersion + 1,
      }) : '';

      return data;
    }
    catch(err)
    {
      console.log(err);
      updateMasterState ? updateMasterState({ isLoading: false }) : '';
      showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  });
}
