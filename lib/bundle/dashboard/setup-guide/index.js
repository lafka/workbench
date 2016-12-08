import React from 'react'
import _ from 'lodash'

import Steps from 'antd/lib/steps'
import Tooltip from 'antd/lib/tooltip'
import Button from 'antd/lib/button'
import Form from 'antd/lib/form'
import Input from 'antd/lib/input'
import Icon from 'antd/lib/icon'

import {Row, Col, Nav, NavItem, Glyphicon} from 'react-bootstrap'
import {Link} from 'react-router'
import {LinkContainer} from 'react-router-bootstrap'

export const SetupGuide = ({network, ...props}) => {
   let
      step,
      Child

   if (undefined === network) {
      step = 0
      Child = CreateNetwork
   } else if (undefined === _.find(network.devices, {type: 'gateway'})) {
      step = 1
      Child = CreateGateway
   } else {
      step = 2
      Child = Connection
   }

   return (
      <div>
         <SetupSteps network={network} step={step} />

         <Child network={network} {...props} />
      </div>
   )
}

const CreateNetwork = (props) => <span>Create Network</span>

class CreateGatewayDevice extends React.Component {
   constructor() {
      super()
      this.state = { loading: false }

      this.skipSetup = this.skipSetup.bind(this)
   }

   handleCreate() {
      //
      //.done( () => this.setState({loading: false}))
   }

   skipSetup() {
      let
         {router, params, routes} = this.props,
         newRoutes = _.slice(routes, 0, -1).concat([{path: 'overview'}]),
         nextPath = _.map(newRoutes, r => r.path)
                     .join('/')
                     .replace('//', '/'),
         url

      SetupGuide.skipSetup(this.props.network)

      url = _.reduce(params, (acc, v, k) => acc.replace(":" + k, v), nextPath)
      router.push(url)

   }

   render() {
      const
         {getFieldDecorator} = this.props.form,
         formItemLayout = { labelCol: { span: 6 }, wrapperCol: { span: 18 } },
         name = getFieldDecorator('name', { rules: [{ required: false, message: 'Please input a Unique ID!' }], }),
         address = getFieldDecorator('address', { rules: [{ required: true, message: 'Please input your username!' }], })


                  {                     (
                              <Input addonBefore={<Icon type="user" />} placeholder="Username" />
                            )}
      return (
         <div>
            <div className="page-header"><h4>Create Gateway</h4></div>
            <Form onSubmit={this.handleSubmit}>
               <Form.Item {...formItemLayout} label="Address">{address(<Input placeholder="Address" />)}</Form.Item>
               <Form.Item {...formItemLayout} label="Name">{name(<Input placeholder="Name" />)}</Form.Item>
            </Form>

            <div className="text-right">
               <Button
                  icon="check"
                  type="primary"
                  loading={this.state.loading}
                  onClick={this.handleCreate}>

                  Create
               </Button>

               <Button
                  style={{marginLeft: '8px'}}
                  type="ghost"
                  icon="close"
                  onClick={this.skipSetup}>

                  Skip Setup
               </Button>
            </div>
         </div>
      )
   }
}
const CreateGatewayDeviceForm = Form.create()(CreateGatewayDevice)
const CreateGateway = (props) => {
   let
      UIDText = "All Tinymesh devices have a unique address",
      NIDText = "Gateways can be configured with a Network ID used for identification",
      ConnectorText = "Tinyconnect seamlessly integrates the Tinymesh Gateway with the Tinymesh Cloud"

   return <Row style={{marginTop: '3rem'}}>
      <Col md={6}>
         <CreateGatewayDeviceForm {...props} />
      </Col>

      <Col md={6}>
         <blockquote style={{border: 'none', marginTop: '85px'}}>
            A Tinymesh network requires a connector to relay data between
            the Tinymesh radio network and the Tinymesh Cloud.
         </blockquote>

         <p className="small" style={{padding: '0 25px'}}>
            The gateway authenticates by using a combination of&nbsp;
            <Tooltip title={UIDText}><a>Unique ID (UID)</a></Tooltip> and&nbsp;
            <Tooltip title={NIDText}><a>Network ID (NID)</a></Tooltip>,
            you can use `<code>0</code>` as UID if you are
            unsure about your gateways UID.
         </p>

         <p className="small" style={{padding: '0 25px'}}>
            If you are using <Tooltip title={ConnectorText}><a>Tinyconnect</a></Tooltip>&nbsp;
            you can skip the setup guide completely.
         </p>
      </Col>
   </Row>
}

const Connection = (props) => <span>Connect</span>

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
   </Steps>

SetupGuide.childRoutes = [
   {
      path: ':nid',
      component: SetupGuide
   }
]
