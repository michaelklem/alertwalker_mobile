import * as RNIap from 'react-native-iap';
import { Platform } from 'react-native';

import { VerifyReceiptCommand } from '../command/iap';
const itemSkus = ['aspire_premium_monthly'];
export default class IapManager
{
  // Handlers for when message received about payment
  purchaseUpdateSubscription = null
  purchaseErrorSubscription = null

  static singleton = null;
  #showAlert = null;
  // Receipt record
  #receipt = null;
  #listeners = [];

  // Singleton
  /**
    @returns {IapManager}
   */
  static GetInstance()
  {
    // Initialize
    if(IapManager.singleton == null)
    {
      IapManager.singleton = new IapManager();
    }
    return IapManager.singleton;
  }

  // Singleton
  /**
    @returns {IapManager}
   */
  static async GetInstanceA(showAlert)
  {
    // Initialize
    if(IapManager.singleton == null)
    {
      IapManager.singleton = new IapManager();
      IapManager.singleton.#showAlert = showAlert;
      await IapManager.singleton.init();
    }
    return IapManager.singleton;
  }

  async init()
  {
    try
    {
      await RNIap.initConnection();
      // Remove ghost payments (failed pending payment that are still marked as pending in Google's native Vending module cache)
      try
      {
        RNIap.flushFailedPurchasesCachedAsPendingAndroid();
      }
      // Ignore error
      catch(err)
      {
        console.log(err);
      }

      this.purchaseUpdateSubscription = RNIap.purchaseUpdatedListener( async(purchase) =>
      {
        console.log('purchaseUpdatedListener', purchase);
        const receipt = purchase.transactionReceipt;
        if(receipt)
        {
          this.#receipt = await this.execute(await new VerifyReceiptCommand(receipt));
          this.notifyListeners(this.#receipt);
          await RNIap.finishTransaction(purchase, false);
        }
        else
        {
          // Display alert
          this.#showAlert('Uh-oh', 'Your purchase did not go through successfully');
        }
      });

      this.purchaseErrorSubscription = RNIap.purchaseErrorListener( (error) =>
      {
        console.warn('purchaseErrorListener', error);
      });
    }
    catch(err2)
    {
      console.log(err2);
      console.error('\t\tIAPManager.init error: In app purchases will not work');
    }
  }

  async getSubscriptions()
  {
    return await RNIap.getSubscriptions(itemSkus);
  }

  async requestSubscription()
  {
    try
    {
      await this.getSubscriptions();
      await RNIap.requestSubscription(itemSkus[0]);
    }
    catch(err)
    {
      console.log(err);
    }
  }

  /**
    Execute command related to data processing
    @param  {Object}  command The command to call execute on
    @param  {Any} args  Remaning arguments to pass into command call
  */
  async execute(command, ...args)
  {
    return await command.execute(this.#showAlert, ...args);
  }

  getReceipt()
  {
    return this.#receipt;
  }

  setReceipt(receipt)
  {
    this.#receipt = receipt;
  }


  // MARK: - Listener related
  addListener(id, cb)
  {
    this.#listeners.push({ id: id, cb: cb });
  }

  removeListener(listenerId)
  {
    for(let i = 0; i < this.#listeners.length; i++)
    {
      if(this.#listeners[i].id === listenerId)
      {
        this.#listeners.splice(i, 1);
        break;
      }
    }
  }

  notifyListeners(receipt)
  {
    for(let i = 0; i < this.#listeners.length; i++)
    {
      console.log('IapManager.notifyListeners(' + this.#listeners[i].id + ')');
      this.#listeners[i].cb(receipt);
    }
  }
}
