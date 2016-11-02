import Constants from '../../Constants'

export default {
  TOKEN_URL: Constants.BASE_URL + '/auth/token',
  SESSION_URL: Constants.BASE_URL + '/auth/session',
}

export const Actions = {
   create: 'auth:token:create',
   revoke: 'auth:token:revoke',
   fetch_sessions: 'auth:token:sessions',
   fetch_tokens: 'auth:token:tokens'
}
