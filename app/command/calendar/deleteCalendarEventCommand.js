import ApiRequest from '../../helper/ApiRequest';
import { PushManager } from '../../manager';
import { Command } from '..';

export async function DeleteCalendarEventCommand(updateMasterState, id, dataVersion)
{
  return new Command(async(dataStore, showAlert) =>
  {
    console.log('\t\tdeleteCalendarEventCommand.execute()');
    updateMasterState({ isLoading: true });
    try
    {
      const data = dataStore.get('calendar');
      const calendarEvents = data.calendarEvents;
      const idx = calendarEvents.findIndex(calendarEvent => calendarEvent._id.toString() === id.toString());

      const params = new FormData();
      params.append('model', 'calendarevent');
      params.append('id', id);
      params.append('isDeleted', true);
      const response = await ApiRequest.sendRequest('post', params, 'data/update', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW');
      console.log(response.data);

      if(response.data.error !== null)
      {
        updateMasterState({ isLoading: false });
        showAlert('Error', response.data.error);
        return;
      }

      calendarEvents.splice(idx, 1);
      data.calendarEvents = calendarEvents;
      dataStore.set('calendar', data);

      PushManager.CancelNotification(id);

      updateMasterState({ isLoading: false, dataVersion: dataVersion + 1 });

      return data;
    }
    catch(err)
    {
      console.log(err);
      updateMasterState({ isLoading: false });
      showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  });
}
