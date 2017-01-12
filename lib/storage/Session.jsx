import React from 'react'

import {AuthStore} from '../Auth'

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
