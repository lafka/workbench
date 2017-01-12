import React from 'react'
import ReactDOM from 'react-dom'
import {Router, Route, IndexRoute, hashHistory} from 'react-router'
import {IntlProvider} from 'react-intl'

import _ from 'lodash'

import {Authenticate, requireAuth} from './components'
import {Loading} from './ui'

import {Dashboard} from './bundle/dashboard'
import {User} from './bundle/user'
import {Logout} from './bundle/auth'

import {NotFound} from './pages/NotFound.jsx'
import {Index} from './pages/Index.jsx'

import {AuthStore} from './Auth'

import {ErrorModal} from './ErrorModal.jsx'

// new stuff
import {Layout} from './ui'
import {SessionStorage} from './storage'

// use bluebird promises for improved error handling!
import Bluebird from 'bluebird'
window.Promise = Bluebird

import './style/app.scss'


export default class App extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         error: null,
         awaitAuth: true
      }

      // window.onerror = this.handleThrownErrors.bind(this)
      this.clearError = this.clearError.bind(this)
   }

   static get propTypes() {
      return {
         children: React.PropTypes.node.isRequired,
         routes: React.PropTypes.array.isRequired
      }
   }

   componentWillMount() {
      AuthStore.addChangeListener(this._listener = () =>
         this.setState({awaitAuth: null === AuthStore.isAuthenticated})
      )
   }

   componentDidMount() {
      let body = document.getElementsByTagName('body')[0]
      body.className = _.without(body.className.split(' '), 'blockloader-init').join(' ')
   }

   handleThrownErrors(msg, file, line, col, err) {
      let
         stack = err ? err.stack : null,
         data = {
            message: msg,
            file: file,
            line: line,
            column: col || (window.event && window.event.errorCharacter),
            stack: stack
         }

      this.setState({error: data})

      return false
   }

   clearError() {
      this.setState({error: null})
   }

   render() {
      let {error, awaitAuth} = this.state


      return (
         <Loading loading={awaitAuth} text="Waiting for authentication reply from server">
            <Layout routes={this.props.routes}>
               <ErrorModal onHide={this.clearError} error={error} />
               <SessionStorage valid={false}>{this.props.children}</SessionStorage>
            </Layout>
         </Loading>
      )
   }
}

ReactDOM.render((
   <IntlProvider locale="en">
      <Router history={hashHistory}>
         <Route path="/" component={ App }>

            <IndexRoute component={ Index } />

            <Route path="auth"
               name="Authenticate"
               component={ Authenticate }
               />

            <Route
               navigate={true}
               path="dashboard"
               name="Dashboard"
               onEnter={ requireAuth }
               glyph="home"
               linkText="Dashboard"
               getComponent={(loc, callback) => callback(null, Dashboard)}
               getChildRoutes={(loc, callback) => callback(null, Dashboard.childRoutes)}
               getIndexRoute={(loc, callback) => callback(null, Dashboard.childRoutes[0])} />

            <Route
               navigate={true}
               name="Documentation"
               path="docs"
               component={ NotFound }
               linkText="Documentation"
               glyph="info-sign" />

            <Route
               navigate={true}
               name="Support"
               path="docs"
               component={ NotFound }
               linkText="Support"
               glyph="question-sign" />

            <Route
               name="User"
               path="user"
               onEnter={ requireAuth }
               linkText="User Account"
               glyph="user"
               hide={true}
               getComponent={(loc, callback) => callback(null, User)}
               getChildRoutes={(loc, callback) => callback(null, User.childRoutes)}
               getIndexRoute={(loc, callback) => callback(null, User.childRoutes[0])} />

            <Route
               path="auth/logout"
               hide={true}
               getComponent={(loc, callback) => callback(null, Logout)}
               getChildRoutes={(loc, callback) => callback(null, Logout.childRoutes)}
               getIndexRoute={(loc, callback) => callback(null, (Logout.childRoutes || [])[0])} />

            <Route path="*" component={ NotFound } />
         </Route>
      </Router>
   </IntlProvider>
   ), document.getElementById('react'))

