import {req} from '../../nanoajax.js'

import {AuthStore} from '../../Auth'

import Actions from './Actions'
import Constants from './Constants'

class NetworkService {
  create(data) {
    let
      payload = JSON.stringify(data),
      headers = {
        'Authorization':  AuthStore.signV1('POST', Constants.NETWORK_URL, payload),
        'Content-Type':  'text/json'
      }

    return req.post(Constants.NETWORK_URL, payload, headers)
      .then( ([resp, httpreq]) => Actions.new(resp) )
  }

  update(nid, data) {
    let
      payload = JSON.stringify(data),
      url = Constants.NETWORK_URL + '/' + nid,
      headers = {
        'Authorization':  AuthStore.signV1('PUT', url, payload),
        'Content-Type':  'text/json'
      }

    return req.put(url, payload, headers)
      .then( ([resp, httpreq]) => Actions.update(nid, resp) )
      .catch( (err) => {
         switch (err.req.status) {
            // bad data in input
            case 400:
            // either user, or organization was not found
            case 404:
               let newErr = new Error("Server rejected network update (" + err.req.statusText + ")")
               newErr.req = err.req
               throw(newErr)
               break
         }

         return null
      })
  }

  list() {
    let headers = { 'Authorization':  AuthStore.signV1('GET', Constants.NETWORK_URL, ''), }

    return req.get(Constants.NETWORK_URL, null, headers)
      .then( ([resp, httpreq]) => Actions.list(resp) )
  }

  fetch(nid) {
    let
      url = Constants.NETWORK_URL + '/' + nid,
      headers = { 'Authorization':  AuthStore.signV1('GET', url, ''), }

    return req.get(url, null, headers)
      .then( ([resp, httpreq]) => Actions.change(nid, resp) )
  }
}


export default new NetworkService()