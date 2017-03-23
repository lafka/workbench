import React from 'react'
import _ from 'lodash'
import {Grid, Row, Col} from 'react-bootstrap'
import {Nav, NavItem, Glyphicon} from 'react-bootstrap'
import {IndexLinkContainer, LinkContainer} from 'react-router-bootstrap'

import {Overview} from './networks'
import {SetupGuide} from './setup-guide'

import {NetworksStorage, NetworkStorage} from '../../storage'

import {Network} from './network'
import {Device} from './device'
//import {SetupGuide} from './SetupGuide.jsx'

import {NotFound} from '../../pages/NotFound.jsx'

const NetworkNav = ({networks, nid}) =>
   <div>
      {_.size(networks) > 0 &&
         <Nav className="list">
            {_.map(networks, net =>
               <LinkContainer key={net.key}
                              active={net.key === nid  ? true : null}
                              to={`/dashboard/network/${net.key}`}>
                  <NavItem>{net.name || net.key}</NavItem>
               </LinkContainer>)}
         </Nav>}

      {0 === _.size(networks) &&
         <p class="lead copy" style={{padding: '25px'}}>You haven't created your first network yet!</p>}

      {null === _.size(networks) &&
         <p class="lead copy" style={{padding: '25px'}}>loading...</p>}
   </div>

export const Dashboard = ({children, params, ...props}) => {
   console.log('render', 'dashboard/index', window.location.hash)

   let
      Aside = undefined === children.type.sidebar ? Sidebar : children.type.sidebar,
      childRoutes = _.tail(_.dropWhile(props.routes, ({path}) => path !== "dashboard")),
      hasSubGrid = _.some(childRoutes, ({component}) => component && component.providesGrid)

   const Main = () =>
                  <NetworksStorage>
                     {params.nid
                        ?  <NetworkStorage nid={params.nid}>
                              {React.cloneElement(children, {sidebar: Sidebar})}
                           </NetworkStorage>
                        : React.cloneElement(children, {sidebar: Sidebar})}
                  </NetworksStorage>


   if (NotFound.name === children.type.name)
      return React.cloneElement(children, {sidebar: <div style={{padding: '2rem 0'}}><Sidebar /></div>})
   else if (hasSubGrid)
      return <Main />
   else
      return (
         <Grid>
           <Row style={{padding: '2rem 0'}}>
             {!_.isBoolean(Aside) && <Col className="sidebar" xs={4}>
               <Aside sidebar={Sidebar} nid={params.nid}/>
             </Col>}

             <Col className="main" xs={_.isBoolean(Aside) ? 12 : 8}>
               <Main />
             </Col>
           </Row>
         </Grid>
   )}

const Sidebar = (props) =>
   <div className="sidebar">
      <h4>Networks</h4>

      <NetworksStorage>
        <NetworkNav {...props} />
      </NetworksStorage>


      <div className="separator"><hr /></div>
      <Nav className="meta">
       <IndexLinkContainer to="/dashboard/setup">
         <NavItem>
            <Glyphicon glyph="plus">&nbsp;</Glyphicon>
            Create new network
         </NavItem>
       </IndexLinkContainer>
      </Nav>
   </div>


Dashboard.childRoutes = [
  {
    component: Overview,
    childRoutes: Overview.childRoutes
  },
  {
    path: 'network/:nid',
    component: Network,
    childRoutes: Network.childRoutes,
    onEnter: Network.onEnter
  },
  {
    path: 'device/:nid/:key',
    component: Device,
    childRoutes: Device.childRoutes,
    onEnter: Device.onEnter
  },
  {
    path: 'setup',
    component: SetupGuide,
    childRoutes: SetupGuide.childRoutes
  },
  {component: NotFound},
  {
    path: '*',
    component: NotFound
  }
]
