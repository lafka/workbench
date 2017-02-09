import React from 'react'
import Mixin from 'react-mixin'
import {LensedStateDefaultMixin} from '../../../mixin'

import {LinkContainer} from 'react-router-bootstrap'
import {Row, Col, PageHeader} from 'react-bootstrap'
import {Nav, NavItem} from 'react-bootstrap'
import {Glyphicon, Label, Input, FormControls, Button} from 'react-bootstrap'
import {FormattedRelative, FormattedDate} from 'react-intl'

import {LinkUtil} from '../../../util'
import {DeviceService} from '../../../stores'
import {AddressEncoder, Loading, Notify, Terminal} from '../../../ui'

import {SerialConsole} from './SerialConsole.jsx'

export class Overview extends React.Component {
  constructor() {
    super()

    this._notify = null
    this.state = {
      patch: {},
    }
  }

  componentWillMount() {
    this._notify = new Notify.Store()
  }

  componentWillUnmount() {
    this._notify = null
  }

  updateDevice(ev) {
    DeviceService.update(this.props.params.nid, this.props.params.key, this.state.patch)
      .then(
        (resp) => {
          this.setState({patch: {}})
          this._notify.add(
            <span> <Glyphicon glyph="ok" /> Device was updated!  </span>,
            'success',
            {expire: 7500}
          )
        })
      .catch(
        (resp) => {
          let msg
          if (_.isError(resp)) {
            msg = resp.message
            console.log(resp.stack)
          } else
            msg = _.isObject(resp.data) ? (resp.data || {}).error : resp.data

          this._notify.add(
            <span> <Glyphicon glyph="warning-sign">&nbsp;</Glyphicon> Failed to update device: {msg}</span>,
            'danger',
            {clearOut: true}
          )
        })
  }

  handleSelect(key) {
  }

  render() {
    let
      patch = this.state.patch,
      device = this.props.device,
      network = this.props.network

    return (
      <Loading loading={!network || !device}>
        {(network && device) &&
          <div>
          <form onSubmit={this.updateDevice.bind(this)}>
          <Notify store={this._notify} />

          <Row className="overview section main">
            <Col xs={12}>

              <div className="meta pull-right">
                <span className="created">
                  <span className="name">Created:</span>&nbsp;
                  <span className="item updated" title={device.meta.created}>
                    <FormattedRelative value={device.meta.created} />
                  </span>
                </span>
                <br />

                <span className="last-update">
                  <span className="name">Updated:</span>&nbsp;
                  <span className="item updated" title={device.meta.updated}>
                    <FormattedRelative value={device.meta.updated} />
                  </span>
                </span>
              </div>

              <h2>{device.name || "Unnamed Device"}</h2>
              <hr />
            </Col>

            <Col xs={12} md={6} lg={5}>
              <Input
                type="text"
                valueLink={this.linkState('patch.name', device.name)}
                label="Device Name"
                />

              <Input
                type="text"
                value={AddressEncoder.encode(device.address)}
                label="Unique ID (UID)"
                disabled
                />
            </Col>

            <Col xs={12} md={6} lg={5}>
              <Col xs={6}>
                <Input
                  type="select"
                  label="Device State"
                  valueLink={this.linkState('patch.provisioned', device.provisioned)}
                  placeholder="select">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="passive">Passive</option>
                </Input>
              </Col>

              <Col xs={6}>
                <Input
                  type="select"
                  label="Device Type"
                  valueLink={this.linkState('patch.type', device.type)}
                  placeholder="select">
                  {network.types.map( (val, k) =>
                    <option key={k} value={val}>{val}</option>
                  )}
                </Input>
              </Col>
            </Col>

            <Col xs={12} md={6} lg={5}>
              <FormControls.Static
                label="Location">

                {(device.location || []).length > 0 && device.location.map( (comp) =>
                  <Label>{comp}</Label>
                ) || <Label>No location data available</Label>}
              </FormControls.Static>
            </Col>
          </Row>
          <Row
            style={{background: 'white', borderTop: '1px solid #ccc'}}
            className={"static bottom " + (0 === _.size(patch) ? 'collapse' : '')}
            >
            <Col xs={12}>
              <Button type="submit" bsStyle="primary">Update device</Button>
              <Button type="reset" bsStyle="link">Reset</Button>
            </Col>

          </Row>
        </form>
        </div> || "Loading device"}


      </Loading>
    )
  }
}

Mixin(Overview.prototype, LensedStateDefaultMixin)