import React from 'react'
import _ from 'lodash'
import ReactDOM from 'react-dom'
import {ButtonToolbar, ButtonGroup, Button, Glyphicon} from 'react-bootstrap'
import {Row, Col, Checkbox} from 'react-bootstrap'
import {FormattedRelative} from 'react-intl'

import {Table, Column, Cell} from 'fixed-data-table'

import {LayoutStore} from '../../../../stores'

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


const ToggleFacetCell = ({data, rowIndex, field, onFacetChange, ...props}) =>
   <Cell {...props}>
      <a onClick={() => onFacetChange(field, _.get(data[rowIndex], field), null)}>
         {_.get(data[rowIndex], field)}
      </a>
   </Cell>

const DateTimeCell = ({data, rowIndex, field, ...props}) => <Cell {...props}><FormattedRelative value={_.get(data[rowIndex], field)} /></Cell>

const ChanConnectedCell = ({data, rowIndex, field, onFacetChange, ...props}) => {
   let meta = data[rowIndex].meta || {}
   if (!meta['chan/connected'])
      return <Cell {...props}><a onClick={() => onFacetChange('*/alive?', 'never', null)}>Never</a></Cell>

   if (meta['chan/disconnected'] >= meta['chan/connected'])
      return <Cell {...props}><a onClick={() => onFacetChange('*/alive?', 'dead', null)}>Dead</a></Cell>

   if (meta['chan/disconnected'] < meta['chan/connected'])
      return <Cell {...props}><a onClick={() => onFacetChange('*/alive?', 'alive', null)}>Alive</a></Cell>
}

const LinkCell = ({rowIndex, link, field, data, transform, ...props}) =>
   <Cell {...props}>
      <a href={_.isFunction(link) ? link({rowIndex, link, field, data, ...props}) : link}>
         {transform ? transform(_.get(data[rowIndex], field)) : _.get(data[rowIndex], field)}
      </a>
   </Cell>

const encAddr = (addr) => [(addr >> 24) & 255, (addr >> 16) & 255, (addr >> 8) & 255, addr & 255].join(' . ')

const link = ({field, data, rowIndex}) => `#/dashboard/device/${data[rowIndex].network}/${data[rowIndex].key}`
const netLink = ({field, data, rowIndex}) => `#/dashboard/network/${data[rowIndex].network}`
const msgLink = ({field, data, rowIndex}) => `#/dashboard/message/${data[rowIndex].network}/${data[rowIndex].meta}`


export class DeviceTable extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         sortedData: props.devices,
         colSortDirs: {},
         lastSort: null,
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
      this.toggleColumnsOverview = this.toggleColumnsOverview.bind(this)
      this._onToggleColumn = this._onToggleColumn.bind(this)
   }

   componentWillMount() {
      this._mounted = true

      const colMapper = function(col) {
         let key = 'dash-col-visible#' + col.field

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

   componentWillReceiveProps(nextProps) {
      if (!_.eq(nextProps.devices, this.props.devices))
         this._onSortChange(this.state.lastSort, this.state.colSortDirs[this.state.lastSort], nextProps)
   }

   componentWillUnmount() {
      this._mounted = false

      LayoutStore.removeChangeListener(this._layoutListener)
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
         {onFacetChange, buttons} = this.props,
         {sortedData, columns, colSortDirs, dimensions, showColumnsOverview} = this.state,
         {width} = dimensions

      console.log(buttons)
      return (
         <div ref={(e1) => this.mainCol = e1}>
            <ButtonToolbar className="pull-right">
               <ButtonGroup>
                  <Button onClick={this.toggleColumnsOverview}>Show Column Settings</Button>
               </ButtonGroup>

               {buttons && buttons}
            </ButtonToolbar>

            <div style={{position: 'absolute',
                         display: showColumnsOverview ? 'block' : 'none',
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
            <Table
               rowsCount={_.size(sortedData)}
               rowHeight={30}
               headerHeight={30}
               width={width ? width - 30 : 700}
               height={Math.max(100, 32 + Math.min(20, _.size(sortedData)) * 30)}>

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
                                                                     onFacetChange,
                                                                     ...props,
                                                                     ...item})}
                     flexGrow={1}
                     width={item.width || 50} />)}

            </Table>
         </div>)

   }
}
