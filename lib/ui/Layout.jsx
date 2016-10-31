import React from 'react'
import _ from 'lodash'

import {Navbar, Nav, NavItem, Glyphicon} from 'react-bootstrap'

import {SessionStorage} from '../storage'
import {Footer} from './Footer.jsx'

let branding = require('../../public/images/workbench-neg.png')

export const Layout = ({routes, children}) => {
    let links = _.filter(routes[0].childRoutes, (r) => r.navigate)

    return (
      <div className="layout">
         <Navbar
            bsStyle="inverse"
            style={{marginBottom: 0}}
            staticTop={true}>

               <Navbar.Header>
                  <Navbar.Brand>
                     <a href="#">
                        <img src={branding} width={100} />
                     </a>
                  </Navbar.Brand>
               </Navbar.Header>

               <Nav>
                  {_.map(links, (e, k) =>
                     <NavItem key={k} href={`#/${e.path}`}>{e.name}</NavItem>)}
               </Nav>

               <SessionStorage valid={true}>
                  <Nav className="pull-right">
                     <NavItem href="#/user/account">
                        <Glyphicon glyph="envelope">&nbsp;</Glyphicon>
                        User Account
                     </NavItem>
                     <li style={{padding: '15px 0'}}>|</li>
                     <NavItem href="#/auth/logout">
                        <Glyphicon glyph="off">&nbsp;</Glyphicon>
                        Logout
                     </NavItem>
                  </Nav>
               </SessionStorage>
         </Navbar>

         <div className="main">
            {children}
         </div>

         <Footer />
      </div>
    )}
