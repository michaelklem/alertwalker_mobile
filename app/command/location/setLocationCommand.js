import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

export async function SetLocationCommand({ newLocation, updateMasterState, dataVersion, type })
{
  return new Command(async(dataStore) =>
  {
    console.log('\t\tSetLocationCommand.execute(' + type + ') ' + JSON.stringify(newLocation));
    let data = {...dataStore.get('location')};
    switch(type)
    {
      case 'alert':
        data.alertLocation = newLocation;
        break;
      case 'user':
        data.userLocation = newLocation;
        break;
      case 'map':
        data.mapLocation = newLocation;
        break;
      default:
        throw new Error('Unknown type: ' + type);
    }
    dataStore.set('location', data);

    updateMasterState ? updateMasterState({ dataVersion: dataVersion + 1 }) : '';

    return data;
  });
}
