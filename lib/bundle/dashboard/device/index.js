import React from 'react'
import {Grid, Row, Col, Nav, NavItem, Glyphicon, Breadcrumb} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import {FormattedRelative} from 'react-intl'

import {DeviceStorage} from '../../../storage'

import {NotFound} from '../../../pages/NotFound'
import {Network} from '../'

import {Overview} from './Overview'

const buildPath = (parent, dest, {routes, params}) => {
   let
      parentRoutes = _.dropRightWhile(routes, ({component}) =>
                        !_.eq(parent, component)),
      path = _.map(parentRoutes, (comp) => comp.path)
               .concat([dest])
               .join('/')
               .replace(/\/\//, '/')


   return _.reduce(params,
                   (acc, newVal, val) => acc.replace(":" + val, newVal),
                   path)
}

const DeviceMeta = ({device}) => {
   if (!device)
      return null

   return <div
            className="text-right">
      {device.meta.created && <span>Created: <FormattedRelative value={device.meta.created} /><br /></span>}
      {device.meta.updated && <span>Updated: <FormattedRelative value={device.meta.updated} /></span>}
   </div>
}

const DeviceName = ({device}) => device && <span>{device.name || device.key}</span>

export const Device = ({network, children, ...props}) => {
   let params = props.params,
       hasSubRoute = Device !== _.last(props.routes).component

   if (!network)
      return <NotFound />


   return <div>
      <div style={{borderBottom: '1px solid #ddd',
                   background: "#eaeaea",
                   padding: '0.7rem 0 0.5rem'}}>
         <Grid>
            <Row>
               <Col xs={8}>
                  <Breadcrumb style={{backgroundColor: 'transparent', paddingTop: '0.7rem'}}>
                     <Breadcrumb.Item href={"#" + buildPath(Network, '', props) + 'network/' + params.nid}>
                        <Glyphicon glyph="chevron-left" />&nbsp;
                        Network: {network ? network.name || network.key : ' ... '}
                     </Breadcrumb.Item>
                     <Breadcrumb.Item active={!hasSubRoute} href={"#" + buildPath(Device, 'overview', props)}>
                        Device: <DeviceStorage nid={network.key} device={params.key}><DeviceName /></DeviceStorage>
                     </Breadcrumb.Item>
                     {hasSubRoute &&
                        <Breadcrumb.Item active>
                           {_.last(props.routes).name || _.last(props.routes).path}
                        </Breadcrumb.Item>}
                  </Breadcrumb>
               </Col>
               <Col xs={4}>
                  <DeviceStorage nid={network.key} device={params.key}>
                     <DeviceMeta />
                  </DeviceStorage>
               </Col>
            </Row>
         </Grid>
       </div>

      <Grid>
         <Row>
            <Col xs={4} className="sidebar">
               <Nav>
                  {_.map(props.route.childRoutes, (child, idx) => {
                     return !child.name
                        ? null
                        : (
                           <LinkContainer to={buildPath(Device, child.path, props)} key={idx}>
                              <NavItem>
                                 {child.glyph && <Glyphicon glyph={child.glyph} />}
                                 &nbsp;
                                 {child.name}
                              </NavItem>
                           </LinkContainer>)
                  })}
               </Nav>
            </Col>

            <Col xs={8}>
               <DeviceStorage nid={network.key} device={params.key}>
                  {children && React.cloneElement(children, {network, useGrid: false, sidebar: false, ...props})}
               </DeviceStorage>
            </Col>
         </Row>
      </Grid>
   </div>
}

Device.providesGrid = true

Device.onEnter = (nextState, replace) => {
   if (_.last(nextState.routes).component === Device)
      replace({pathname: buildPath(Device, 'overview', nextState)})
}

Device.childRoutes = [
      {
         name:  'Overview',
         glyph: 'home',
         path:  'overview',
         component: Overview,
      },
      {
         name:  'Configuration',
         glyph: 'list-alt',
         path:  'devices',
         component: NotFound,
      },
      {
         name:  'Query',
         glyph: 'search',
         path:  'query',
         component: NotFound,
      },
      {
         name:  'Console',
         glyph: 'lock',
         path:  'console',
         component: NotFound,
      },
      {
         path:  '*',
         component: NotFound,
      },
   ]

