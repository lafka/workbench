import AppDispatcher from '../../AppDispatcher'
import {Actions} from './Constants'

export default {
  create: (token) => {
    return AppDispatcher.dispatch({
      actionType: Actions.create,
      token: token
    })
  },

  revoke: (fingerprint, reason) => {
    return AppDispatcher.dispatch({
      actionType: Actions.revoke,
      fingerprint: fingerprint,
      reason: reason
    })
  },

  fetchTokens: (tokens) => {
    return AppDispatcher.dispatch({
      actionType: Actions.fetch_tokens,
      tokens: tokens
    })
  },

  fetchSessions: (sessions) => {
    AppDispatcher.dispatch({
      actionType: Actions.fetch_sessions,
      sessions: sessions
    })
    return null
  }
}
