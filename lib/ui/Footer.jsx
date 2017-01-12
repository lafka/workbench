import React from 'react'

import {Grid, Row, Col} from 'react-bootstrap'

export const Footer = ({}) =>
   <footer className="footer" style={{paddingTop: '2rem'}}>
      <Grid>
         <Row>
            <Col xs={12} md={3}>
               <h5>Help & Support</h5>

               <ul className="nav">
                  <li><a href="https://docs.tiny-mesh.com">API Refrence</a></li>
                  <li><a href="https://github.com/tinymesh">GitHub</a></li>
               </ul>
            </Col>
            <Col xs={12} md={3} mdPush={6} className="text-right">
               Copyright &copy; Tiny Mesh AS 2012 - 2016.
            </Col>

         </Row>
      </Grid>
   </footer>
