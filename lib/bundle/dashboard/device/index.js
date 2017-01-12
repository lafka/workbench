import React from 'react'
import {Grid, Row, Col, Nav, NavItem, Glyphicon, Breadcrumb} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import {FormattedRelative} from 'react-intl'
import _ from 'lodash'

import Menu from 'antd/lib/menu';

import {DeviceStorage} from '../../../storage'

import {NotFound} from '../../../pages/NotFound'
import {Network} from '../'

import {Overview} from './Overview'
import {Console} from './Console'
import {Query} from '../query'
import {Configuration} from './Configuration'

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

   return <ol className="metabar">
      {device.meta.updated &&
         <li key="updated" style={{'float': 'right', marginLeft: '1rem'}}>
            <small>Updated: <FormattedRelative value={device.meta.updated} /></small>
         </li>}
      {device.meta.created &&
         <li key="created" style={{'float': 'right', marginLeft: '1rem'}}>
            <small>Created: <FormattedRelative value={device.meta.created} /></small>
         </li>}
   </ol>
}

const DeviceName = ({device}) => device && <span>{device.name || device.key}</span>

export class Device extends React.Component {
   constructor() {
      super()

      this.handleClick = this.handleClick.bind(this)
   }

   componentWillMount() {
      let {params} = this.props
      this._mounted = true
   }

   componentWillUnmount() {
      this._mounted = false
   }

   handleClick(ev) {
      const {network, children, sidebar, path, ...props} = this.props
      const nextPath = ev.key.match(/^\//) ? ev.key : buildPath(Device, ev.key, props)

      props.router.push(nextPath)
   }

   render() {
      const {network, children, ...props} = this.props
      let
         params = props.params,
         subpath = _.last(props.routes).path,
         hasSubRoute = Device !== _.last(props.routes).component

      if (!network)
         return <NotFound />


      return (
         <Grid>
            <Row>
               <Col xs={12}>
                  <Menu
                     mode="horizontal"
                     selectedKeys={[subpath]}
                     style={{marginBottom: '4rem', marginTop: '1rem'}}
                     onClick={this.handleClick}>

                     <Menu.Item key={`/dashboard/network/${network.key}`}>
                        <Glyphicon glyph="chevron-left" style={{marginRight: '1.5rem'}} />
                        {network.name || "Network - " + network.key}
                     </Menu.Item>

                     {_.map(props.route.childRoutes, (child, idx) => {
                        return !child.name || (undefined !== child.show && child.show(network))
                           ? null
                           : <Menu.Item key={child.path}>
                              {child.glyph && <Glyphicon glyph={child.glyph} style={{marginRight: '1.5rem'}} />}
                              {child.name}
                             </Menu.Item>
                     })}
                  </Menu>

                  <DeviceStorage nid={network.key} device={params.key}>
                     <DeviceMeta />
                  </DeviceStorage>
               </Col>
            </Row>

            <Row>
               <Col xs={12}>
                  <DeviceStorage nid={network.key} device={params.key}>
                     {children && React.cloneElement(children, {network, useGrid: false, sidebar: false, ...props})}
                  </DeviceStorage>
               </Col>
            </Row>
         </Grid>
      )
   }
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
         component: Configuration,
      },
      {
         name:  'Query',
         glyph: 'search',
         path:  'query',
         component: Query,
      },
      {
         name:  'Console',
         glyph: 'lock',
         path:  'console',
         component: Console,
      },
      {
         path:  '*',
         component: NotFound,
      },
   ]

