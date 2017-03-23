import React from 'react'
import _ from 'lodash'

import {ButtonToolbar, Row, Col} from 'react-bootstrap'

import {NetworkService} from '../../../api/network'
import {Form, Input, Submit} from '../../../forms'


export class CreateNetwork extends React.Component {
   constructor() {
      super()

      this.state = {
         network: {}
      }

      this.handleSubmit = this.handleSubmit.bind(this)
   }

   static get propTypes() {
      return {
         routes: React.PropTypes.array.isRequired,
         router: React.PropTypes.object.isRequired
      }
   }

   handleSubmit(ev, patch) {
      const data = _.omit(patch, '$autoCreate')
      return NetworkService.create(data)
         .then((network) => {
            // redirect to network specific setup guide
            const pathname = _.map(this.props.routes, ({path}) => path)
                                 .concat([network.key])
                                 .join('/')
                                 .replace(/^\//, '')

            this.props.router.push({pathname, query: {autoCreate: patch.$autoCreate}})
         })
   }

   render() {
      return (
         <Row style={{marginTop: '3em'}}>
            <Col md={6}>
               <div className="page-header">
                  <h4>Create Network</h4>
               </div>
               <Form
                  onSubmit={this.handleSubmit}
                  defaultValues={{'$autoCreate': true, name: ''}}>

                  <Form.Updated>Network was successfully updated</Form.Updated>
                  <Form.Error>Some error occurred during Network Creation</Form.Error>

                  <Input
                     label="Name"
                     type="text"
                     param="name" />

                  <Input
                     label="Create a Gateway Device for this Network?"
                     type="checkbox"
                     param="$autoCreate" />

                  <ButtonToolbar style={{clear: 'both'}} className="text-right">
                     <Submit>Create Network</Submit>
                  </ButtonToolbar>

               </Form>
            </Col>

            <Col md={6}>
               <p style={{marginTop: '110px', marginBottom: '2rem'}}>
                  A Tinymesh Network enables one or more Tinymesh Gateways
                  to communicate over the Tinymesh Cloud API's.
               </p>

               <p>
                  After creating a Network and a Gateway definition in the Cloud API
                  you can configure the Network and Unique ID in the Gateway Device
                  to allow it to connect to the Tinymesh Cloud.
               </p>
            </Col>
         </Row>
      )
   }
}
