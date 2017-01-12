import React from 'react'
import _ from 'lodash'
import ReactDOM from 'react-dom'
import {ButtonToolbar, ButtonGroup, Button, Glyphicon} from 'react-bootstrap'
import {Row, Col, Checkbox} from 'react-bootstrap'
import {FormattedRelative} from 'react-intl'

import table from 'fixed-data-table'
const {Table, Column, Cell} = table

import {LayoutStore} from '../../../../stores'

const SortTypes = {
   ASC: 'ASC',
   DESC: 'DESC'
}

const reverseSort = (sortDir) => SortTypes.ASC === sortDir ? SortTypes.DESC : SortTypes.ASC


const SortableHeaderCell = ({sortDir, field, onToggle, onChange, children, ...props}) =>
   <Cell {...props}>
      <a onClick={() => onChange(field, sortDir ? reverseSort(sortDir) : SortTypes.DESC)}>
         {children} {sortDir && (sortDir === SortTypes.DESC ? '↓' : '↑')}
      </a>

      <a className="pull-right" onClick={() => onToggle(field)}>
         <Glyphicon glyph="remove" />
      </a>
   </Cell>

SortableHeaderCell.propTypes = {
   sortDir: React.PropTypes.oneOf([_.values(SortTypes)]),
   field: React.PropTypes.string.isRequired,
   onToggle: React.PropTypes.func.isRequired,
   onChange: React.PropTypes.func.isRequired,
   children: React.PropTypes.node.isRequired
}


const ToggleFacetCell = ({data, rowIndex, field, onFacetChange, ...props}) =>
   <Cell {...props}>
      <a onClick={() => onFacetChange(field, _.get(data[rowIndex], field), null)}>
         {_.get(data[rowIndex], field)}
      </a>
   </Cell>

ToggleFacetCell.propTypes = {
   data: React.PropTypes.array.isRequired,
   rowIndex: React.PropTypes.number.isRequired,
   field: React.PropTypes.string.isRequired,
   onFacetChange: React.PropTypes.func.isRequired
}

const DateTimeCell = ({data, rowIndex, field, ...props}) => {
   let val = _.get(data[rowIndex], field)
   if (val)
      return <Cell {...props}><FormattedRelative value={val} /></Cell>
   else
      return <Cell {...props}>Never</Cell>
}

DateTimeCell.propTypes = {
   data: React.PropTypes.array.isRequired,
   rowIndex: React.PropTypes.number.isRequired,
   field: React.PropTypes.string.isRequired
}

const ChanConnectedCell = ({data, rowIndex, onFacetChange, ...props}) => {
   let meta = data[rowIndex].meta || {}
   if (!meta['chan/connected'])
      return (
         <Cell {...props}>
            <a onClick={() => onFacetChange('*/alive?', 'never', null)}>Never</a>
         </Cell>)

   if (meta['chan/disconnected'] >= meta['chan/connected'])
      return (
         <Cell {...props}>
            <a onClick={() => onFacetChange('*/alive?', 'dead', null)}>Dead</a>
         </Cell>)

   if (meta['chan/disconnected'] < meta['chan/connected'])
      return (
         <Cell {...props}>
            <a onClick={() => onFacetChange('*/alive?', 'alive', null)}>Alive</a>
         </Cell>)

   return <span>unknown</span>
}

ChanConnectedCell.propTypes = {
   data: React.PropTypes.array.isRequired,
   rowIndex: React.PropTypes.number.isRequired,
   field: React.PropTypes.string.isRequired,
   onFacetChange: React.PropTypes.func.isRequired
}

const LinkCell = ({rowIndex, link, field, data, transform, ...props}) =>
   <Cell {...props}>
      <a href={_.isFunction(link) ? link({rowIndex, link, field, data, ...props}) : link}>
         {transform ? transform(_.get(data[rowIndex], field)) : _.get(data[rowIndex], field)}
      </a>
   </Cell>

LinkCell.propTypes = {
   data: React.PropTypes.array.isRequired,
   rowIndex: React.PropTypes.number.isRequired,
   field: React.PropTypes.string.isRequired,
   link: React.PropTypes.oneOfType([React.PropTypes.func, React.PropTypes.string]).isRequired,
   transform: React.PropTypes.func
}

const encAddr = (addr) => [
   (addr >> 24) & 255,
   (addr >> 16) & 255,
   (addr >> 8) & 255,
   (addr >> 0) & 255].join(' . ')

const link = ({data, rowIndex}) =>
   `#/dashboard/device/${data[rowIndex].network}/${data[rowIndex].key}`

const netLink = ({data, rowIndex}) =>
   `#/dashboard/network/${data[rowIndex].network}`

const msgLink = ({data, rowIndex}) =>
   `#/dashboard/message/${data[rowIndex].network}/${data[rowIndex].meta}`


export class DeviceTable extends React.Component {
   static get propTypes() {
      return {
         onFacetChange: React.PropTypes.func.isRequired,
         buttons: React.PropTypes.node,
         devices: React.PropTypes.array
      }
   }

   constructor(props) {
      super(props)

      this.state = {
         sortedData: props.devices,
         colSortDirs: {},
         lastSort: null,
         columns: [
            {
               field: 'key',
               name: 'Key',
               cell: LinkCell,
               visible: true,
               link
            },

            {
               field: 'name',
               name: 'Name',
               cell: LinkCell,
               visible: true,
               link
            },

            {
               field: 'address',
               name: 'address',
               cell: LinkCell,
               transform: encAddr,
               visible: true,
               link
            },

            {
               field: 'network',
               name: 'Network',
               cell: LinkCell,
               visible: false,
               link: netLink
            },

            {
               field: 'type',
               name: 'Device Type',
               cell: ToggleFacetCell,
               visible: true,
               link
            },

            {
               field: 'proto/tm.firmware',
               name: 'FW Revision',
               cell: ToggleFacetCell,
               visible: false,
               link
            },

            {
               field: 'proto/tm.hardware',
               name: 'HW Revision',
               cell: ToggleFacetCell,
               visible: false,
               link
            },

            {
               field: 'proto/tm.part',
               name: 'Part #',
               cell: ToggleFacetCell,
               visible: false,
               link
            },

            {
               field: 'meta.chan/connected',
               name: 'Last Connection',
               cell: DateTimeCell,
               visible: false,
               link
            },

            {
               field: 'meta.chan/disconnected',
               name: 'Last Disconnect',
               cell: DateTimeCell,
               visible: false,
               link
            },

            {
               field: '*/alive?',
               name: 'Connection Alive',
               cell: ChanConnectedCell,
               visible: false,
               link
            },

            {
               field: 'meta.created',
               name: 'Created',
               cell: DateTimeCell,
               visible: false,
               link
            },

            {
               field: 'meta.updated',
               name: 'Updated',
               cell: DateTimeCell,
               visible: false,
               link
            },

            {
               field: 'meta.event/date',
               name: 'Time of Last Event',
               cell: DateTimeCell,
               visible: true,
               link
            },

            {
               field: 'meta.event/key',
               name: 'Last Event',
               cell: LinkCell,
               visible: false,
               link: msgLink
            },

            {
               field: 'provisioned',
               name: 'Provisioned',
               cell: ToggleFacetCell,
               visible: false,
               link
            }
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

      this.setState(
         ({columns, ...oldState}) => _.set(oldState, 'columns', _.map(columns, colMapper)))

      LayoutStore.addChangeListener(this._layoutListener = () => {
         let dom = ReactDOM.findDOMNode(this.mainCol)

         if (this._mounted && dom)
            this.setState({dimensions: {width: dom.clientWidth, height: dom.clientHeight}})
      })
   }

   componentDidMount() {
      if (this._layoutListener)
         this._layoutListener()
   }

   componentWillReceiveProps(nextProps) {
      const {lastSort, colSortDirs} = this.state

      if (!_.eq(nextProps.devices, this.props.devices))
         this._onSortChange(lastSort, colSortDirs[lastSort], nextProps)
   }

   componentWillUnmount() {
      this._mounted = false

      LayoutStore.removeChangeListener(this._layoutListener)
   }

   sortData(data, field, sortDir) {
      data.sort((idx_a, idx_b) => {
         let
            a = _.get(idx_a, field),
            b = _.get(idx_b, field),
            sortVal = 0

         if (a > b)
            sortVal = 1

         if (a < b)
            sortVal = -1

         if (0 !== sortVal && sortDir === SortTypes.ASC)
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
         return 0 === val.length || _.some(val, (v) => v === _.get(obj, key))
      }

      let filtered = _.filter(devices, (obj) => _.every(facets, (v, k) => applyFilter(obj, v, k)))
      this.setState({
         sortedData: this.sortData(filtered,
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

         oldState.columns[idx].visible = !oldState.columns[idx].visible
         localStorage['dash-col-visible#' + field] = oldState.columns[idx].visible
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

      return (
         <div ref={(e1) => (this.mainCol = e1)}>
            <ButtonToolbar className="pull-right">
               <ButtonGroup>
                  <Button onClick={this.toggleColumnsOverview}>Show Column Settings</Button>
               </ButtonGroup>

               {buttons && buttons}
            </ButtonToolbar>

            <div
               style={{
                  position: 'absolute',
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
                     cell={(props) =>
                        <item.cell data={sortedData}
                              onFacetChange={onFacetChange}
                              {...props}
                              {...item} />
                        }
                     flexGrow={1}
                     width={item.width || 50} />)}

            </Table>
         </div>)
   }
}
