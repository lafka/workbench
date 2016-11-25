import localForage from 'localforage'
import {ajax} from '../nanoajax.js'

import Actions from './Actions'
import AuthStore from './Store'
import Constants from './Constants'

const {AUTH_URL, GET_SESS_URL, REGISTER_URL} = Constants

let req = (method, url, body, headers) =>
   new Promise( (resolve, reject) =>
      ajax({
         url,
         body,
         headers: _.assign({'Content-Type': 'application/json'}, headers || {}),
         method: method.toUpperCase(),
         cors: true
      }, (code, resp, req) => {
         let err
         if (!code || code >= 500) {
            err = new Error("http call failed, check `data` or `req`")
            err.data = resp
            err.req = req
            return reject(err)
         }

         try {
            resp = JSON.parse(resp)
            resolve([resp, req])
         } catch (e) {
            e.data = resp
            e.req = req
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
      .then( auth => {
        console.log('got auth', auth)
        this.validate(auth)
      })
  }

  login(email, password) {
    return req.post(AUTH_URL, JSON.stringify({email, password}))
              .then( ([resp, req]) => {
                localForage.setItem('auth', resp)
                  .then(() => Actions.login(resp))

                return [resp, req]
              })
  }

  logout(reason) {
    let headers = {'Authorization':  AuthStore.signV1('DELETE', AUTH_URL, '')}

    return req.delete(AUTH_URL, null, headers)
              .then( ([resp, req]) => {
                localForage.clear()
                  .then(() => Actions.logout(reason))

                return [resp, req]
              })
    // maybe add a catch for 401/403 return when token has expired before logout
  }

  validate(auth) {
    let headers = {'Authorization':  AuthStore.signV1('GET', GET_SESS_URL, '', auth)}

    return req.get(GET_SESS_URL, null, headers)
              .then( ([resp, req]) => {
                if (200 === req.status)
                  Actions.login(auth)
                else {
                  localForage.clear()
                    .then(() => Actions.logout(auth))
                }

                return [resp, req]
              })
    // maybe a check is needed for status code; who knows what's really ok
  }

  register(email, password) {
    return req.post(REGISTER_URL, {email, password})
              .then( ([resp, req]) => {
                this.login(email, password)

                return [resp, req]
              })
  }
}


export default new AuthService()
