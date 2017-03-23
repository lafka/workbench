import React from 'react'
import _ from 'lodash'

import Steps from 'antd/lib/steps'
// import Tooltip from 'antd/lib/tooltip'
// import Button from 'antd/lib/button'
// import Form from 'antd/lib/form'
// import Input from 'antd/lib/input'
// import Icon from 'antd/lib/icon'

import {Row, Col, Nav, NavItem, Glyphicon} from 'react-bootstrap'
import {Link} from 'react-router'
import {LinkContainer} from 'react-router-bootstrap'

import {DeviceStore} from '../../../api/device'
import {DevicesStorage} from '../../../storage'

import {CreateNetwork} from './CreateNetwork'
import {CreateGateway} from './CreateGateway'
import {Connection} from './Connection'
import {QuickStart} from './QuickStart'

const WrappedSetupGuide = ({network, devices, ...props}) => {
   let
      step,
      Child

   if (undefined === network) {
      step = 0
      Child = CreateNetwork
   } else if (undefined === _.find(devices, {type: 'gateway'})) {
      step = 1
      Child = CreateGateway
   } else if (true) {
      step = 2
      Child = Connection
   } else {
      step = 3
      Child = QuickStart
   }

   return (
      <div>
         <SetupSteps network={network} step={step} />

         <Child network={network} {...props} />
      </div>
   )
}

export const SetupGuide = ({network, ...props}) =>
   network
      ? <DevicesStorage nid={network.key}>
            <WrappedSetupGuide network={network} {...props} />
         </DevicesStorage>
      :  <WrappedSetupGuide network={network} devices={[]} {...props} />

SetupGuide.setupFinished = ({channels, key}) => {
   if (undefined === localStorage['skip-setup#' + key])
      return 0 !== channels.length
   else
      return "true" === localStorage['skip-setup#' + key]
}

SetupGuide.skipSetup = ({key}) => {
   localStorage['skip-setup#' + key] = "true"
}

export const SetupSteps = ({network, link, step}) =>
   <Steps current={step || 0}>
      <Steps.Step title="Create Network" />
      <Steps.Step title="Setup Gateway" />
      <Steps.Step title="Connect Gateway" />
      <Steps.Step title="Get Started" />
   </Steps>

SetupGuide.childRoutes = [
   {
      path: ':nid',
      component: SetupGuide
   }
]
