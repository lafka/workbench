import React from 'react'
import {Row, Col, Nav, NavItem, Glyphicon} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'

import {NotFound} from '../../../pages/NotFound'
import {NetworkService} from '../../../stores'

import {Overview} from './Overview.jsx'
import {DeviceManagement} from './Devices.jsx'
import {ACL} from './ACL.jsx'


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
   }

   componentDidMount() {
      this._mounted = false
   }

   static get sidebar() {
      return true
   }

   render() {
      let
         {network, children, sidebar, ...props} = this.props,
         pathname = props.location.pathname,
         Aside = !children || undefined === children.type.sidebar ? sidebar : children.type.sidebar


      let haveAside = _.isBoolean(Aside) || undefined === Aside ? false : true

      return (
         <div>
            <Row>
               <Nav bsStyle="pills">
                  {_.map(props.route.childRoutes, (child, idx) => {
                     return !child.name
                        ? null
                        : (
                           <LinkContainer to={buildPath(Network, child.path, props)} key={idx}>
                              <NavItem>
                                 {child.glyph && <Glyphicon glyph={child.glyph} />}
                                 &nbsp;
                                 {child.name}
                              </NavItem>
                           </LinkContainer>)
                  })}
               </Nav>
            </Row>

            <Row>
               {haveAside && <Col xs={4}>
                  <Aside network={network} {...props} />
               </Col>}

               <Col xs={haveAside ? 8 : 12}>
                  {React.cloneElement(children, {network, sidebar, ...props})}
               </Col>
            </Row>
         </div>
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
         path:  '*',
         component: NotFound,
      },
   ]
