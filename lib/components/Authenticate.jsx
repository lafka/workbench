import React from 'react'
import {routerShape} from 'react-router'

import {Grid, Row, Col, Alert} from 'react-bootstrap'
import {Link} from 'react-router'

import AppDispatcher from '../AppDispatcher'
import {Login, Register} from './auth'
import {AuthStore, AuthConstants} from '../Auth'
import {Notify, Box} from '../ui'

let branding = require('../../public/images/workbench-neg.png')

export const requireAuth = function(nextState, replace) {
   if (!AuthStore.isAuthenticated)
      replace({
         pathname: '/auth',
         state: { nextPathname: nextState.location.pathname }
      })
}

export class Authenticate extends React.Component {
  constructor(props, ctx) {
    super(props, ctx)

    this._notify = null
  }

  componentWillMount() {
    this._notify = new Notify.Store()
  }

  componentDidMount() {
    const {location} = this.props

    if (AuthStore.isAuthenticated) {
      if (location.state && location.state.nextPathname) {
         this.context.router.replace(location.state.nextPathname)
      } else {
         this.context.router.replace('/')
      }
   }

    // refresh on user:login
    this._token = AppDispatcher.register( (action) => {
      let {location} = this.props


      switch (action.actionType) {
        case AuthConstants.Actions.login:
          if (location.state && location.state.nextPathname) {
             this.context.router.replace(location.state.nextPathname)
          } else {
             this.context.router.replace('/dashboard')
          }

          break

        case AuthConstants.Actions.logout:
          this.context.router.replace('/auth')
          break

        default:
          break
      }
    })
  }

  componentwillUnmount() {
    AppDispatcher.unregister( this._token )
    this._notify = null
  }

  render() {
    let info = (<Box.Info>
                  <p>
                    You are using a beta product, it may not work as
                    expected at all times but by giving us feedback we
                    improve it over time!
                  </p>

                  <p>
                    <em>By logging in to the <strong>Tinymesh Cloud™</strong> you agree to
                    our terms of service.</em>
                  </p>
                </Box.Info>)


    let register = "register" === this.props.location.query.auth
    let {route} = this.props
    let logoutReason

    switch (this.props.location.query.logout) {
      case 'undefined':
      case AuthConstants.LogoutReasons.user:
        logoutReason = "You have been logged out"; break;

      case AuthConstants.LogoutReasons.sessionExpire:
        logoutReason = "Your have been logged out because of inactivity"; break;

      default:
        break;
    }

    return (
      <div className="featured" style={{padding: '140px 0 80px', background: '#34495e', color: "#fff", borderBottom: '3px solid #23384d'}}>
        <Grid className="login">
          <Row>
            <Col xs={12} smOffset={2} mdOffset={3} sm={8} md={6}>
             <Alert bsStyle="danger">
               <strong>Authentication Error:</strong>
                 You are required to authenticate to access this resource
             </Alert>

              <Box show={!register}>
                <Box.Title>Login</Box.Title>

                <Notify store={this._notify} />

                <Box.Content>
                  <Login notify={this._notify} history={this.props.history} />
                  <Link to={{pathname: route.path, query: {auth: 'register'}}}>Don't have an account? Sign up!</Link>
                </Box.Content>

                {info}
              </Box>

              <Box show={register}>
                <Box.Title>Create a new account</Box.Title>

                <Notify store={this._notify} />

                <Box.Content>
                  <Register notify={this._notify} />
                  <Link to={{pathname: route.path, query: {auth: 'login'}}}>Already have an account? Sign in</Link>
                </Box.Content>

                {info}
              </Box>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

Authenticate.contextTypes = {
   router: React.PropTypes.object.isRequired
}
