import {BASE_URL} from '../Constants'

export default {
  AUTH_URL: BASE_URL + '/auth/session',
  GET_SESS_URL: BASE_URL + '/auth',
  REGISTER_URL: BASE_URL + '/user/register',

  Actions: {
    login:    'user:login',
    logout:   'user:logout',
    register: 'user:register'
  },

  LogoutReasons: {
    sessionExpire: 'expire',
    user: 'user',
  }
}
