import React from 'react'

import Select from 'react-select'

import {Row, Col} from 'react-bootstrap'
import {Button} from 'react-bootstrap'
import {DevicesStorage} from '../../../storage'

const Sidebar = ({nid, ...props}) => {
   return <div>
      {/*
      // resource are typically either a network or a device in which case the
      // value is either `network:<nid>` or `device:<nid>/<dev>`.
      // To select all devices of fw revision `device.proto/tm.part == "1.45"`
      // which will pick any device matching query. With the same form we can
      // or in a network `(network == "ABC" and device.proto/tm.part == "1.45")`
      */}
      <h5>Resources</h5>
      <Select simpleValue placeholder={"Resources, network:" + nid} />

      {/*
      // we want time input to be like this:
      // previous 5 minutes = NOW//-5MINUTE -> NOW
      // next 5 minutes = NOW -> NOW//+5MINUTE
      // previous week, NOW//-2WEEK -> NOW//-1WEEK
      // this week,  NOW//-1WEEK -> NOW
      // first week 2017, -> 2017 -> 2017//+1WEEK
      // first week last year, NOT SUPPORTED
      // previous year -> NOW//-2YEAR -> NOW//-1YEAR
      */}
      <h5>Timerange</h5>
      <Select simpleValue placeholder="Specify Timerange - last hour to now" />

      {/*
      // query is a list of OR queries where each item
      // has the form `e := <field> <op> <value> [and <e> | or <e>]`
      */}
      <h5>Query</h5>
      <Select simpleValue placeholder="Query ie, proto/tm.rssi > 80" />

      {/*
      // show specific columns
      */}
      <h5>Show Columns</h5>
      <Select simpleValue placeholder="key, datetime, ..." />

      <h5>Results Limit</h5>
      <input className="form-control" type="number" value={100} readOnly />

      <Row>
         <Col md={6}>
            <label>
               <input type="checkbox" />

               Continouos query
            </label>
         </Col>
         <Col md={6} className="text-right">
            <Button bsStyle="primary">
               Run Query
            </Button>
         </Col>
      </Row>
   </div>
}

export class Query extends React.Component {
   static get propTypes() {
      return {
         params: React.PropTypes.object.isRequired
      }
   }

   render() {
      const {params} = this.props

      return (
         <Row>
            <Col xs={4}>
               <DevicesStorage
                  onChange={() => null}
                  nid={params.nid}>
                  <Sidebar />
               </DevicesStorage>
            </Col>

            <Col xs={8}>
            </Col>
         </Row>
      )
   }
}

Query.sidebar = true
