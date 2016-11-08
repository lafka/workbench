import React from 'react'
import _ from 'lodash'

import {Row, Col, Nav, NavItem, Glyphicon} from 'react-bootstrap'
import {Link} from 'react-router'
import {LinkContainer} from 'react-router-bootstrap'

export const SetupGuide = ({networks, network, ...props}) => {
   let
      Sidebar = props.sidebar,
      activeStep = steps[whichSteps(network).length]

   return (
      <Row>
         {Sidebar && <Col xs={4}>
            <Sidebar />
         </Col>}
         <Col xs={Sidebar || _.size(networks) > 0 ? 8 : 12}>
            <SetupSteps network={network} />

            <div className="network-setup-content">
               {activeStep && activeStep.children}
            </div>
         </Col>
      </Row>
   )}


const whichSteps = function(network) {
   return _.takeWhile(steps, ({check}) => check(network))
}

const stepClass = (network, n) => {
   let progress = _.size(whichSteps(network))

   if (n === progress)
      return 'active'

   if (n < progress)
      return 'done'
}

const steps = [
   {
      title: 'Create Network',
      check: (network) => network,
      children: <div>Create me</div>
   },

   {
      title: 'Setup Gateway',
      check: (network) => !network ? false : _.size(network.devices) > 0,
      children: <div>Setup gateway</div>
   },

   {
      title: 'Connect Gateway',
      check: (network) => !network ? false : _.size(network.devices) > 0,
      children: <div>Connection, disconnection</div>
   },
]

export const SetupSteps = ({network, link}) => {
   if (steps.length === whichSteps(network).length)
      return null

   let inner = (
      <div className="network-setup stepwizard">
         <div className="stepwizard-row setup-panel">

           {_.map(steps, ({title}, idx) =>
              <div key={idx} className={"stepwizard-step " + stepClass(network, idx)}>
                 <span className="step">{idx + 1}</span>
                 <p>{title}</p>
              </div>)}
         </div>
      </div>)

   return true === link && network
      ? <LinkContainer to={`/dashboard/setup/${network.key}`}>{inner}</LinkContainer>
      : inner
}

SetupGuide.childRoutes = [
   {
      path: ':nid',
      component: SetupGuide
   }
]

SetupGuide.sidebar = true

