import Constants from '../Constants'

export default {
   AUTH_URL: Constants.BASE_URL + '/auth/session',
   GET_SESS_URL: Constants.BASE_URL + '/auth',
   REGISTER_URL: Constants.BASE_URL + '/user/register',
}

export const Actions = {
   login:    'user:login',
   logout:   'user:logout',
   register: 'user:register'
}

export const LogoutReasons = {
   sessionExpire: 'expire',
   user: 'user',
}
