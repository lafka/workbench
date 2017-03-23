import React from 'react'
import _ from 'lodash'

import {ButtonToolbar, Row, Col, Alert} from 'react-bootstrap'

import Tooltip from 'antd/lib/tooltip'
import Button from 'antd/lib/button'


import {DeviceService} from '../../../api/device'

import {SetupGuide} from './'
import {Form, Input, Submit} from '../../../forms'
import {AddressEncoder, Loading} from '../../../ui'
import {parse as decodeAddress} from '../../../util/address.js'

export class CreateGateway extends React.Component {
   static get propTypes() {
      return {
         location: React.PropTypes.object.isRequired,
         routes: React.PropTypes.array.isRequired,
         router: React.PropTypes.object.isRequired,
         network: React.PropTypes.object.isRequired
      }
   }

   constructor() {
      super()
      this.state = {
         creatingGateway: false,
         error: false
      }

      this.skipSetup = this.skipSetup.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
   }

   componentWillMount() {
      const {network} = this.props

      if ('true' !== this.props.location.query.autoCreate)
         return

      // if any custom work has been done, consider ourselves done
      if (0 !== network.devices.length && 2 !== network.channels.length)
         return

      this.setState({creatingGateway: true, error: false})

      const payload = {name: 'Gateway #1', address: 0, type: 'gateway'}
      DeviceService.create(network.key, payload)
         .catch(() => this.setState({creatingGateway: false, error: true}))
         .done(() => this.setState({creatingGateway: false}))
   }

   handleSubmit(ev, patch) {
      const {network} = this.props
      ev.preventDefault()

      this.setState({creatingGateway: true, error: false})
      return DeviceService.create(network.key, patch)
               .always(x => {
                  this.setState({creatingGateway: false})
                  return x
               })
   }

   skipSetup() {
      let
         {router, routes} = this.props,
         newRoutes = _.slice(routes, 0, -1),
         nextPath = _.map(newRoutes, r => r.path)
                     .slice(0, -1)
                     .concat(['network', this.props.network.key])
                     .join('/')
                     .replace('//', '/')

      SetupGuide.skipSetup(this.props.network)

      router.push(nextPath)
   }

   get Form() {
      return () =>
         <div>
            <div className="page-header">
               <h4>Create Gateway</h4>
            </div>

            {this.state.error
               && false === this.state.creatingGateway
               && <Alert bsStyle="danger">
                     <b>An unexpected error occured</b><br />
                     There was an error creating your Gateway, try creating it manually.
                  </Alert>}

            <Form
               defaultValues={{address: '::0', type: 'gateway'}}
               transform={({address, ...rest}) => _.set(rest, 'address', decodeAddress(address))}
               onSubmit={this.handleSubmit}>

               <Form.Updated>Network was successfully updated</Form.Updated>
               <Form.Error>Some error occurred during submit</Form.Error>

               <Input
                  param="name"
                  label="Name"
                  />
               <Input
                  param="address"
                  label="Address"
                  groupCssClass="feedback-inline"
                  validate={n => {
                     if (!_.isNumber(decodeAddress(n)) || isNaN(decodeAddress(n)))
                        return {error: 'Invalid address'}
                     return true
                  }}
                  feedback={({value, error}) => {
                     let parsedValue = decodeAddress(value || '0')
                     return (
                        <span className="help-block">
                           {error ? error : <AddressEncoder pretty={true}
                                                            value={decodeAddress(parsedValue)} />}
                        </span>
                     )
                  }}
                  />

               <ButtonToolbar className="text-right" style={{clear: 'both'}}>
                  <Submit>Create Gateway</Submit>
                  &nbsp;
                  <Button onClick={this.skipSetup}>
                     Skip guide
                  </Button>
               </ButtonToolbar>
            </Form>
         </div>
   }

   render() {
      const
         {creatingGateway, error} = this.state,
         InnerForm = this.Form,
         UIDText = 'All Tinymesh devices have a unique address',
         NIDText = 'Gateways can be configured with a Network ID used for identification'


      return (
         <Loading loading={creatingGateway} overlay={true}>
            <Row style={{marginTop: '3rem', position: 'relative'}}>
               <Col md={6}>
                  <InnerForm error={error} />
               </Col>

               <Col md={6}>
                  <p style={{marginTop: '110px', marginBottom: '2rem'}}>
                     Tinymesh Networks communicates through Gateway Devices.
                     The Gateway we define represents one of your physical gateways.
                  </p>

                  <p>
                     The gateway authenticates by using a combination of&nbsp;
                     <Tooltip title={UIDText}><a>Unique ID (UID)</a></Tooltip> and&nbsp;
                     <Tooltip title={NIDText}><a>Network ID (NID)</a></Tooltip>,
                     you can use `<code>0</code>` as UID if you are
                     unsure about your gateways UID.
                  </p>
               </Col>
            </Row>
         </Loading>
      )
   }
}
