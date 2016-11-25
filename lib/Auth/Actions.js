import AppDispatcher from '../AppDispatcher'
import {Actions} from './Constants'

export default {
  login: (auth) => {
    console.log('auth: setting localStorage')
    localStorage.setItem('auth', JSON.stringify(auth))

    AppDispatcher.dispatch({
      actionType: Actions.login,
      auth: auth
    })

    return auth
  },

  register: (user) => {
    AppDispatcher.dispatch({
      actionType: Actions.register,
      user: user
    })

    return user
  },


  logout: (reason) => {
    console.log('auth: removing localStorage')
    localStorage.removeItem('auth')

    AppDispatcher.dispatch({
      actionType: Actions.logout,
      reason: reason
    })
  },
}
