import localForage from 'localforage'
import {req} from '../nanoajax.js'
import _ from 'lodash'

import Actions from './Actions'
import AuthStore from './Store'
import Constants from './Constants'


window.localForage = localForage

const {AUTH_URL, GET_SESS_URL, REGISTER_URL} = Constants

class AuthService {
  // initiate store, ENSURE TO TIRGGER StorageChange
  constructor() {
    localForage.getItem('auth')
      .then((auth) => auth ? this.validate(auth) : Actions.logout(null))
  }

  login(email, password) {
    return req.post(AUTH_URL, JSON.stringify({email, password}))
              .then( ([resp, httpreq]) => {

                if (200 === httpreq.status)
                   localForage.setItem('auth', resp)
                     .then(() => Actions.login(resp))

                return [resp, httpreq]
              })
  }

  logout(reason) {
    let headers = {'Authorization':  AuthStore.signV1('DELETE', AUTH_URL, '')}

    return req.delete(AUTH_URL, null, headers)
              .then( ([resp, httpreq]) => {
                localForage.clear(() => Actions.logout(reason))

                return [resp, httpreq]
              })
    // maybe add a catch for 401/403 return when token has expired before logout
  }

  validate(auth) {
    let headers = {'Authorization':  AuthStore.signV1('GET', GET_SESS_URL, '', auth)}

    return req.get(GET_SESS_URL, null, headers)
              .then( ([resp, httpreq]) => {
                if (200 === httpreq.status)
                  Actions.login(auth)
                else
                  localForage.clear(() => Actions.logout(auth))

                return [resp, httpreq]
              })
              .catch( (err) => {
                if (!err.req)
                  throw err

                switch (err.req.status) {
                  case 400:
                  case 401:
                  case 403:
                     localForage.clear(() => {
                        console.log('cleared auth')
                        Actions.logout('auth')
                     })
                     break;

                  default:
                     throw err
                }
              })
  }

  register(email, password) {
    return req.post(REGISTER_URL, JSON.stringify({email, password}))
      .then( ([resp, httpreq]) => {
        if (200 === httpreq.status)
          this.login(email, password)

        return [resp, httpreq]
      })
  }
}


export default new AuthService()
