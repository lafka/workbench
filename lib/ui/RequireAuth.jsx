import React from 'react'
import Mixin from 'react-mixin'

import {Link} from 'react-router'
import {Grid, Row, Col, Button, Alert} from 'react-bootstrap'
import BodyClass from 'react-body-classname'

import AppDispatcher from '../AppDispatcher'
import {AuthStore, AuthService, AuthConstants} from '../Auth'

import {Loading, Box} from '../ui'
import {LensedStateDefaultMixin} from '../mixin'

let branding = require('../../public/images/workbench-neg.png')

export class RequireAuth extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      user: '',
      password: '',
      notification: undefined
    }
  }

  componentDidMount() {
    // refresh on user:(login,logout)
    this._token = AppDispatcher.register( (action) => {
      switch (action.actionType) {
        case AuthConstants.Actions.login:
          this.forceUpdate()
          break

        default:
          break
      }
    })
  }

  componentwillUnmount() {
    AppDispatcher.unregister(this._token)
  }

  login() {
    var username = this.state.user, password = this.state.password

    AuthService.login(this.state.user, this.state.password)
      .catch((err) => {
        let msg
        if (_.isError(err)) {
          console.log("caught error", err.message)
          console.log(err.stack)
          msg = err.message
        } else
          err = err.data.error || JSON.stringify(err.data)

        this.setState({
          notification: {
            style: 'danger',
            message: "Error logging in: " + msg
          }
        })
      })
  }
  render() {
    if (AuthStore.isAuthenticated)
      return (<RequireAuth.Component {...this.props} />)


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
    return (
      <BodyClass className="theme-blue">
        <div>
          <div className="branding top left">
            <a href="/" title="Workbench">
              <img src={branding} width="150" />
            </a>
          </div>
          <Grid className="login">
            <Row>

              <Col xs={12} smOffset={2} mdOffset={3} sm={8} md={6} style={{marginTop: '10%'}}>

                <Alert bsStyle="danger">
                  <strong>Authentication Error:</strong>
                    You are required to authenticate to access this resource
                </Alert>
                <Box>
                  <Box.Title>Login</Box.Title>

                  {this.state.notification &&
                    <Box.Notify style={this.state.notification.style}>
                      {this.state.notification.message}
                    </Box.Notify>}

                  <Box.Content>

                    <form onSubmit={this.login.bind(this)}>
                      <div className="form-group">
                        <label htmlFor="login-email">Email Address</label>
                        <div className="input-group">
                          <span className="input-group-addon" id="at-addon">@</span>
                          <input
                            type="text"
                            className="form-control"
                            name="login-email"
                            id="login-email"
                            valueLink={this.linkState('user')}
                            placeholder="email@address" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="login-password">Password</label>
                        <div className="input-group">
                          <span className="input-group-addon" id="at-addon">***</span>
                          <input
                            type="password"
                            className="form-control"
                            name="login-password"
                            id="login-password"
                            valueLink={this.linkState('password')}
                            placeholder="********" />
                        </div>
                      </div>

                      <div className="text-right">
                        <Button
                          bsStyle="success"
                          onClick={this.login.bind(this)}>
                          Sign in
                        </Button>
                      </div>
                    </form>

                    <Link to="/" query={{register: true}}>Don't have an account? Sign up!</Link>
                  </Box.Content>
                  {info}
                </Box>
              </Col>
            </Row>

            <Row className="footer">
              <Col xs={12}>
                <span className="links muted">
                  © 2012-2015 <a href="https://tiny-mesh.com">Tiny Mesh AS</a>
                </span>
              </Col>
            </Row>
          </Grid>
        </div>
      </BodyClass>
    )
  }
}

Mixin(RequireAuth.prototype, LensedStateDefaultMixin)

RequireAuth.jail = (Component) => {
  if (AuthStore.haveAuthentication())
    return Component

  // silly way of doing things...
  RequireAuth.Component = Component
  return RequireAuth
}