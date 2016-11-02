import Constants from '../../Constants'

export default {
  NETWORK_URL: Constants.BASE_URL + '/network',
}

export const Actions = {
   new:    'network:new',
   update: 'network:update',
   list:   'network:list',
   change: 'network:change'
}
