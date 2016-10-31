import _ from 'lodash'

import BaseStore from './Base'
import AppDispatcher from '../AppDispatcher'

export const LayoutConstants = {
   Actions: {
      resize: 'layout:resize',
      subscribe: 'layout:subscribe',
      unsubscribe: 'layout:unsubscribe',
   }
}

export const LayoutActions = {
   resize:               () => AppDispatcher.dispatch({actionType: LayoutConstants.Actions.resize}),
   unsubscribe: (ref, node) => AppDispatcher.dispatch({actionType: LayoutConstants.Actions.unsubscribe, ref: ref, node: node}),
   subscribe:   (ref, node) => AppDispatcher.dispatch({actionType: LayoutConstants.Actions.subscribe, ref: ref, node: node}),
}

class Store extends BaseStore {
   constructor() {
      super()

      this.subscribe(this._subscribe.bind(this))
      this._viewport = {}
      this._rects = {}

      window.addEventListener('resize', LayoutActions.resize)
      LayoutActions.resize()
   }

   ref() {
     return Math.random().toString(36).substring(7);
   }

   _subscribe(action) {
      switch (action.actionType) {
         case LayoutConstants.Actions.resize:
            this._viewport = this.calculateViewport()

            this._rects = _.mapValues(this._rects, (v) => _.set(v, 'rect', v.node.getBoundingClientRect()))

            this.emitChange()
            break;

         case LayoutConstants.Actions.subscribe:
            if (!action.ref) {
               console.log("WARN: can't subscribe to undefined ref...", action)
               return
            }
            if (!action.node) {
               console.log("WARN: can't subscribe to undefined node...", action)
               return
            }

            this._rects[action.ref] = {
               node: action.node,
               rect: action.node.getBoundingClientRect()
            }

            console.log('LayoutStore.subscribe from', action.ref)
            this.emitChange()
            break;

         case LayoutConstants.Actions.unsubscribe:
            if (!action.ref) {
               console.log("WARN: can't unsubscribe to undefined ref...", action)
               return
            }

            console.log('LayoutStore.unsubscribe from', action.ref)
            delete this._rects[action.ref]
            break;
      }
   }

   calculateViewport() {
      //let w = window,
      //    d = document,
      //    e = d.documentElement,
      //    g = d.getElementsByTagName('body')[0],
      //    x = w.innerWidth || e.clientWidth || g.clientWidth,
      //    y = w.innerHeight|| e.clientHeight|| g.clientHeight

      //return {
      //   height: y,
      //   width:  x
      //}
      var body = document.body,
          html = document.documentElement;

      return {
         height: Math.max(body.scrollHeight, body.offsetHeight,
                          html.clientHeight, html.scrollHeight, html.offsetHeight),
         width:  Math.max(body.scrollWidth, body.offsetWidth,
                          html.clientWidth, html.scrollWidth, html.offsetWidth),
      }
   }

   get viewport() {
      return this._viewport
   }

   rect(ref) {
      return (this._rects[ref] || {}).rect
   }
}

export var LayoutStore = new Store()
