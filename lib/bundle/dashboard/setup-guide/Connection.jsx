import React from 'react'
import {Row, Col} from 'react-bootstrap'
import Icon from 'antd/lib/icon'


import {AddressEncoder} from '../../../ui'

export const Connection = ({network}) => {
   const encodedNid = AddressEncoder.encode(network.address)
   return (
         <Row style={{marginTop: '3rem', position: 'relative'}}>
            <Col md={12}>
               <div className="page-header">
                  <h4>Connect Gateway</h4>
               </div>

               <Row>
                  <Col xs={9}>
                     <p>
                        The final step is to open communication from your Gateway Device
                        to the API. We will use GURI, a transparent Network Connector,
                        which will configure the Gateway for us.
                     </p>
                  </Col>
                  <Col xs={3} style={{padding: '15px 15'}}>
                     <a
                        href="https://release.tiny-mesh.com/"
                        target="new"
                        className="ant-btn ant-btn-primary ant-btn-lg">

                        <Icon type="download" /> Download GURI
                     </a>
                  </Col>
               </Row>

               <hr style={{margin: '1em 0 2em'}} />

               <pre style={{padding: '9.5px', margin: '0 0 10px', fontSize: '13px'}}>
                  <code>
{`
> guri-windows-amd64.exe --list`}
<span style={{color: 'grey'}}>
{`
path=COM0 usb?=false vid= pid= serial=
path=`}<b>COM3</b>{` usb?=true vid=0403 pid=6001 serial=A5042CXY
`}
</span>
{`
> guri-windows-amd64.exe --auto-configure --nid=${encodedNid}`} <b>COM3</b>
<span style={{color: 'grey'}}>
{`
guri - version 0.0.1-alpha
serial:open /dev/ttyUSB0
remote: using TCP w/TLS
upstream:recv[true] [10 0 0 0 0 0 3 16 0 0]
downstream:recv[true] [35 1 0 0 0 1 0 0 0 ... ]
upstream:recv[true] [6]
`}</span>
                  </code>
               </pre>

            </Col>
         </Row>
   )
}

Connection.propTypes = {
   network: React.PropTypes.object.isRequired
}

/*
<Col md={6}>
   <p style={{marginTop: '110px', marginBottom: '2rem'}}>
      Tinymesh Network uses a Network Connector to communicate
      between your physial Gateway Device and the Tinymesh Cloud.
   </p>
</Col>
*/
