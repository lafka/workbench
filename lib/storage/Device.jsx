import React from 'react'
import _ from 'lodash'

import {DeviceStore, DeviceService} from '../api/device'

export class DevicesStorage extends React.Component {
   static get propTypes() {
      return {
         nid: React.PropTypes.string.isRequired,
         children: React.PropTypes.node.isRequired,
         onChange: React.PropTypes.func.isRequired,
         filter: React.PropTypes.func
      }
   }
   constructor(props) {
      super()
      this.state = {devices: DeviceStore.devices(props.nid)}
   }

   componentWillMount() {
      this._mounted = true

      // only look if there's nothing there!
      if (this.props.nid && 0 === _.size(DeviceStore.devices(this.props.nid)))
         DeviceService.list(this.props.nid)

      DeviceStore.addChangeListener(this._listener = () => {
         if (this._mounted)
            this.setState({devices: DeviceStore.devices(this.props.nid)})
      })
   }

   componentDidUpdate(prevProps, {devices}) {
      const {onChange} = this.props

      if (onChange && !_.isEqual(devices, this.state.devices))
         onChange(this.state.devices)
   }

   componentWillReceiveProps({nid}) {
      if (nid && 0 === _.size(DeviceStore.devices(nid)))
         DeviceService.list(nid)

      if (this._mounted)
         this.setState({devices: DeviceStore.devices(nid)})
   }

   componentWillUnmount() {
      this._mounted = false
      DeviceStore.removeChangeListener(this._listener)
   }

   render() {
      let
         {devices} = this.state,
         {children, filter, ...props} = this.props

      if (filter)
         devices = _.filter(devices, filter)

      return React.cloneElement(children, _.assign({}, props, {devices: devices}))
   }
}


export class DeviceStorage extends React.Component {
   static get propTypes() {
      return {
         nid: React.PropTypes.string.isRequired,
         device: React.PropTypes.string,
         children: React.PropTypes.node.isRequired
      }
   }

   constructor(props) {
      super(props)
      this.state = {device: DeviceStore.device(props.nid, props.device)}
   }

   componentWillMount() {
      let {nid, device} = this.props

      this._mounted = true

      if (!nid || !device)
         return

      if (!DeviceStore.device(nid, device) && nid)
         DeviceService.fetch(nid, device)

      DeviceStore.addChangeListener(this._listener = () => {
         if (this._mounted)
            this.setState({device: DeviceStore.device(this.props.nid, this.props.device)})
      })
   }

   componentWillUnmount() {
      this._mounted = false
      DeviceStore.removeChangeListener(this._listener)
   }

   componentWillReceiveProps(next) {
      let device = null

      if (next.nid !== this.props.nid) {
         device = DeviceStore.device(next.nid)

         if (!device && next.nid)
            DeviceService.fetch(next.nid)

         this.setState({device: device})
      }
   }

   render() {
      let
         {device} = this.state,
         {children, ...props} = this.props

      return React.cloneElement(children, _.assign({}, props, {device: device}))
   }
}
