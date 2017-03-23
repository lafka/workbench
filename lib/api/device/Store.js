import _ from 'lodash'
import localForage from 'localforage'

import BaseStore from '../Base'
import AppDispatcher from '../../AppDispatcher'
import Service from './Service'
import {Actions} from './Constants'
import {Actions as NetworkActions} from '../../api/network/Constants'

class DeviceStore extends BaseStore {

  constructor() {
    super()

    this.subscribe(this._subscribe.bind(this))

    this._devices = []
    localForage.getItem('devices')
      .then( (devices) => {
         this._devices = devices
      })
  }

  emitChange() {
    localForage.setItem('devices', this._devices)
      .then( () => {
        BaseStore.prototype.emitChange.call(this)
      })
  }

  _subscribe(action) {
    let idx
    switch (action.actionType) {
      case Actions.create:
        this._devices.push(action.device)
        this.emitChange()
        break

      case Actions.change:
        idx = _.findIndex(this._devices, {key: action.key, network: action.nid})

        if (-1 === idx)
          this._devices.push(action.device)
        else
          this._devices[idx] = action.device

        this.emitChange()
        break

      case Actions.update:
        idx = _.findIndex(this._devices, {key: action.key, network: action.nid})
        if (-1 === idx)
          return

        this._devices[idx] = _.merge(this._devices[idx], action.device)
        this.emitChange()
        break

      case NetworkActions.change:
        if (action.network.devices)
          Service.list(action.network.key)

        break

      case NetworkActions.list:
         //_.each(action.networks, net => Service.list(net.key))
         break;

      case Actions.list:
        this._devices = _.uniq(
          action.devices.concat(this._devices || []),
          (dev) => dev.network + '/' + dev.key)
        this.emitChange()
        break

      default:
        break
    }
  }

  devices(nid) {
    return _.where(this._devices, {network: nid})
  }

  device(nid, key) {
    return _.where(this._devices, {network: nid, key: key})[0]
  }
}

export default new DeviceStore()