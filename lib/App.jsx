import React from 'react'
import ReactDOM from 'react-dom'
import {Router, Route, RouteHandler, IndexRoute, hashHistory} from 'react-router'
import {IntlProvider} from 'react-intl'

import _ from 'lodash'

import {Authenticate, requireAuth, About, User} from './components'
import {Loading} from './ui'

import {NotFound} from './pages/NotFound.jsx'
import {Index} from './pages/Index.jsx'

import {AuthStore, AuthService, AuthConstants} from './Auth'
import AppDispatcher from './AppDispatcher'

import {ErrorModal} from './ErrorModal.jsx'

// new stuff
import {Layout} from './ui'
import {SessionStorage} from './storage'

// use bluebird promises for improved error handling!
import Bluebird from 'bluebird'
window.Promise = Bluebird
//window.require = require

console.log(require('./style/app.scss'))


export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      error: null
    }

    //window.onerror = this.handleThrownErrors.bind(this)
    this.clearError = this.clearError.bind(this)
  }

  componentDidMount() {
    var body = document.getElementsByTagName('body')[0]
    body.className = _.without(body.className.split(' '), 'blockloader-init').join(' ')
  }

  handleThrownErrors(msg, file, line, col, err) {
    col = col || (window.event && window.event.errorCharacter);
    let
      stack = err ? err.stack : null,
      data = {
         message:    msg,
         file:       file,
         line:       line,
         column:     col,
         stack:      stack
     }

    this.setState({error: data})

    return false
  }

  clearError() {
    this.setState({error: null})
  }

  render() {
    let {error} = this.state

    return (
      <Loading text="Waiting for authentication reply from server">
         <Layout routes={this.props.routes}>
            <ErrorModal onHide={this.clearError} error={error} />
            <SessionStorage valid={false}>{this.props.children}</SessionStorage>
         </Layout>
      </Loading>
    )
  }
}

ReactDOM.render( (
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
          getComponent={(loc, callback) => callback(null, require('./bundle/dashboard/index').Dashboard)}
          getChildRoutes={(loc, callback) => callback(null, require('./bundle/dashboard/index').Dashboard.childRoutes)}
          getIndexRoute={(loc, callback) => callback(null, require('./bundle/dashboard/index').Dashboard.childRoutes[0])} />

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
          getComponent={(loc, callback) => callback(null, require('./bundle/user/index').User)}
          getChildRoutes={(loc, callback) => callback(null, require('./bundle/user/index').User.childRoutes)}
          getIndexRoute={(loc, callback) => callback(null, require('./bundle/user/index').User.childRoutes[0])} />

        <Route
          path="auth/logout"
          hide={true}
          getComponent={(loc, callback) => callback(null, require('./bundle/auth/index').Logout)}
          getChildRoutes={(loc, callback) => callback(null, require('./bundle/auth/index').Logout.childRoutes)}
          getIndexRoute={(loc, callback) => callback(null, (require('./bundle/auth/index').Logout.childRoutes || [])[0])} />

        <Route path="*" component={ NotFound } />
      </Route>
    </Router>
  </IntlProvider>
  ), document.getElementById("react") )

