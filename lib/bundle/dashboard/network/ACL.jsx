import React from 'react'

import {Row, Col, Button} from 'react-bootstrap'

export class ACL extends React.Component {
   render() {
      return (
         <Row>
            <Col xs={4}>
               <ul>
                  <li>List of available entities</li>
                  <li>users emails / names</li>
                  <li>and organizations etc</li>
               </ul>
               <div>
                  <Button bsStyle="primary">
                     Add ACL for XYZ
                  </Button>
               </div>
            </Col>

            <Col xs={8}>
               here is the actual rules regarding this network for a
               particular entity
            </Col>
         </Row>
      )
   }
}

ACL.sidebar = true
