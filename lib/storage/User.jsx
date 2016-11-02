import React from 'react'

import {UserStore} from '../User'

export class UserStorage extends React.Component {
   constructor() {
      super()
      this.state = {user: UserStore.auth || null}
   }

   componentWillMount() {
      this._mounted = true

      UserStore.addChangeListener( this._listener = () =>
         this._mounted && this.setState({user: UserStore.user || null})
      )
   }

   componentWillUnmount() {
      this._mounted = false
      UserStore.removeChangeListener( this._listener )
   }

   render() {
      let
         {user} = this.state,
         {children, ...props} = this.props

      return React.cloneElement(this.props.children, _.assign({}, props, {user: user}))
   }
}

