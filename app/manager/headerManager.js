export default class HeaderManager
{
  static singleton = null;
  // Holds {id: name, cb: callback}
  #_listeners = [];

  // Reference to header component
  #_header = null;

  // Singleton
  /**
    @returns {HeaderManager}
   */
  static GetInstance()
  {
    // Initialize
    if(HeaderManager.singleton == null)
    {
      HeaderManager.singleton = new HeaderManager();
    }
    return HeaderManager.singleton;
  }


  // MARK: - Listener related
  addListener(id, cb)
  {
    let found = false;
    for(let i = 0; i < this.#_listeners.length; i++)
    {
      if(this.#_listeners[i].id === id)
      {
        found = true;
        break;
      }
    }

    if(!found)
    {
      this.#_listeners.push({ id: id, cb: cb });
    }
  }

  removeListener(listenerId)
  {
    for(let i = 0; i < this.#_listeners.length; i++)
    {
      if(this.#_listeners[i].id === listenerId)
      {
        this.#_listeners.splice(i, 1);
        break;
      }
    }
  }

  notifyListeners(message)
  {
    console.log(this.#_listeners);
    for(let i = 0; i < this.#_listeners.length; i++)
    {
      if(this.#_listeners[i].id === message.route)
      {
        console.log('HeaderManager.notifyListeners(' + this.#_listeners[i].id + ') - Iteration: ' + i);
        this.#_listeners[i].cb(message.side);
      }
    }
  }


  hide(side)
  {
    console.log('Hiding ' + side);
    this.#_header.setSideHiding(side);
  }

  show(side)
  {
    console.log('Showing ' + side);
    this.#_header.setSideShowing(side);
  }

  isShowing(side)
  {
    return this.#_header.isShowing(side);
  }

  setHeader(header)
  {
    this.#_header = header;
  }

  setActiveAdditionalPage(page)
  {
    this.#_header.setActiveAdditionalPage(page);
    this.show('right');
  }
}
