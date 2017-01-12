import React from 'react'
import {Grid, Row, Col, Nav, NavItem, Glyphicon, Breadcrumb} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import {FormattedRelative} from 'react-intl'
import _ from 'lodash'

import Menu from 'antd/lib/menu';

import {Query} from '../query'
import {NotFound} from '../../../pages/NotFound'
import {NetworkService} from '../../../stores'

import {Overview} from './Overview.jsx'
import {DeviceManagement} from './device-manager'
import {ACL} from './ACL.jsx'
import {SetupGuide} from '../setup-guide'

// this does NOT work with index routes
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

const NetworkMeta = ({network}) => {
   if (!network)
      return null

   return <div className="text-right metabar">
      {network.meta.updated && <span>Updated: <FormattedRelative value={network.meta.updated} /></span>}
      {network.meta.created && network.meta.updated && ' — '}
      {network.meta.created && <span>Created: <FormattedRelative value={network.meta.created} /></span>}
   </div>
}

export class Network extends React.Component {
   componentWillMount() {
      let {params} = this.props
      this._mounted = true

      NetworkService.fetch(params.nid)

      this.handleClick = this.handleClick.bind(this)
   }

   componentWillReceiveProps(nextProps) {
      if (this.props.params.nid !== nextProps.params.nid)
         NetworkService.fetch(nextProps.params.nid)
   }

   componentWillUnmount() {
      this._mounted = false
   }

   static get sidebar() {
      return true
   }

   handleClick(ev) {
      const {network, children, sidebar, ...props} = this.props
      const nextPath = ev.key.match(/^\//) ? ev.key : buildPath(Network, ev.key, props)

      props.router.push(nextPath)
   }

   render() {
      const {network, children, sidebar, ...props} = this.props
      let
         subpath = _.last(props.routes).path,
         pathname = props.location.pathname,
         Aside = !children || undefined === children.type.sidebar ? sidebar : children.type.sidebar,
         hasSubRoute = Network !== _.last(props.routes).component


      let haveAside = _.isBoolean(Aside) || undefined === Aside ? false : true

      if (!network)
         return <NotFound />

      return (
      <div>
         <Grid>
            <Row>
               <Col xs={12}>
                  <Menu
                     mode="horizontal"
                     selectedKeys={[subpath]}
                     style={{marginBottom: '4rem', marginTop: '1rem'}}
                     onClick={this.handleClick}>

                     <Menu.Item key="/dashboard">
                        <Glyphicon glyph="chevron-left" style={{marginRight: '1.5rem'}} />
                        Networks
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

                  <ol className="metabar">
                     {network.meta.updated &&
                        <li key="updated" style={{'float': 'right', marginLeft: '1rem'}}>
                           <small>Updated: <FormattedRelative value={network.meta.updated} /></small>
                        </li>}
                     {network.meta.created &&
                        <li key="created" style={{'float': 'right', marginLeft: '1rem'}}>
                           <small>Created: <FormattedRelative value={network.meta.created} /></small>
                        </li>}
                  </ol>

               </Col>
            </Row>
            <Row>
               {haveAside && <Col xs={4}>
                  <Aside network={network} {...props} />
               </Col>}

               <Col xs={haveAside ? 8 : 12}>
                  {children && React.cloneElement(children, {network, sidebar, ...props})}
               </Col>
            </Row>
          </Grid>
       </div>
      )
   }
}

Network.providesGrid = true

Network.onEnter = (nextState, replace) => {
   if (_.last(nextState.routes).component === Network)
      replace({pathname: buildPath(Network, 'overview', nextState)})
}

Network.childRoutes = [
      {
         name:  'Overview',
         glyph: 'home',
         path:  'overview',
         component: Overview,
      },
      {
         name:  'Device Management',
         glyph: 'list-alt',
         path:  'devices',
         component: DeviceManagement,
      },
      {
         name:  'Query',
         glyph: 'search',
         path:  'query',
         component: Query,
      },
      {
         name:  'ACL',
         glyph: 'lock',
         path:  'acl',
         component: ACL,
      },
      {
         name: 'Setup Guide',
         glyph: 'tasks',
         path: 'setup',
         component: SetupGuide,
         show: SetupGuide.setupFinished
      },
      {
         path:  '*',
         component: NotFound,
      },
   ]
