import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

export async function VerifyReceiptCommand(receipt)
{
  return new Command(async(showAlert) =>
  {
    console.log('\t\tVerifyReceiptCommand.execute()');
    try
    {
      const response = await ApiRequest.sendRequest('post', {receipt: receipt}, 'iap/verify');
      console.log(response.data);

      if(response.data.error !== null)
      {
        showAlert('Error', response.data.error);
        return null;
      }

      return response.data.results;
    }
    catch(err)
    {
      console.log(err);
      showAlert('Error', 'An error has occurred, please try again or contact support.\nError: 10 ' + err);
    }
  });
}
