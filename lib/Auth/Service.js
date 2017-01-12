import localForage from 'localforage'
import {ajax} from '../nanoajax.js'
import _ from 'lodash'

import Actions from './Actions'
import AuthStore from './Store'
import Constants from './Constants'


window.localForage = localForage

const {AUTH_URL, GET_SESS_URL, REGISTER_URL} = Constants

let req = (method, url, body, headers) =>
   new Promise( (resolve, reject) =>
      ajax({
         url,
         body,
         headers: _.assign({'Content-Type': 'application/json'}, headers || {}),
         method: method.toUpperCase(),
         cors: true
      }, (code, resp, httpreq) => {
         let err
         if (!code || code >= 500) {
            err = new Error("http call failed, check `data` or `req`")
            err.data = resp
            err.req = httpreq
            return reject(err)
         }

         try {
            resolve([JSON.parse(resp), httpreq])
         } catch (e) {
            e.data = resp
            e.req = httpreq
            reject(err)
         }
      })
   )

req.get    = (url, body, headers) => req('GET',    url, body, headers)
req.put    = (url, body, headers) => req('PUT',    url, body, headers)
req.post   = (url, body, headers) => req('POST',   url, body, headers)
req.delete = (url, body, headers) => req('DELETE', url, body, headers)

class AuthService {
  constructor() {
    localForage.getItem('auth')
      .then( this.validate )
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
    // maybe a check is needed for status code; who knows what's really ok
  }

  register(email, password) {
    return req.post(REGISTER_URL, JSON.stringify({email, password}))
              .then( ([resp, httpreq]) => {
                this.login(email, password)

                return [resp, httpreq]
              })
  }
}


export default new AuthService()
