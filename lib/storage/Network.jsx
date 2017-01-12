import React from 'react'
import _ from 'lodash'

import {NetworkStore, NetworkService} from '../stores/Network'

export class NetworksStorage extends React.Component {
   static get propTypes() {
      return {
         children: React.PropTypes.node.isRequired
      }
   }

   constructor() {
      super()
      this.state = {networks: NetworkStore.networks}
   }

   componentWillMount() {
      this._mounted = true

      NetworkService.list()

      NetworkStore.addChangeListener(this._listener = () =>
         this._mounted && this.setState({networks: NetworkStore.networks})
      )
   }

   componentWillUnmount() {
      this._mounted = false
      NetworkStore.removeChangeListener(this._listener)
   }

   render() {
      let
         {networks} = this.state,
         {children, ...props} = this.props

      return React.cloneElement(children, _.assign({}, props, {networks: networks}))
   }
}


export class NetworkStorage extends React.Component {
   static get propTypes() {
      return {
         children: React.PropTypes.node.isRequired,
         nid: React.PropTypes.string
      }
   }

   constructor(props) {
      super(props)
      this.state = {network: NetworkStore.network(props.nid)}
   }

   componentWillMount() {
      let network = null

      this._mounted = true

      network = NetworkStore.network(this.props.nid)

      if (!network && this.props.nid)
         NetworkService.fetch(this.props.nid)

      NetworkStore.addChangeListener(this._listener = () =>
         this._mounted && this.setState({network: NetworkStore.network(this.props.nid)})
      )
   }

   componentWillUnmount() {
      this._mounted = false
      NetworkStore.removeChangeListener(this._listener)
   }

   componentWillReceiveProps(next) {
      let network = null

      if (next.nid !== this.props.nid) {
         network = NetworkStore.network(next.nid)

         if (!network && next.nid)
            NetworkService.fetch(next.nid)

         this.setState({network: network})
      }
   }

   render() {
      let
         {network} = this.state,
         {children, ...props} = this.props

      if (network)
         return React.cloneElement(children, _.assign({}, props, {network: network}))
      else
         return null
   }
}


