import ApiRequest from '../../helper/ApiRequest';
import { PushManager } from '../../manager';
import { Command } from '..';

export async function UpsertCalendarEventCommand(calendarEvent, id)
{
  return new Command(async(dataStore) =>
  {
    console.log('\t\tUpdateCalendarEventCommand.execute()');
    let data = {...dataStore.get('calendar')};

    let found = false;
    if(id)
    {
      for(let i = 0; i < data.calendarEvents.length; i++)
      {
        if(data.calendarEvents[i]._id.toString() === id.toString())
        {
          data.calendarEvents[i] = calendarEvent;
          dataStore.set('calendar', data);
          found = true;
          break;
        }
      }
    }

    if(!found)
    {
      data.calendarEvents.push(calendarEvent);
      dataStore.set('calendar', data);
    }

    PushManager.ScheduleNotification({
      message: 'Calendar event occurring in 30 minutes',
      date: new Date(calendarEvent.startOn),
      id: calendarEvent._id.toString(),
      delaySeconds: 60 * 30,
    });

    return data;
  });
}
