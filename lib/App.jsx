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

let auth = localStorage.getItem('auth')

// new stuff
import {Layout} from './ui'
import {SessionStorage} from './storage'


export default class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      error: null,
      loading: !!auth
    }

    window.onerror = this.handleThrownErrors.bind(this)
    this.clearError = this.clearError.bind(this)
  }

  componentDidMount() {
    var body = document.getElementsByTagName('body')[0]
    body.className = _.without(body.className.split(' '), 'blockloader-init').join(' ')

    if (auth)
      AuthService.validate(JSON.parse(auth))
                 .then(() => this.setState({loading: false}))
                 .catch(() => this.setState({loading: false}))
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
    let {error, loading} = this.state

    return (
      <Loading loading={loading} text="Waiting for authentication reply from server">
         <Layout routes={this.props.routes}>
            <ErrorModal onHide={this.clearError} error={error} />
            <SessionStorage valid={false}>{this.props.children}</SessionStorage>
         </Layout>
      </Loading>
    )
  }
}
//
//      <Route path="organizations"   component={ NotFound }  glyph="user"      linkText="Organizations" />
//      <Route path="applications"    component={ NotFound }  glyph="book"      linkText="Applications" />
//      <Route path="operations"      component={ NotFound }  glyph="scale"     linkText="Operations" />
//      <Route path="getting-started" component={ NotFound }  glyph="flash"     linkText="Getting Started" />
//      <Route path="help"            component={ NotFound }  glyph="education" linkText="Help & Support" />

const loadScript = function(url, callback) {
   let script = document.createElement("script")
   script.type = "text/javascript"

   if (script.readyState)
      script.onreadystatechange = function() {
         if (script.readyState == "loaded" || script.readyState == "complete") {
            script.onreadystatechange = null
            callback(script)
         }
      }
   else
      script.onload = function() {
         callback(script)
      }

   script.src = url
   document.getElementsByTagName("head")[0].appendChild(script)
}

const asyncComponent = function(bundle, module) {
   let
      name = bundle
               .replace(/^\.\/dist\//, '')
               .replace(/\.js$/, ''),
      req = './bundle/' + name + '/index'

   return (location, callback) => {
      try {
         callback(null, require(req)[module])
      } catch (e) {
         loadScript(bundle, () => {
            callback(null, require(req)[module])
         })
      }
   }
}

const asyncRoutes = function(bundle, module, nth) {
   return (location, callback) =>
      asyncComponent(bundle, module)(location, (_x, component) => {
         if (!component.childRoutes)
            callback(null, [])

         if (undefined === nth)
            callback(null, component.childRoutes)
         else
            callback(null, component.childRoutes[nth])
      })
}

const A = (props) => <div>I AM A DIV</div>

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
          getComponent={asyncComponent('./dist/dashboard.js', 'Dashboard')}
          getChildRoutes={asyncRoutes('./dist/dashboard.js', 'Dashboard')}
          getIndexRoute={asyncRoutes('./dist/dashboard.js', 'Dashboard', 0)}
          onEnter={ requireAuth }
          glyph="home"
          linkText="Dashboard" />

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
          component={ User }
          onEnter={ requireAuth }
          linkText="User Account"
          glyph="user"
          hide={true}
          indexRoute={User.childRoutes[0]}
          childRoutes={User.childRoutes} />

        <Route
          path="auth/logout"
          getComponent={asyncComponent('bundle/auth/index.js', 'Logout')}
          hide={true} />

        <Route path="about" component={ About } />

        <Route path="*" component={ NotFound } />
      </Route>
    </Router>
  </IntlProvider>
  ), document.getElementById("react") )
