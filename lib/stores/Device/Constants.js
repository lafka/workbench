import Constants from '../../Constants'

export default {
  DEVICE_URL: Constants.BASE_URL + '/device',
}

export const Actions = {
   create: 'device:create',
   update: 'device:update',
   list:   'device:list',
   change: 'device:change'
}
