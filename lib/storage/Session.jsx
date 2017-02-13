import React from 'react'
import _ from 'lodash'

import {AuthStore} from '../Auth'
import {TokenStore, TokenService} from '../Auth/Tokens'

export class SessionStorage extends React.Component {
   static get propTypes() {
      return {
         children: React.PropTypes.node.isRequired,
         valid: React.PropTypes.bool.isRequired
      }
   }

   constructor() {
      super()
      this.state = {session: AuthStore.auth}
   }

   componentWillMount() {
      AuthStore.addChangeListener(this._listener = () =>
         this.setState({session: AuthStore.auth})
      )
   }

   componentWillUnmount() {
      AuthStore.removeChangeListener(this._listener)
   }

   render() {
      let
         {session} = this.state,
         {children, valid} = this.props,
         props = {
            session: session,
            resolved: AuthStore.haveAuthentication()
         }

      if (session || false === valid)
         return React.cloneElement(children, props)
      else
         return null
   }
}


export class SessionsStorage extends React.Component {
   static get propTypes() {
      return {
         children: React.PropTypes.node.isRequired,
         filter: React.PropTypes.func
      }
   }

   constructor() {
      super()

      this.state = {
         tokens: null
      }

      this._mounted = false
      this._promise = null
   }

   componentDidMount() {
      this._mounted = true

      TokenService.fetchSessions()

      TokenStore.addChangeListener(this._listener = () => {
         if (this._mounted)
            this.setState({tokens: TokenStore.sessions})
      })
   }

   componentWillUnmount() {
      this._mounted = true

      TokenStore.removeChangeListener(this._listener)
   }

   render() {
      const {children, filter, ...props} = this.props
      let {tokens} = this.state

      if (filter)
         tokens = _.filter(tokens, filter)

      if (tokens)
         return React.cloneElement(children, _.assign({}, props, {sessions: tokens}))

      return null
   }
}

