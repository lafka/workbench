import { EventEmitter } from 'events'
import _ from 'lodash'

import jsonpipe from 'jsonpipe'

import Constants from '../Constants'
import {AuthStore} from '../Auth'

export class MessageStore extends EventEmitter {
   constructor() {
      super()
      this._results = []
   }

   emitChange() {
      this.emit('CHANGE')
   }

   addChangeListener(cb) {
      this.on('CHANGE', cb)
   }

   removeChangeListener(cb) {
      this.removeListeer('CHANGE', cb)
   }

   add(item) {
      if (_.find(this._results, item.key))
         return

      this._results.push(item)
      this.emitChange()
   }

   at(index) {
      return this._results[index]
   }

   clear() {
      this._results = []
      this.emitChange()
   }

   get length() {
      return this._results.length
   }

   get messages() {
      return this._results
   }
}

const decodeSerial = (proto, req) => {
   let encoding
   if ('serial' !== proto.detail && 'serial' !== proto.command)
      return proto

   encoding = req.getResponseHeader('x-data-encoding')
   switch (encoding) {
      case 'base64':
      case 'hex':
         proto.data = new Buffer(proto.data, encoding)
         break;
      case 'binary':
      default:
         proto.data = new Buffer(proto.data)
   }

   return proto
}

export class QueryStream extends EventEmitter {
   constructor(opts) {
      super()

      let
         url = Constants.BASE_URL + '/messages/' + opts.resource + '?stream=true',
         headers = {},
         enc

      if (opts.continuous)   url += '&continuous=' + opts.continuous
      if (opts['date.from']) url += '&date.from=' + opts['date.from']
      if (opts['date.to'])   url += '&date.to=' + opts['date.to']

      if (opts.query) url += '&query=' + opts.query

      headers.Authorization = AuthStore.signV1('GET', url, '')

      if (enc = opts['data-encoding'] || opts['data.encoding'] || opts['x-data-encoding'])
         headers['X-Data-Encoding'] = enc

      console.log('url', url)

      const onError = (err) => {
         let data = err || this._req.responseText

         try {
            data = JSON.parse(data)
         } catch (e) { }

         this.emit('error', data, this._req)
      }

      const onSuccess = (data, req) => {
         if (!data['proto/tm'])
            return

         data['proto/tm'] = decodeSerial(data['proto/tm'], req)
         this.emit('data', data)
      }

      this._req = jsonpipe.flow(url, {
         method: 'GET',
         headers: headers,
         success: onSuccess,
         error: onError,
         complete: (status) => this.emit('complete', status),
         withCredentials: false,
      })

      this._req.onabort = () => this.emit('abort')
      this._req.onload = () => this.emit('load')
   }

   close() {
      this._req.abort()
   }
}
