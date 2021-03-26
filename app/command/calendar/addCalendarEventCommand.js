import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

export async function AddCalendarEventCommand(calendarEvent)
{
  return new Command(async(dataStore) =>
  {
    console.log('\t\tAddCalendarEventCommand.execute()');
    let data = {...dataStore.get('calendar')};
    data.calendarEvents.push(calendarEvent);
    dataStore.set('calendar', data);
    return data;
  });
}
