import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'
import {Nav, NavItem} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import {Link} from 'react-router'

import {UserService, UserStore} from '../../User'
import {UserStorage} from '../../storage/'

import {Account} from './Account.jsx'
import {Tokens} from './Tokens.jsx'
import {Sessions} from './Sessions.jsx'
import {NotFound} from '../../pages/NotFound.jsx'

export {
  Account,
  Tokens,
  Sessions
}

var brand = require('../../../public/images/workbench.png')


export class User extends React.Component {
  render() {
// Use these in the future
//              <LinkContainer to="/user/account/layout"><NavItem>Layout Preferences</NavItem></LinkContainer>
//              <LinkContainer to="/user/account/overview"><NavItem>Overview</NavItem></LinkContainer>
//
//            <h4>Notifications</h4>
//            <Nav>
//              <LinkContainer to="/user/notifications"><NavItem>Preferences</NavItem></LinkContainer>
//              <LinkContainer to="/user/notifications/rules"><NavItem>Notification Rules</NavItem></LinkContainer>
//            </Nav>
//
//              <LinkContainer to="/user/auth/oauth"><NavItem>Oauth Authorizations</NavItem></LinkContainer>
    return (
        <Grid>
          <Row>
            <Col md={4} className="sidebar" style={{margin: '150px 0 20px'}}>
              <h4>Account</h4>
              <Nav>
                <LinkContainer to="/user/account"><NavItem>Settings</NavItem></LinkContainer>
              </Nav>

              <h4>Sessions</h4>
              <Nav>
                <LinkContainer to="/user/auth/sessions"><NavItem>Sessions</NavItem></LinkContainer>
                <LinkContainer to="/user/auth/tokens"><NavItem>API Tokens</NavItem></LinkContainer>
              </Nav>
            </Col>

            <Col md={8} className="main">
              <Row>
                <Col xs={12}>
                  <UserStorage>{this.props.children}</UserStorage>
                </Col>
              </Row>
            </Col>
         </Row>
        </Grid>
    )
  }
}

User.childRoutes = [
  {
    path: 'account',
    component: Account,
    childRoutes: Account.childRoutes
  },
  {
    path: 'auth/tokens',
    component: Tokens,
    childRoutes: Tokens.childRoutes
  },
  {
    path: 'auth/sessions',
    component: Sessions,
    childRoutes: Sessions.childRoutes
  },
  {
    path: '*',
    component: NotFound
  }
]
