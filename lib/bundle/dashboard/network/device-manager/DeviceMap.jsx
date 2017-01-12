// import React from 'react'
// import ReactDOM from 'react'
// import _ from 'lodash'
// import * as d3 from 'd3'
// import {ButtonToolbar, ButtonGroup, Button, Glyphicon} from 'react-bootstrap'
//
// import {ajax} from '../../../../nanoajax.js'
// import {QueryStorage} from '../../../../storage/Query'
// import {AuthStore} from '../../../../Auth'
// import Constants from '../../../../Constants'
//
// window.d3 = d3
//
// const getPath = (devices) => {
//    if (!devices || 0 === devices.length)
//       return
//
//    let
//       net = devices[0].network,
//       url = Constants.BASE_URL + '/_channels/io/' + net + '/@application'
//
//    _.each(devices, ({address, key, network}) => {
//       let body = JSON.stringify([{
//          'proto/tm': {
//             type: 'command',
//             command: 'get_path',
//             uid: address,
//             cmd_number: 1
//          }}])
//
//       let authorization = AuthStore.signV1('POST', url, body)
//
//       ajax({
//          url,
//          body,
//          method: 'POST',
//          headers: {
//             'Content-Type': 'application/json',
//             'Authorization': authorization
//          },
//          cors: false
//       }, (code, resp, req) => {
//          console.log(`req-path: ${network} / ${key}`)
//       })
//    })
// }
//
// let flip = (x) =>
//    ((x & 255) << 24) + (((x >> 8) & 255) << 16) + (((x >> 16) & 255) << 8) + ((x >> 24) & 255)
//
// var n = 0
// export class DeviceMap extends React.Component {
//    constructor(props) {
//       super(props)
//
//       this.state = {
//          links: {}
//       }
//
//       this._recvPath = this._recvPath.bind(this)
//    }
//
//    _recvPath(msg) {
//       if ('path' !== msg['proto/tm'].detail)
//          return
//
//       let link = msg['proto/tm'].path[ _.size(msg['proto/tm'].path) ]
//
//       let patch = {
//          source: link[1],
//          target: msg['proto/tm'].uid,
//          influence: link[0]
//       }
//
//       if (!this.state[ msg['proto/tm'].uid ])
//          this.setState( old => {
//             old.links[ msg['proto/tm'].uid ] = patch
//             return old
//          })
//    }
//
//    render() {
//       let
//          {buttons, messages, devices} = this.props,
//          nodes = _.map(devices, ({key, name, address, type}) => {
//             return {
//                address,
//                name: name || key,
//                group: 'gateway' === type ? 0 : 1,
//                force: 'gateway' === type ? 5 : 1,
//             }}),
//          links = _.values(this.state.links)
//
//       console.log('links', links)
//
//       return <div>
//          <span
//             style={{
//                lineHeight: '1.42857',
//                padding: '6px 12px',
//                display: 'inline-block',
//                color: '#ccc'}}>
//
//                New path request in 19s</span>
//          <ButtonToolbar className="pull-right">
//             <ButtonGroup>
//                <Button onClick={() => getPath(devices)}>Request path info</Button>
//             </ButtonGroup>
//
//             {buttons && buttons}
//          </ButtonToolbar>
//
//          <div>
//             <QueryStorage
//                resource="T"
//                dateFrom="NOW//-1HOUR"
//                continuous={true}
//                stateful={false}
//                onData={this._recvPath} />
//
//             <ForceGraph
//                width={768}
//                height={500}
//                data={{nodes, links}} />
//          </div>
//       </div>
//    }
// }
//
// export class ForceGraph extends React.Component {
//   componentDidUpdate(prevProps, b) {
//     let {nodes, links} = this.props.data;
//
//     if (_.isEqual(nodes, prevProps.data.nodes)
//         && _.isEqual(nodes, prevProps.data.nodes)
//         && width === prevProps.width
//         && height === prevProps.height)
//       return
//
//     console.log('lolololololo', 'update')
//
//     let {width, height} = this.props;
//     let forceLayout = d3.forceSimulation(nodes)
//       .force('charge', d3.forceManyBody())
//       .force('link', d3.forceLink(links)
//          .id( (n) => n.address )
//          .distance( (n) => (n || {})
//          .influence || 0))
//       .force('center', d3.forceCenter(width / 2, height / 2))
//
//     let
//       d3Svg = d3.select(this.ref),
//       d3Nodes = d3Svg.selectAll('.node').data(nodes),
//       d3Links = d3Svg.selectAll('.link').data(links)
//
//     let zoom = d3.zoom()
//                  .scaleExtent([1, 10])
//                  .on("zoom", () => console.log('zooooom', {x: this.ref}));
//
//
//     forceLayout.on("tick", () => {
//         d3Links
//          .attr('x1', (d) => d.source.x)
//          .attr('y1', (d) => d.source.y)
//          .attr('x2', (d) => d.target.x)
//          .attr('y2', (d) => d.target.y)
//
//         d3Nodes
//          .attr('cx', (d) => d.x)
//          .attr('cy', (d) => d.y)
//
//         d3Nodes.attr('transform', (d) => `translate(${d.x}, ${d.y})`);
//       });
//   }
//
//   render() {
//     let {nodes, links} = this.props.data;
//     let {width, height} = this.props;
//     let forceScale = d3.scaleLinear()
//                        .domain(d3.extent(nodes, (node) => { return node.force; }))
//                        .range([5, 20]);
//     let influenceScale = d3.scaleLinear()
//                            .domain(d3.extent(links, (link) => { return link.influence; }))
//                            .range([1, 2]);
//     return (
//       <svg
//          width={width}
//          height={500}
//          style={{background: '#fafafa', border: '1px solid #eee'}}
//          ref={(e1) => this.ref = e1}>
//         <g>
//           {links.map((link, i) => {
//             return (
//               <line key={i} className='link'
//                 style={{
//                   stroke:'#999',
//                   strokeWidth: influenceScale(link.influence)
//                 }}
//               />
//             );
//           })}
//           {nodes.map((node, i) => {
//             return (
//               <g key={i} className='node' width={100} height={50}>
//                 <circle
//                   r={forceScale(node.force)}
//                   fill={node.group ? 'steelblue' : 'red'}
//                 />
//                 <text>{node.name}</text>
//               </g>
//             );
//           })}
//         </g>
//       </svg>
//     );
//   }
// }

import React from 'react'

export const DeviceMap = ({}) => <h1>Not implemented...</h1>
