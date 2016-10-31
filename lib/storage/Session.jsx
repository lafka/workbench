import React from 'react'

import {AuthStore} from '../Auth'

export class SessionStorage extends React.Component {
   constructor() {
      super()
      this.state = {session: AuthStore.auth}
   }

   componentWillMount() {
      AuthStore.addChangeListener( this._listener = () =>
         this.setState({session: AuthStore.auth})
      )
   }

   componentWillUnmount() {
      AuthStore.removeChangeListener( this._listener )
   }

   render() {
      let
         {session} = this.state,
         {valid} = this.props,
         props = {
            session: session,
            resolved: AuthStore.haveAuthentication()
         }

      if (session || valid === false)
         return React.cloneElement(this.props.children, props)
      else
         return null
   }
}
