import React from 'react'
import {Grid, Row, Col} from 'react-bootstrap'
import {Nav, NavItem, Glyphicon} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'

import {NetworksStorage, NetworkStorage} from '../../storage'

//import {Overview} from './Overview.jsx'
//import {Network} from './Network'
//import {Device} from './Device'
//import {SetupGuide} from './SetupGuide.jsx'

import {NotFound} from '../../pages/NotFound.jsx'

const NetworkNav = ({networks, network}) =>
   <div>
      {_.size(networks) > 0 &&
         <Nav className="list">
            {_.map(networks, net => <LinkContainer key={net.key} to={`/dashboard/network/${net.key}`}><NavItem>{net.name || net.key}</NavItem></LinkContainer>)}
         </Nav>}

      {0 === _.size(networks) &&
         <p class="lead copy" style={{padding: '25px'}}>You haven't created your first network yet!</p>}

      {null === _.size(networks) &&
         <p class="lead copy" style={{padding: '25px'}}>loading...</p>}
   </div>

export const Dashboard = ({children, params}) => {
   if (NotFound.name === children.type.name)
      return React.cloneElement(children, {sidebar: <Sidebar />})

   else
      return (
         <Grid>
           <Row>
             <Col className="sidebar" xs={4}>
               <Sidebar />
             </Col>

             <Col className="main" xs={8}>
                <NetworksStorage>
                   <NetworkStorage nid={params.nid}>
                      {children}
                   </NetworkStorage>
                </NetworksStorage>
             </Col>
           </Row>
         </Grid>
   )}

const Sidebar = (props) =>
   <div>
      <h4>Networks</h4>

      <NetworksStorage>
        <NetworkNav />
      </NetworksStorage>


      <div className="separator"><hr /></div>
      <Nav className="meta">
       <LinkContainer to="/dashboard">
          <NavItem>
            <Glyphicon glyph="home">&nbsp;</Glyphicon>
             Overview
          </NavItem>
       </LinkContainer>
       <LinkContainer to="/dashboard/setup">
         <NavItem>
            <Glyphicon glyph="plus">&nbsp;</Glyphicon>
            Create new network
         </NavItem>
       </LinkContainer>
      </Nav>
   </div>

Dashboard.childRoutes = [
//  {
//    component: Overview,
//    childRoutes: Overview.childRoutes
//  },
//  {
//    path: 'network/:nid',
//    component: Network,
//    childRoutes: Network.childRoutes
//  },
//  {
//    path: 'device/:nid/:key',
//    component: Device,
//    childRoutes: Device.childRoutes
//  },
//  {
//    path: 'setup',
//    component: SetupGuide,
//    childRoutes: SetupGuide.childRoutes
//  },
  {component: NotFound},
  {
    path: '*',
    component: NotFound
  }
]
