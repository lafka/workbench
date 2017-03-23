import React from 'react'
import _ from 'lodash'

import {ButtonToolbar, Row, Col} from 'react-bootstrap'

import Tooltip from 'antd/lib/tooltip'
import Button from 'antd/lib/button'


import {DeviceService} from '../../../api/device'

import {SetupGuide} from './'
import {Form, Input, Submit} from '../../../forms'
import {AddressEncoder} from '../../../ui'
import {parse as decodeAddress} from '../../../util/address.js'

class DeviceForm extends React.Component {
   static get propTypes() {
      return {
         routes: React.PropTypes.array.isRequired,
         router: React.PropTypes.object.isRequired,
         params: React.PropTypes.object.isRequired,
         network: React.PropTypes.object.isRequired
      }
   }

   constructor() {
      super()
      this.state = {
         loading: false
      }

      this.skipSetup = this.skipSetup.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
   }

   handleSubmit(ev, patch) {
      const {network} = this.props
      ev.preventDefault()

      return DeviceService.create(network.key, patch)
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

      url = _.reduce(params, (acc, v, k) => acc.replace(':' + k, v), nextPath)
      router.push(url)
   }

   render() {
      return (
         <div>
            <div className="page-header">
               <h4>Create Gateway</h4>
            </div>

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
                  <Button onClick={this.skipSetup}>
                     Skip Setup guide
                  </Button>
               </ButtonToolbar>
            </Form>
         </div>
      )
   }
}

export const CreateGateway = (props) => {
   let
      UIDText = 'All Tinymesh devices have a unique address',
      NIDText = 'Gateways can be configured with a Network ID used for identification'

   return (
      <Row style={{marginTop: '3rem'}}>
         <Col md={6}>
            <DeviceForm {...props} />
         </Col>

         <Col md={6}>
            <p style={{marginTop: '110px', marginBottom: '2rem'}}>
               A Tinymesh network requires a connector to relay data between
               the Tinymesh radio network and the Tinymesh Cloud.
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
   )
}
