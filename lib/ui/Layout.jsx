import React from 'react'
import _ from 'lodash'

import {Navbar, Nav, NavItem} from 'react-bootstrap'
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
         </Navbar>

         <div className="main">
            {children}
         </div>

         <Footer />
      </div>
    )}
