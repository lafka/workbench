import React from 'react'
import _ from 'lodash'

import {DeviceStore, DeviceService} from '../stores/Device'

export class DevicesStorage extends React.Component {
   constructor(props) {
      super()
      this.state = {devices: DeviceStore.devices(props.nid)}
   }

   componentWillMount() {
      this._mounted = true

      // only look if there's nothing there!
      if (this.props.nid && 0 === _.size(DeviceStore.devices(this.props.nid)))
         DeviceService.list(this.props.nid)

      DeviceStore.addChangeListener( this._listener = () =>
         this._mounted && this.setState({devices: DeviceStore.devices(this.props.nid)})
      )
   }

   componentDidUpdate(prevProps, {devices}) {
      if (this.props.onChange && ! _.isEqual(devices, this.state.devices))
         this.props.onChange(this.state.devices)
   }

   componentWillReceiveProps(nextProps) {
      if (nextProps.nid && 0 === _.size(DeviceStore.devices(nextProps.nid)))
         DeviceService.list(nextProps.nid)

      this._mounted && this.setState({devices: DeviceStore.devices(nextProps.nid)})
   }

   componentWillUnmount() {
      this._mounted = false
      DeviceStore.removeChangeListener( this._listener )
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
         device: React.PropTypes.string
      }
   }

   constructor(props) {
      super(props)
      this.state = {device: DeviceStore.device(props.nid, props.device)}
   }

   componentWillMount() {
      let device = null

      this._mounted = true

      if (!this.props.nid || !this.props.device)
         return

      device = DeviceStore.device(this.props.nid, this.props.device)

      if (!device && this.props.nid)
         DeviceService.fetch(this.props.nid, this.props.device)

      DeviceStore.addChangeListener( this._listener = () =>
         this._mounted && this.setState({device: DeviceStore.device(this.props.nid, this.props.device)})
      )
   }

   componentWillUnmount() {
      this._mounted = false
      DeviceStore.removeChangeListener( this._listener )
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



