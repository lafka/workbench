import _ from 'lodash'
import localForage from 'localforage'

import BaseStore from '../Base'
import AppDispatcher from '../../AppDispatcher'
import {Actions} from './Constants'

class NetworkStore extends BaseStore {

  constructor() {
    super()

    this.subscribe(this._subscribe.bind(this))

    this._networks = null

    localForage.getItem('networks')
      .then( (networks) => {
         this._networks = networks
      })
  }

  emitChange() {
    localForage.setItem('networks', this._networks)
      .then( () => {
        BaseStore.prototype.emitChange.call(this)
    })
  }

  _subscribe(action) {
    let idx

    // initialize
    if (null === this._networks && _.some(Actions, action.actionType))
      this._networks = []

    switch (action.actionType) {

      case Actions.new:
        this._networks.push(action.network)
        this.emitChange()
        break

      case Actions.change:
        idx = _.findIndex(this._networks, {key: action.nid})

        if (-1 === idx)
          return

        this._networks[idx] = action.network
        this.emitChange()
        break

      case Actions.update:
        idx = _.findIndex(this._networks, {key: action.nid})
        if (-1 === idx)
          return

        this._networks[idx] = _.merge(this._networks[idx], action.network)
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
    return this._networks ? _.where(this._networks, {key: nid})[0] : null
  }
}

export default new NetworkStore()
