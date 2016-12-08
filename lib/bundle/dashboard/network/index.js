import React from 'react'
import {Row, Col, Nav, NavItem, Glyphicon} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'

import Menu from 'antd/lib/menu';

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
      let
         {network, children, sidebar, ...props} = this.props,
         nextPath = buildPath(Network, ev.key, props)

      props.router.push(nextPath)
   }

   render() {
      let
         {network, children, sidebar, ...props} = this.props,
         subpath = _.last(this.props.routes).path,
         pathname = props.location.pathname,
         Aside = !children || undefined === children.type.sidebar ? sidebar : children.type.sidebar


      let haveAside = _.isBoolean(Aside) || undefined === Aside ? false : true


      return (
         <Row>
            {haveAside && <Col xs={4}>
               <Aside network={network} {...props} />
            </Col>}

            <Col xs={haveAside ? 8 : 12}>
               <Menu
                  mode="horizontal"
                  selectedKeys={[subpath]}
                  style={{marginBottom: '4rem'}}
                  onClick={this.handleClick}>
                  {_.map(props.route.childRoutes, (child, idx) => {
                     return !child.name || (undefined !== child.show && child.show(network))
                        ? null
                        : <Menu.Item key={child.path}>
                           {child.glyph && <Glyphicon glyph={child.glyph} style={{marginRight: '1.5rem'}} />}
                           {child.name}
                          </Menu.Item>
                  })}
               </Menu>

               {children && React.cloneElement(children, {network, sidebar, ...props})}
            </Col>
         </Row>
      )
   }
}

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
         component: NotFound,
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
