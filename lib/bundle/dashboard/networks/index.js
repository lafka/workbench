import React from 'react'
import _ from 'lodash'

import {Nav, NavItem, Glyphicon} from 'react-bootstrap'
import {Link} from 'react-router'

import {NetworksStorage} from '../../../storage'

export const Overview = (props) => {
   return (
      <div style={{position: 'absolute', marginTop: '25%', height: '100px', top: '-100px'}}>
         <div className="text-center" style={{marginTop: '15rem'}}>
            <h3 style={{fontWeight: 'bold'}}>Pick a network</h3>

            <p className="lead">
               Select a network from the menu to the left or go ahead and <Link to="/dashboard/setup">create a new one</Link>
            </p>
         </div>
      </div>
   )}

Overview.childRoutes = []

//const Sidebar = ({networks}) => {
//   // sort out all the organizations
//   const addParent = (acc, p) => p.match(/^user\//) ? acc : acc.concat([p])
//   let orgs = _.reduce(networks, (acc, net) => _.reduce(net.parents, addParent, acc), [])
//
//   return (
//      <div>
//         This is not done
//      </div>
//   )
//}
//
//Overview.sidebar = (props) => <div><NetworksStorage><Sidebar {...props} /></NetworksStorage></div>
