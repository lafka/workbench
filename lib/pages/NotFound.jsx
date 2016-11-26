import React from 'react'

import {Grid, Row, Col} from 'react-bootstrap'
export const NotFound  = (props) => {
   console.log('render', 'pages/NotFound', window.location.hash)

   let
      {sidebar, useGrid} = props,
      MaybeGrid = useGrid ? Grid : ({children}) => <div>{children}</div>

   return (
      <MaybeGrid>
         <Row>
            {sidebar && <Col xs={4}>{sidebar}</Col>}
            <Col xs={sidebar ? 8 : 12} className="text-center">
               <h1>File not found [404]</h1>

               <p className="lead">
                  The application could not find file you requested.
               </p>

               <p>
                  If you copied the link from somewhere there might be some parts missing,
                  or the feature may have been removed.
               </p>

               <p>
                  If you think there should be something here, feel free to contact us through
                  <a href="#/support">the support form</a>
               </p>
            </Col>
         </Row>
      </MaybeGrid>
   )}
