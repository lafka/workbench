import {req} from '../nanoajax.js'

import Actions from './Actions'
import Constants from './Constants'
import {AuthStore, AuthActions, AuthConstants} from '../Auth'

const {USER_URL, REGISTER_URL}  = Constants

class UserService {
  update(userPatch) {
    let payload = JSON.stringify(userPatch)
    let headers = {
      'Authorization':  AuthStore.signV1('PUT', USER_URL, payload),
      'Content-Type': 'text/json'
    }

    return req.put(USER_URL, payload, headers)
      .then( ([resp, httpreq]) => Actions.update(resp) )
      .catch( (err) => {
         switch (err.req.status) {
            // bad request; rethrow error
            case 400:
               let newErr = new Error("Server rejected user update (" + err.req.statusText + ")")
               newErr.req = err.req
               throw(newErr)
               break;
         }
      })
  }

  fetch() {
    let headers = {'Authorization':  AuthStore.signV1('GET', USER_URL, '')}

    return req.get(USER_URL, null, headers)
      .then( ([resp, httpreq]) => Actions.change(resp))
      .catch(
        (response) => {
          if (response.status === 401)
            AuthActions.logout('timeout')

          throw response
        })
  }

  register(email, password) {
    const json = JSON.stringify({email,password})
    return req.post(REGISTER_URL, json)
      .then(([resp, httpreq]) => Actions.change(resp))
      .catch((response) => { throw response } )
  }
}


export default new UserService()
