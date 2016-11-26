import React from 'react'
import {Row, Col, Button, Glyphicon, Checkbox} from 'react-bootstrap'
import _ from 'lodash'
import Select from 'react-select'

import {Table, Column, Cell} from 'fixed-data-table'

import {NetworkStorage} from '../../../../storage'
import {DevicesStorage, DeviceStorage} from '../../../../storage'

import {DeviceMap} from './DeviceMap.jsx'
import {DeviceTable} from './DeviceTable.jsx'

export class DeviceManagement extends React.Component {
   constructor(props) {
      super()

      let facets = (props.location.query.facets || "")
      facets = _.reduce(facets.replace(/;$/, '').split(';'),
                        function(acc, v) {
                           let [k, ...val] = v.split(/[:,]/);

                           if (val.length === 1 && "" === val[0])
                              return acc

                           acc[k] = val;
                           return acc
                        },
                        {})

      this.state = {
         facets: facets,
         computedFacets: {},
      }

      this._onFacetChange = this._onFacetChange.bind(this)
      this._onUpdateFacets = this._onUpdateFacets.bind(this)
      this._deviceFilter = this._deviceFilter.bind(this)
      this._recomputeFacets = this._recomputeFacets.bind(this)
   }

   _recomputeFacets(devices) {
      let {computedFacets} = this.state

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
         {router, location} = this.props,
         devices = props ? props.devices : this.props.devices,
         {facets} = this.state

      if (!facets[field])
         facets[field] = []


      // either remove the new facet value or add it depending on existance
      if (_.contains(facets[field], value))
         facets[field] = _.without(facets[field], value)
      else
         facets[field] = facets[field].concat(value)

      // use weak comparison to allow 1.45 == "1.45" -> true
      const applyFilter = (obj, val, key) =>
         (val.length === 0 || _.some(val, (v) => v == _.get(obj, key)))

      let url = _.reduce(facets, (acc, v, k) => acc + k + '=' + v.join(',') + ';', '')
      this.setState({facets}, () => router.push({...location, query: {facets: url}}))
   }

   _onUpdateFacets(...rest) {
      let
         {devices, router, location} = this.props,
         {facets} = this.state

      facets = _.reduce( _.chunk(rest, 2), (acc, [k, v]) => { acc[k] = v; return acc }, {})


      let url = _.reduce(facets, (acc, v, k) => acc + k + ':' + v.join(',') + ';', '')
      this.setState({facets}, () => router.push({...location, query: {facets: url}}))
   }

   _deviceFilter(device) {
      let {facets} = this.state

      const applyFilter = (obj, val, key) => {
         if (!val)
            return false

         return val.length === 0 || _.some(val, (v) => v == _.get(obj, key))
      }

      return _.every(facets, (v, k) => applyFilter(device, v, k))
   }

   render() {
      let
         {params} = this.props,
         {computedFacets, facets} = this.state

      return (
         <Row>
            <Col xs={4}>
               <DevicesStorage
                  onChange={this._recomputeFacets}
                  nid={params.nid}>

                  <Sidebar
                           computedFacets={computedFacets}
                           facets={facets}
                           updateFacets={this._onUpdateFacets}
                           {...this.props} />
               </DevicesStorage>
            </Col>

            <Col xs={8}>
               <DevicesStorage
                  nid={params.nid}
                  filter={this._deviceFilter}>

                  <DeviceTable onFacetChange={this._onFacetChange} />
               </DevicesStorage>
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
   let
      pick = _.omit(facets, 'type', 'provisioned', 'proto/tm.firmware', 'proto/tm.hardware', 'proto/tm.part'),
      omitted = _.pick(facets, 'type', 'provisioned', 'proto/tm.firmware', 'proto/tm.hardware', 'proto/tm.part'),
      remainingValues = _.flatten(_.map(_.pairs(pick), ([a, b]) => _.map(b, (x) => a + " == " + x))),
      rest = (field) => _.flatten(_.pairs(_.omit(facets, field)))

   return (<div>
      <h5>Filter by device type</h5>
      <Select
         multi
         simpleValue
         placeholder="Filter by device type"
         value={(facets.type || []).join(',')}
         onChange={(values) => updateFacets.apply(this, ['type', _.filter(values.split(','))].concat(rest('type')))}
         options={mapTypes(network, 'types')} />

      <hr />

      <h5>Filter by provisioning</h5>
      <Select
         multi
         simpleValue
         placeholder="Filter by provisioning"
         value={(facets.provisioned || []).join(',')}
         onChange={(values) => updateFacets.apply(this, ['provisioned', _.filter(values.split(','))].concat(rest('provisioned')))}
         options={provisioning} />

      <hr />

      <h5>Filter by firmware revision</h5>
      <Select
         multi
         simpleValue
         placeholder="Filter by Firmware"
         value={(facets['proto/tm.firmware'] || []).join(',')}
         onChange={(values) => updateFacets.apply(this, ['proto/tm.firmware', _.filter(values.split(','))].concat(rest('proto/tm.firmware')))}
         options={toOptions(computedFacets['proto/tm.firmware'])} />

      <hr />

      <h5>Filter by hardware version</h5>
      <Select
         multi
         simpleValue
         placeholder="Filter by Hardware"
         value={(facets['proto/tm.hardware'] || []).join(',')}
         onChange={(values) => updateFacets.apply(this, ['proto/tm.hardware', _.filter(values.split(','))].concat(rest('proto/tm.hardware')))}
         options={toOptions(computedFacets['proto/tm.hardware'])} />

      <hr />

      <h5>Filter by Part #</h5>
      <Select
         multi
         simpleValue
         placeholder="Filter by Part #"
         value={remainingValues.join(',')}
         onChange={(values) => updateFacets.apply(this, ['proto/tm.part', _.filter(values.split(','))].concat(rest('proto/tm.part')))}
         options={toOptions(computedFacets['proto/tm.part'])} />

      <hr />

      <h5>Custom filters</h5>
      <Select
         multi
         simpleValue
         placeholder="Filter by any field ie `name == My name`"
         value={remainingValues.join(',')}
         loadOptions={ (input, callback) => callback(null, filterInput(devices, input)) }
         options={ filterInput(devices, "").options }
         onChange={ (values) => updateFacets.apply(this, facetValues(values, omitted)) }
         />
   </div>)}


const RandomRender = (props) => <pre>{JSON.stringify(props, null, 4)}</pre>

const filterInput = function(devices, input) {
   let [k, v] = (input.match(/^([^=]*)\s?={1,2}\s?(.*)$/) || []).slice(1)


   // if k && v, look for elements (devices <- k) == v
   // if only k, look for paths like k
   return {
      options:
         _.chain(paths(devices))
            //.filter( (path) => {
            //   let pattern = input
            //                  .replace(/\s/, '')
            //                  .split("")
            //                  .reduce((a, b)  => a + '[^' + b +']*' + b)

            //   return new RegExp(pattern).test(path.replace(/^\[0-9]*\]$/))
            //})
            .map( function(path) {
               return {
                  label: path.replace(/^[\[\]0-9.]*/, '') + " == " + _.get(devices, path),
                  value: path.replace(/^[\[\]0-9.]*/, '') + " == " + _.get(devices, path),
               }
            })
            .value(),
      complete: true
   }
}

let fuzzycache = _.memoize( (pattern) => new RegExp(pattern.split("").reduce((a, b)  => a + '[^' + b +']*' + b)) )
const fuzzym = (str, pattern) => fuzzycache(pattern).test(str)

_.flatMap = _.compose(_.flatten, _.map)

function paths(obj, parentKey) {
  let result;

  if (_.isArray(obj)) {
    var idx = 0;
    result = _.flatMap(obj, function (obj) {
      return paths(obj, (parentKey || '') + '[' + idx++ + ']');
    });
  }
  else if (_.isPlainObject(obj)) {
    result = _.flatMap(_.keys(obj), function (key) {
      return _.map(paths(obj[key], key), function (subkey) {
        return (parentKey ? parentKey + '.' : '') + subkey;
      });
    });
  }
  else {
    result = [];
  }
  return result.concat(parentKey || [])
}


const facetValues = (values, pick) =>
   _.chain(values.split(','))
      .filter()
      .map((e) => e.split(/\s?==\s?/))
      .reduce( function(acc, [k, v]) { k = k.replace(/\s/, ''); acc[k] = (acc[k] || []).concat(v); return acc }, {})
      .merge(pick || {})
      .pairs()
      .flatten()
      .value()

function newFacetOption({label, labelKey, valueKey}) {
   let option = {}

   option[valueKey] = label
   option[labelKey] = label
   option.className = "custom"

   return option
}

DeviceManagement.sidebar = true //({params, ...props}) =>
//   <DevicesStorage nid={params.nid}>
//      <Sidebar params={params} {...props} />
//   </DevicesStorage>
