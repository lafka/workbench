import BaseStore from '../stores/Base'
import AppDispatcher from '../AppDispatcher'
import {Actions} from './Constants'

class NetworkStore extends BaseStore {

  constructor() {
    super()

    this.subscribe(this._subscribe.bind(this))

    this._networks = []
  }

  _subscribe(action) {
    switch (action.actionType) {
      case Actions.new:
      case Actions.change:
        this._networks[action.nid] = action.network
        this.emitChange()
        break

      case Actions.list:
        this._networks = action.networks
        this.emitChange()
        break

      default:
        break
    }
  }

  get networks() {
    return this._networks;
  }

  network(nid) {
    return this._networks[nid]
  }
}

export default new NetworkStore()