import {req} from '../../nanoajax.js'

import Actions from './Actions'
import {AuthStore} from '../index'
import Constants from './Constants'

const {TOKEN_URL, SESSION_URL} = Constants

class TokenService {
  create(data) {
    let
      buf = JSON.stringify(data),
      headers = {
        'Authorization':  AuthStore.signV1('POST', TOKEN_URL, buf),
        'Content-Type': 'application/json'
      }

    return req.post(TOKEN_URL, buf, {headers})
      .then( ([response, req]) => {
        Actions.create(response)
        return response
      })
  }

  revoke(fingerprint, reason) {
    let
      url = TOKEN_URL + '/revoke/' + fingerprint,
      buf = JSON.stringify({reason}),
      headers = {
        'Authorization':  AuthStore.signV1('POST', url, buf),
        'Content-Type': 'application/json'
      }

    return req.post(url, buf, headers)
      .then( ([response, req]) => Actions.revoke(fingerprint, reason) )
  }

  fetchSessions() {
    let
      url = SESSION_URL,
      headers = {'Authorization':  AuthStore.signV1('GET', url, '')}

    return req.get(url, null, headers)
      .then( ([response, req]) => Actions.fetchSessions(response) )
  }

  fetchTokens() {
    let
      url = TOKEN_URL,
      headers = {'Authorization':  AuthStore.signV1('GET', url, '')}

    return req.get(url, null, headers)
      .then( ([response, req]) => Actions.fetchTokens(response) )
  }
}


export default new TokenService()
