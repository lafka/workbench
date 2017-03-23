import {req} from '../../nanoajax.js'

import {AuthStore} from '../../Auth'

import Actions from './Actions'
import Constants from './Constants'

class DeviceService {
  constructor() {
    this._locks = {}
  }

  create(nid, data) {
    let
      payload = JSON.stringify(data),
      url = Constants.DEVICE_URL + '/' + nid,
      headers = {
        'Authorization':  AuthStore.signV1('POST', url, payload),
        'Content-Type':  'text/json'
      }

    return req.post(url, payload, headers)
      .then(
        ([resp, httpreq]) => {
          Actions.create(nid, resp.key, resp)
          return resp
        })
  }

  update(nid, key, patch) {
    let
      payload = JSON.stringify(patch),
      url = Constants.DEVICE_URL + '/' + nid + '/' + key,
      headers = {
        'Authorization':  AuthStore.signV1('PUT', url, payload),
        'Content-Type':  'text/json'
      }

    return req.put(url, payload, headers)
      .then(
        ([resp, httpreq]) => {
           Actions.update(nid, key, resp)
           return resp
        })
  }

  list(nid) {
    let url, headers

    if (null === nid) {
      url = Constants.DEVICE_URL
    } else {
      url = Constants.DEVICE_URL + '/' + nid
    }

    headers = { 'Authorization':  AuthStore.signV1('GET', url, '') }

    if (!this._locks[url])
      this._locks[url] = req.get(url, null, headers)
         .then( ([resp, httpreq]) => {
            Actions.list(nid, resp)
            return resp
         })

   return this._locks[url]
  }

  fetch(nid, key) {
    let
      url = Constants.DEVICE_URL + '/' + nid + '/' + key,
      headers = { 'Authorization':  AuthStore.signV1('GET', url, ''), }

    if (!this._locks[url])
      this._locks[url] = req.get(url, null, headers)
         .then( ([resp, httpreq]) => {
            Actions.change(nid, resp)
            return resp
         })

    return this._locks[url]
  }
}


export default new DeviceService()
