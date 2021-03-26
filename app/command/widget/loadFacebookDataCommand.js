import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';
import { DateTime } from '../../constant';

import {
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk';

export async function LoadFacebookDataCommand(accessToken, externalId, updateFeedVersion)
{
  return new Command(async(dataStore, showAlert) =>
  {
    console.log('\t\tLoadFacebookDataCommand.execute()');
    try
    {
      let params =
      {
        accessToken,
        parameters:{}
      };

      let handler = (error, result) =>
      {
        if(error)
        {
          console.log(error);
          return;
        }
        else
        {
          let lastMonthPostCount = 0;
          let thisMonthPostCount = 0;

          let thisYear = new Date();
          thisYear = thisYear.getFullYear();

          let lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          lastMonth = lastMonth.getMonth();

          let thisMonth = new Date();
          thisMonth = thisMonth.getMonth();

          let subtitle = '';

          let feed = [];
          if(result.data.length === 0)
          {
            feed.push({
              date: '',
              id: -1,
              _id: -1,
              source: 'Facebook',
              message: 'No items to display yet'
            });
          }
          for(let i = 0; i < result.data.length; i++)
          {
            if(result.data[i].message)
            {
              let date = new Date(result.data[i].created_time);
              feed.push({ message: result.data[i].message,
                          id: result.data[i].id,
                          _id: result.data[i].id,
                          source: 'Facebook',
                          date: date
                        });
              if(date.getMonth() === lastMonth && date.getFullYear() === thisYear)
              {
                lastMonthPostCount++;
              }
              else if(date.getMonth() === thisMonth && date.getFullYear() === thisYear)
              {
                thisMonthPostCount++;
              }
            }
          }

          if(thisMonthPostCount > lastMonthPostCount)
          {
            subtitle = (thisMonthPostCount - lastMonthPostCount) + ' more posts than ' + DateTime.MONTH_NAMES_SHORT[lastMonth];
          }
          else if(thisMonthPostCount > lastMonthPostCount)
          {
            subtitle = (lastMonthPostCount - thisMonthPostCount) + ' less posts than ' + DateTime.MONTH_NAMES_SHORT[lastMonth];
          }
          else
          {
            subtitle = 'No posts in ' + DateTime.MONTH_NAMES_SHORT[lastMonth] + ' or ' + DateTime.MONTH_NAMES_SHORT[thisMonth];
          }

          let data =
          {
            feed: feed,
            subtitle: subtitle
          };
          dataStore.set('facebookWidget', data);

          if(updateFeedVersion !== null)
          {
            updateFeedVersion();
          }
        }
      };

      const request = new GraphRequest('/' + externalId + '/feed',
                                                params,
                                                handler);

      new GraphRequestManager().addRequest(request).start();
    }
    catch(err)
    {
      console.log(err);
      showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  });
}
