import Constants from '../Constants'

export default {
  USER_URL: Constants.BASE_URL + '/user',
  REGISTER_URL: Constants.BASE_URL + '/user/register',
}

export const Actions = {
   update: 'user:update',
   change: 'user:change'
}

