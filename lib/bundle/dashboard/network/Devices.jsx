import React from 'react'
import ReactDOM from 'react-dom'
import {FormattedRelative} from 'react-intl'
import {Row, Col, Button, Glyphicon, Checkbox} from 'react-bootstrap'
import _ from 'lodash'
import Select from 'react-select'

import {Table, Column, Cell} from 'fixed-data-table'

import {NetworkStorage} from '../../../storage'
import {DevicesStorage, DeviceStorage} from '../../../storage'
import {LayoutStore} from '../../../stores'

export const DeviceManagement = ({params, ...props}) =>
   <div>
      <DevicesStorage nid={params.nid}>
         <DeviceTable params={params} {...props} />
      </DevicesStorage>
   </div>

const encAddr = (addr) => [(addr >> 24) & 255, (addr >> 16) & 255, (addr >> 8) & 255, addr & 255].join(' . ')
const LinkCell = ({rowIndex, link, field, data, transform, ...props}) =>
   <Cell {...props}>
      <a href={_.isFunction(link) ? link({rowIndex, link, field, data, ...props}) : link}>
         {transform ? transform(_.get(data[rowIndex], field)) : _.get(data[rowIndex], field)}
      </a>
   </Cell>

const ToggleFacetCell = ({data, rowIndex, field, onFacetChange, ...props}) =>
   <Cell {...props}>
      <a onClick={() => onFacetChange(field, _.get(data[rowIndex], field), null)}>
         {_.get(data[rowIndex], field)}
      </a>
   </Cell>

const DateTimeCell = ({data, rowIndex, field, ...props}) => <Cell {...props}><FormattedRelative value={_.get(data[rowIndex], field)} /></Cell>
const ChanConnectedCell = ({data, rowIndex, field, ...props}) => <Cell {...props}>{_.get(data[rowIndex], field)}</Cell>

const link = ({field, data, rowIndex}) => `#/dashboard/device/${data[rowIndex].network}/${data[rowIndex].key}`
const netLink = ({field, data, rowIndex}) => `#/dashboard/network/${data[rowIndex].network}`
const msgLink = ({field, data, rowIndex}) => `#/dashboard/message/${data[rowIndex].network}/${data[rowIndex].meta}`

const def = [
]

const SortTypes = {
   ASC:  'ASC',
   DESC: 'DESC'
}

const reverseSort = (sortDir) => SortTypes.ASC === sortDir ? SortTypes.DESC : SortTypes.ASC

const SortableHeaderCell = ({sortDir, field, onToggle, onChange, children, ...props}) =>
   <Cell {...props}>
      <a onClick={() => onChange(field, sortDir ? reverseSort(sortDir) : SortTypes.DESC)}>
         {children} {sortDir ? (sortDir === SortTypes.DESC ? '↓' : '↑') : ''}
      </a>

      <a className="pull-right" onClick={() => onToggle(field)}>
         <Glyphicon glyph="remove" />
      </a>
   </Cell>

class DeviceTable extends React.Component {
   constructor(props) {
      super()
      this.state = {
         sortedData: props.devices,
         colSortDirs: {},
         lastSort: null,
         facets: {},
         computedFacets: {},
         columns: [
            { field: 'key',                    name: 'Key',                cell:  <LinkCell />,          visible: true,  link },
            { field: 'name',                   name: 'Name',               cell:  <LinkCell />,          visible: true,  link },
            { field: 'address',                name: 'address',            cell:  <LinkCell transform={encAddr} />, visible: true, link },
            { field: 'network',                name: 'Network',            cell:  <LinkCell />,          visible: false, link: netLink },
            { field: 'type',                   name: 'Device Type',        cell:  <ToggleFacetCell />,   visible: true,  link },
            { field: 'proto/tm.firmware',      name: 'FW Revision',        cell:  <ToggleFacetCell />,   visible: false,  link },
            { field: 'proto/tm.hardware',      name: 'HW Revision',        cell:  <ToggleFacetCell />,   visible: false,  link },
            { field: 'proto/tm.part',          name: 'Part #',             cell:  <ToggleFacetCell />,   visible: false,  link },
            { field: 'meta.chan/connected',    name: 'Last Connection',    cell:  <DateTimeCell />,      visible: false, link },
            { field: 'meta.chan/disconnected', name: 'Last Disconnect',    cell:  <DateTimeCell />,      visible: false, link },
            { field: '*/alive?',               name: 'Connection Alive',   cell:  <ChanConnectedCell />, visible: false, link },
            { field: 'meta.created',           name: 'Created',            cell:  <DateTimeCell />,      visible: false, link },
            { field: 'meta.updated',           name: 'Updated',            cell:  <DateTimeCell />,      visible: false, link },
            { field: 'meta.event/date',        name: 'Time of Last Event', cell:  <DateTimeCell />,      visible: true,  link },
            { field: 'meta.event/key',         name: 'Last Event',         cell:  <LinkCell />,          visible: false, link: msgLink },
            { field: 'provisioned',            name: 'Provisioned',        cell:  <ToggleFacetCell />,   visible: false, link },
         ],
         showColumnsOverview: false,
         dimensions: {width: -1, height: -1}
      }

      this._onSortChange = this._onSortChange.bind(this)
      this._onFacetChange = this._onFacetChange.bind(this)
      this._onUpdateFacets = this._onUpdateFacets.bind(this)
      this._onToggleColumn = this._onToggleColumn.bind(this)
      this.toggleColumnsOverview = this.toggleColumnsOverview.bind(this)
   }

   componentWillMount() {
      this._mounted = true

      const colMapper = function(col) {
         let key = 'dash-col-visible#' + col.field

         console.log('key', key, localStorage[key], col.visible)

         if (undefined !== localStorage[key])
            col.visible = 'true' === localStorage[key]

         return col
      }

      this.setState( ({columns, ...oldState}) => _.set(oldState, 'columns', _.map(columns, colMapper)) )

      LayoutStore.addChangeListener( this._layoutListener = () => {
         let dom = ReactDOM.findDOMNode(this.mainCol)

         dom && this._mounted && this.setState({dimensions: {width: dom.clientWidth, height: dom.clientHeight}})
      })
   }

   componentDidMount() {
      this._layoutListener && this._layoutListener()
   }


   componentWillUnmount() {
      this._mounted = false

      LayoutStore.removeChangeListener(this._layoutListener)
   }

   componentWillReceiveProps(nextProps) {
      if (!_.eq(nextProps.devices, this.props.devices)) {
         this._onSortChange(this.state.lastSort, this.state.colSortDirs[this.state.lastSort], nextProps)
      }

      this._recomputeFacets()
   }

   _recomputeFacets() {
      let
         {devices} = this.props,
         {computedFacets} = this.state

      if (!computedFacets['proto/tm.firmware'])
         computedFacets['proto/tm.firmware'] = []


      if (!computedFacets['proto/tm.hardware'])
         computedFacets['proto/tm.hardware'] = []

      if (!computedFacets['proto/tm.part'])
         computedFacets['proto/tm.part'] = []

      _.each(devices, (dev) => {
         if (dev['proto/tm'].firmware)
            computedFacets['proto/tm.firmware'] = _.uniq(computedFacets['proto/tm.firmware'].concat(dev['proto/tm'].firmware))

         if (dev['proto/tm'].hardware)
            computedFacets['proto/tm.hardware'] = _.uniq(computedFacets['proto/tm.hardware'].concat(dev['proto/tm'].hardware))

         if (dev['proto/tm'].part)
            computedFacets['proto/tm.part'] = _.uniq(computedFacets['proto/tm.part'].concat(dev['proto/tm'].part))
      })

      this.setState({computedFacets})
   }

   _onFacetChange(field, value, props) {
      let
         devices = props ? props.devices : this.props.devices,
         {facets, lastSort, colSortDirs} = this.state,
         sortDir = colSortDirs[lastSort]

      if (!facets[field])
         facets[field] = []


      // either remove the new facet value or add it depending on existance
      if (_.contains(facets[field], value))
         facets[field] = _.without(facets[field], value)
      else
         facets[field] = facets[field].concat(value)

      function applyFilter(obj, val, key) {
         // use weak comparison to allow 1.45 == "1.45" -> true
         return val.length === 0 || _.some(val, (v) => v == _.get(obj, key))
      }

      this.setState({
         facets: facets,
         sortedData: this.sortData(_.filter(devices, (obj) => _.every(facets, (v, k) => applyFilter(obj, v, k))),
                                   lastSort,
                                   sortDir)
      })
   }

   _onUpdateFacets(field, values) {
      let
         {devices} = this.props,
         {facets, lastSort, colSortDirs} = this.state,
         sortDir = colSortDirs[lastSort]

      facets[field] = values

      function applyFilter(obj, val, key) {
         // use weak comparison to allow 1.45 == "1.45" -> true
         return val.length === 0 || _.some(val, (v) => v == _.get(obj, key))
      }


      this.setState({
         facets: facets,
         sortedData: this.sortData(_.filter(devices, (obj) => _.every(facets, (v, k) => applyFilter(obj, v, k))),
                                   lastSort,
                                   sortDir)
      })
   }

   sortData(data, field, sortDir) {
      data.sort( (idx_a, idx_b) => {
         let
            a = _.get(idx_a, field),
            b = _.get(idx_b, field),
            sortVal = 0

         if (a > b)
            sortVal = 1

         if (a < b)
            sortVal = -1

         if (sortVal !== 0 && sortDir === SortTypes.ASC)
            sortVal = sortVal * -1

         return sortVal
      })

      return data
   }

   _onSortChange(field, sortDir, props) {
      let
         devices = props ? props.devices : this.props.devices,
         {facets} = this.state

      let colSortDirs = this.state.colSortDirs
      colSortDirs[field] = sortDir

      function applyFilter(obj, val, key) {
         // use weak comparison to allow 1.45 == "1.45" -> true
         return val.length === 0 || _.some(val, (v) => v == _.get(obj, key))
      }

      this.setState({
         sortedData: this.sortData(_.filter(devices, (obj) => _.every(facets, (v, k) => applyFilter(obj, v, k))),
                                   field,
                                   sortDir),
         colSortDirs: colSortDirs,
         lastSort: field
      })
   }

   _onToggleColumn(field) {
      this.setState((oldState) => {
         let idx = _.findIndex(oldState.columns, {field: field})

         if (-1 === idx)
            return oldState

         localStorage['dash-col-visible#' + field] = oldState.columns[idx].visible = !oldState.columns[idx].visible
         return oldState
      })
   }

   toggleColumnsOverview() {
      this.setState({showColumnsOverview: !this.state.showColumnsOverview})
   }

   render() {
      let
         {params} = this.props,
         {columns, sortedData, colSortDirs, computedFacets, facets, dimensions} = this.state,
         {width} = dimensions

      return (
         <Row>
            <Col xs={4}>
               <DevicesStorage nid={params.nid}>
                  <Sidebar
                           computedFacets={computedFacets}
                           facets={facets}
                           updateFacets={this._onUpdateFacets}
                           {...this.props} />
               </DevicesStorage>
            </Col>

            <Col xs={8} ref={(e1) => this.mainCol = e1}>

               <div style={{position: 'relative', paddingBottom: '3rem'}}>
                  <a
                     className="pull-right"
                     style={{padding: '0rem 1rem'}}
                     onClick={this.toggleColumnsOverview}>

                     <Glyphicon glyph="plus" /> Column settings
                  </a>

                  <div style={{position: 'absolute',
                               display: this.state.showColumnsOverview ? 'block' : 'none',
                               top: 25,
                               right: 5,
                               width: '80%',
                               background: '#fff',
                               border: '1px solid #ccc',
                               padding: 25,
                               zIndex: 99}}>

                     <div style={{borderBottom: '1px solid #eee', paddingBottom: 9, marginBottom: 20}}>
                        <h4>Columns</h4>
                     </div>

                     <Row style={{clear: 'both'}}>
                        {_.map(columns, (col, idx) =>
                           <Col key={idx} xs={4}>
                              <Checkbox
                                 key={col.name}
                                 checked={col.visible}
                                 onChange={() => this._onToggleColumn(col.field)}
                                 >
                                 {col.name || col.field}
                              </Checkbox>
                           </Col>
                        )}

                        <a
                           onClick={this.toggleColumnsOverview}
                           className="pull-right"
                           style={{margin: '1rem 1rem 0 0'}}>Close Columns Overview</a>
                     </Row>
                  </div>
               </div>

               <Table
                  rowsCount={_.size(sortedData)}
                  rowHeight={30}
                  headerHeight={30}
                  width={width ? width - 30 : 700}
                  height={Math.max(100, 32 + _.size(sortedData) * 30)}>

                  {_.map(columns, (item, idx) =>
                     item.visible && <Column
                        key={idx}
                        header={item.header || <SortableHeaderCell onChange={this._onSortChange}
                                                                   field={item.field}
                                                                   onToggle={this._onToggleColumn}
                                                                   sortDir={colSortDirs[item.field]}>
                                                   {item.name}
                                               </SortableHeaderCell>}
                        cell={(props) => React.cloneElement(item.cell, {data: sortedData,
                                                                        onFacetChange: this._onFacetChange,
                                                                        ...props,
                                                                        ...item})}
                        flexGrow={1}
                        width={item.width || 50} />)}

               </Table>
            </Col>
         </Row>
      )
   }
}

const mapTypes = (net, param) => _.map((net || {})[param] || [], (t) => ({label: t, value: t}))
const provisioning = [{label: 'Active', value: 'active'},
                      {label: 'Inactive', value: 'inactive'},
                      {label: 'Passive', value: 'passive'}]
const toOptions = values => _.isArray(values) ? _.map(values, (v) => ({label: v, value: v})) : []

const Sidebar = ({network, devices, facets, computedFacets, updateFacets}) => {

   return (<div>
      <h5>Filter by device type</h5>
      <Select
         multi
         simpleValue
         placeholder="Filter by device type"
         value={(facets.type || []).join(',')}
         onChange={(values) => updateFacets('type', _.filter(values.split(',')))}
         options={mapTypes(network, 'types')} />

      <hr />

      <h5>Filter by provisioning</h5>
      <Select
         multi
         simpleValue
         placeholder="Filter by provisioning"
         value={(facets.provisioned || []).join(',')}
         onChange={(values) => updateFacets('provisioned', _.filter(values.split(',')))}
         options={provisioning} />

      <hr />

      <h5>Filter by firmware revision</h5>
      <Select
         multi
         simpleValue
         placeholder="Filter by Firmware"
         value={(facets['proto/tm.firmware'] || []).join(',')}
         onChange={(values) => updateFacets('proto/tm.firmware', _.filter(values.split(',')))}
         options={toOptions(computedFacets['proto/tm.firmware'])} />

      <hr />

      <h5>Filter by hardware version</h5>
      <Select
         multi
         simpleValue
         placeholder="Filter by Hardware"
         value={(facets['proto/tm.hardware'] || []).join(',')}
         onChange={(values) => updateFacets('proto/tm.hardware', _.filter(values.split(',')))}
         options={toOptions(computedFacets['proto/tm.hardware'])} />

      <hr />

      <h5>Filter by Part #</h5>
      <Select
         multi
         simpleValue
         placeholder="Filter by Part #"
         value={(facets['proto/tm.part'] || []).join(',')}
         onChange={(values) => updateFacets('proto/tm.part', _.filter(values.split(',')))}
         options={toOptions(computedFacets['proto/tm.part'])} />

      <hr />
   </div>)}

DeviceManagement.sidebar = true //({params, ...props}) =>
//   <DevicesStorage nid={params.nid}>
//      <Sidebar params={params} {...props} />
//   </DevicesStorage>
