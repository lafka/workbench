import React from 'react'
import _ from 'lodash'

import {TokenStore, TokenService} from '../Auth/Tokens'

export class TokensStorage extends React.Component {
   static get propTypes() {
      return {
         children: React.PropTypes.node.isRequired,
         filter: React.PropTypes.func
      }
   }

   constructor() {
      super()

      this.state = {tokens: null}
      this._mounted = false
   }

   componentDidMount() {
      this._mounted = true

      TokenService.fetchTokens()

      TokenStore.addChangeListener(this._listener = () => {
         if (this._mounted)
            this.setState({tokens: TokenStore.tokens})
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
         return React.cloneElement(children, _.assign({}, props, {tokens}))
      else
         return null
   }
}
