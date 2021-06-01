import { AppManager, OauthManager } from '.';
export default class DataManager
{
  static #instance = null;

  // { k: => 'pageName', v: => Object: {} }
  #dataStore = new Map();
  #showAlert = null;
  #observers = [];

  /**
    Singleton accessor
    @param  {String}  apiToken   So we can interact with API
    @param  {Function}  showAlert   So we can display alerts
    @returns {DataManager}
   */
  static GetInstanceA(showAlert)
  {
    // Initialize
    if(DataManager.#instance == null)
    {
      DataManager.#instance = new DataManager();
      DataManager.#instance.#showAlert = showAlert;

    }
    return DataManager.#instance;
  }

  /**
     Singleton accessor
    @returns {DataManager}
   */
  static GetInstance()
  {
    if(DataManager.#instance == null)
    {
      throw new Error('Tried to access DataManager before instantiated');
    }
    return DataManager.#instance;
  }


  // Retrieve information from backend
  /**
    @param  {String}  userToken   So we know if we are logged in or not
  */
  async initDataStore(userToken)
  {
    console.log('\t\tDataManager.init()');
    try
    {
      let promises = [];

      // Geofence areas
      this.#dataStore.set('geofenceAreas', {geofenceAreas: []});

      await Promise.all(promises);

      return true;
    }
    catch(err)
    {
      console.log('DataManager.init error: ' + err + '\nError stack: ' + err.stack);
      return false;
    }
  }


  /**
    Execute command related to data processing
    @param  {Object}  command The command to call execute on
    @param  {Any} args  Remaning arguments to pass into command call
  */
  async execute(command, ...args)
  {
    return await command.execute(this.#dataStore, this.#showAlert, ...args);
  }


  getData(name)
  {
    console.log('[DataManager.getData] name: ' + name)
    return {...this.#dataStore.get(name)};
  }

  /**
    Search data set
    @param  {String}  set   The key in the datastore to retrieve
    @param  {String}  field   The field in the dataset to pull from
    @param  {String}  subfield  The actual field in that object to compare against
    @param  {String}  searchText  The search text
    @returns {Array.<Any>}  results
  */
  searchDataSet({ set, field, subfield, searchText })
  {
    let dataset = this.#dataStore.get(set);
    if(!dataset)
    {
      return [];
    }
    dataset = dataset[field];
    if(!dataset)
    {
      return [];
    }
    try
    {
      if(searchText === '')
      {
        return dataset;
      }
      dataset = dataset.filter(record => record[subfield].toString()
                                                          .toLowerCase()
                                                          .replace(/<[^>]*>?/gm, '')
                                                          .indexOf(searchText.toLowerCase()) !== -1);
      return dataset;
    }
    catch(err)
    {
      console.log(err);
      return [];
    }
  }
  /**
    Notify observers that data reloaded
  */
  dataSetUpdated(dataSet)
  {
    console.log('\t\tDataManager.dataReloaded()');
    console.log(this.#observers);
    for(let i = 0; i < this.#observers.length; i++)
    {
      if(this.#observers[i].forDataSet === dataSet)
      {
        this.#observers[i].cb();
      }
    }
  }

  manualInsert(dataSetId, keyInDataSet, newEntry)
  {
    const dataSet = this.#dataStore.get(dataSetId);
    if(dataSet[keyInDataSet] && dataSet[keyInDataSet].length > 0)
    {
      dataSet[keyInDataSet].push(newEntry);
    }
    else
    {
      dataSet[keyInDataSet] = [newEntry];
    }
    this.#dataStore.set(dataSetId, dataSet);

    this.dataSetUpdated(dataSetId);
  }

  /**
    Add new observer to list
  */
  addObserver(cb, id, forDataSet)
  {
    let found = false;
    for(let i = 0; i < this.#observers.length; i++)
    {
      if(this.#observers[i].id === id)
      {
        found = true;
        break;
      }
    }

    if(!found)
    {
      this.#observers.push({ id: id, cb: cb, forDataSet: forDataSet });
    }
  }

  removeObserver(id)
  {
    for(let i = 0; i < this.#observers.length; i++)
    {
      if(this.#observers[i].id === id)
      {
        this.#observers.splice(i, 1);
        break;
      }
    }
  }
}
