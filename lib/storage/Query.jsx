import React from 'react'
import {MessageStore, QueryStream} from '../stores/Message'

export class QueryStorage extends React.Component {
   static get propTypes() {
      return {
         resource: React.PropTypes.string.isRequired,
         query: React.PropTypes.string,
         dateFrom: React.PropTypes.string,
         dateTo: React.PropTypes.string,
         continuous: React.PropTypes.bool,
         onData: React.PropTypes.func
      }
   }

   constructor(props) {
      super(props)
      this._store = new MessageStore()
      this._stream = null

      this.state = {
         messages: null
      }
   }

   componentWillMount() {
      let {stateful} = this.props

      this._mounted = true

      this._store.addChangeListener( this._listener = () =>
         this._mounted && false !== stateful && this.setState({messages: this._store.messages}))

      this._reQuery()
   }

   componentWillUnmount() {
      this._mounted = false

      if (this._stream)
         this._stream.close()

      this._stream = null
   }

   componentWillReceiveProps(next) {
      let
         {resource, query, continuous} = this.props,
         dateFrom = this.props['dateFrom'],
         dateTo = this.props['dateTo']

      // toggling continuous will open/close permanent connection
      // changing date-(to,from), resource or query will issue new req


      if (next.continuous !== continuous) {
         // just cancel the stream if needed
         if ("false" === next.continuous.toString())

         // if we are enabling streaming just requery with new opts
         if ("true" === next.continuous.toString())
            this._reQuery()
      } else if (next.resource !== resource
            || next.query !== query
            || next['dateFrom'] !== dateFrom
            || next['dateTo'] !== dateTo)
         this._reQuery()
   }

   _reQuery() {
      let
         {resource, query, continuous, dateFrom, dateTo, onData} = this.props


      this._stream = new QueryStream({
         resource, query, continuous,
         'date.to': dateTo,
         'date.from': dateFrom
      })

      this._stream.on('data', (msg) => {
         this._store.add.call(this._store, msg)
         onData(msg)
      })
   }

   render() {
      let
         {children, resources, query, continuous, dateFrom, dateTo, ...props} = this.props,
         {messages} = this.state

      return !children ? null : React.cloneElement(children, {messages: messages, ...props})
   }
}
