import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

export async function UpdateCalendarEventCommand(calendarEvent, idx)
{
  return new Command(async(dataStore) =>
  {
    console.log('\t\tUpdateCalendarEventCommand.execute()');
    let data = {...dataStore.get('calendar')};
    data.calendarEvents[idx] = calendarEvent;
    dataStore.set('calendar', data);
    return data;
  });
}
