import ApiRequest from '../../helper/ApiRequest';
import { Command } from '..';

export async function AddNoteCommand(note)
{
  return new Command(async(dataStore) =>
  {
    console.log('\t\tAddNoteCommand.execute()');
    let data = {...dataStore.get('notes')};
    data.notes.push(note);
    dataStore.set('notes', data);
    return data;
  });
}
