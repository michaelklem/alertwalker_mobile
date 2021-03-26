import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';
import { DateTime } from '../../constant';


export async function LoadInstagramDataCommand(accessToken, updateFeedVersion)
{
  return new Command(async(dataStore, showAlert) =>
  {
    console.log('\t\tLoadInstagramDataCommand.execute()');
    try
    {
      const endpoint = 'https://graph.instagram.com/me/media?fields=caption,id,media_url,thumbnail_url,timestamp&access_token=' + accessToken;
      const result = await ApiRequest.ExternalRequest('get',
                                                        '',
                                                        endpoint);

      if(result.status !== 200)
      {
        return;
      }

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
          source: 'Instagram',
          message: 'No items to display yet'
        });
      }
      for(let i = 0; i < result.data.data.length; i++)
      {
        if(result.data.data[i].caption)
        {
          let date = new Date(result.data.data[i].timestamp);
          feed.push({ message: result.data.data[i].caption,
                      id: result.data.data[i].id,
                      _id: result.data.data[i].id,
                      date: date,
                      source: 'Instagram',
                      url: result.data.data[i].media_url
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
      dataStore.set('instagramWidget', data);

      updateFeedVersion ? updateFeedVersion() : '';
    }
    catch(err)
    {
      console.log(err);
      //showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  });
}
