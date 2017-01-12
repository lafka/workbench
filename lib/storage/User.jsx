import React from 'react'
import _ from 'lodash'

import {UserStore} from '../User'

export class UserStorage extends React.Component {
   static get propTypes() {
      return {
         children: React.PropTypes.node.isRequired
      }
   }

   constructor() {
      super()
      this.state = {user: UserStore.auth || null}
   }

   componentWillMount() {
      this._mounted = true

      UserStore.addChangeListener(this._listener = () =>
         this._mounted && this.setState({user: UserStore.user || null})
      )
   }

   componentWillUnmount() {
      this._mounted = false
      UserStore.removeChangeListener(this._listener)
   }

   render() {
      let
         {user} = this.state,
         {children, ...props} = this.props

      return React.cloneElement(children, _.assign({}, props, {user: user}))
   }
}

