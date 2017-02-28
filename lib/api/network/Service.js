import axios from 'axios'

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

    return axios.post(Constants.NETWORK_URL, payload, {headers})
      .then(
        (response) => {Actions.new(response.data); return response.data})
  }

  update(nid, data) {
    let
      payload = JSON.stringify(data),
      url = Constants.NETWORK_URL + '/' + nid,
      headers = {
        'Authorization':  AuthStore.signV1('PUT', url, payload),
        'Content-Type':  'text/json'
      }

    return axios.put(url, payload, {headers})
      .then(
        (response) => Actions.update(nid, response.data))
  }

  list() {
    let headers = { 'Authorization':  AuthStore.signV1('GET', Constants.NETWORK_URL, ''), }

    return axios.get(Constants.NETWORK_URL, {headers})
      .then( (response) => Actions.list(response.data) )
  }

  fetch(nid) {
    let
      url = Constants.NETWORK_URL + '/' + nid,
      headers = { 'Authorization':  AuthStore.signV1('GET', url, ''), }

    return axios.get(url, {headers})
      .then(
        (response) => Actions.change(nid, response.data))
  }
}


export default new NetworkService()
