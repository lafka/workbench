import React from 'react'
import {FormattedRelative} from 'react-intl'
import _ from 'lodash'

import {TokensStorage} from '../../storage/Token.jsx'

import {Spinkit} from '../../ui'
import {TokenService} from '../../Auth/Tokens'

import {PageHeader, Button} from 'react-bootstrap'
import {ListGroup, ListGroupItem, Row, Col} from 'react-bootstrap'
import {Modal, Glyphicon} from 'react-bootstrap'

import moment from 'moment'

const Fingerprint = ({fingerprint}) =>
   <span className="item fingerprint" title={'Fingerprint: ' + fingerprint}>
      <code>
         {7 < fingerprint.length ? fingerprint.slice(0, 7) + '..' : fingerprint}
      </code>
   </span>

Fingerprint.propTypes = {
   fingerprint: React.PropTypes.string.isRequired
}

const hasExpired = ({expires}) => (new Date()).toISOString() >= expires
const isRevoked = (token) => !!token.revoked

class Item extends React.Component {
   constructor() {
      super()

      this.state = {
         revocation: null
      }

      this.handleRevoke = this.handleRevoke.bind(this)
   }

   handleRevoke(ev) {
      const {token} = this.props

      ev.preventDefault()

      this.setState((state) => {
         if (state.revocation)
            return state

         let promise = TokenService.revoke(token.fingerprint, 'user')
            .then(() => TokenService.fetchTokens())

         promise
            .catch(() => this.setState({revocation: null}))
            .done(() => this.setState({revocation: null}))

         return _.set(state, 'revocation', promise)
      })
   }

   render() {
      const
         {revocation} = this.state,
         {token} = this.props

      return (
         <div className="token">
            <Fingerprint {...token} />

            <span className="item name" style={{display: 'inline'}}>
               <strong className="name">{token.name || 'Unnamed Token'}</strong>
            </span>

            <span className="item created" title={token.meta.created}>
               <span className="title">Created</span>
               <FormattedRelative value={token.meta.created} />
            </span>

            <span className="item used" title={token.meta.used}>
               <span className="title">Last used</span>
               {token.meta.used
                  ? <FormattedRelative value={token.meta.used} />
                  : 'never'}
            </span>

            {!hasExpired(token) &&
               <span className="created" title={token.expires}>
                  <span className="title">Expires</span>&nbsp;
                  <FormattedRelative value={token.expires} />
               </span>}

            {hasExpired(token) && !token.revoked &&
               <span className="created" title={token.expires}>
                  Expired <FormattedRelative value={token.expires} />
               </span>}

            {hasExpired(token) && token.revoked &&
               <span className="revoked" title={token.revoked.at}>
                  Revoked <FormattedRelative value={token.revoked.at} />&nbsp;
                  ({token.revoked.reason})
               </span>}

            <span className="actions">
               {(!hasExpired(token) && !isRevoked(token)) &&
                  <Button
                     onClick={this.handleRevoke}
                     disabled={null !== revocation}
                     className="pull-right btn-sm"
                     bsStyle="danger">

                     <Spinkit spin={null !== revocation} />
                     {null === revocation ? 'Revoke' : 'Revoking'}
                  </Button>}
            </span>
         </div>
      )
   }
}


Item.bsStyle = function({revoked, expires}) {
   const now = (new Date()).toISOString()

   // active token
   if (revoked)
      return 'danger'
   else if (now >= expires)
      return 'warning'
   else
      return undefined
}

Item.propTypes = {
   token: React.PropTypes.object.isRequired
}

import {Form, Input, Submit, Reset} from '../../forms'

class EnumInput extends React.Component {
   render() {
      const
         ctx = this.context,
         {onChange, patch} = ctx,
         {param, label, values} = this.props
      return (
         <div className="enum-input">
            <label>{label}</label>

            <div className="values">
               {_.map(values, (value, k) =>
                  <Button
                     key={k}
                     bsStyle={value === patch[param] ? 'info' : 'link'}
                     onClick={(ev) => onChange(ev, this.props, value)}>

                     {value}
                  </Button>
               )}
            </div>
         </div>
      )
   }
}

EnumInput.propTypes = {
   param: React.PropTypes.string.isRequired,
   className: React.PropTypes.string,
   label: React.PropTypes.string,
   transform: React.PropTypes.arrayOf(React.PropTypes.func),
   values: React.PropTypes.array.isRequired,
   feedback: React.PropTypes.func
}


EnumInput.contextTypes = {
   form: React.PropTypes.object,
   onChange: React.PropTypes.func,
   input: React.PropTypes.object,
   patch: React.PropTypes.object,
   submitState: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
   ])
}

class View extends React.Component {
   constructor(p) {
      super(p)

      this.state = {
         showModal: p.showModal || false
      }

      this.onModalToggle = this.onModalToggle.bind(this)
   }

   onModalToggle(ev) {
      if (ev)
         ev.preventDefault()

      this.setState((state) => _.set(state, 'showModal', !state.showModal))
   }

   render() {
      const
         {tokens} = this.props,
         {showModal} = this.state

      return (
         <div>
            <PageHeader>
               Your Tokens

            <div className="pull-right">
               <Button bsStyle="primary" className="btn-sm" onClick={this.onModalToggle}>
                  Create new Token
               </Button>
            </div>
            </PageHeader>

            <CreateTokenModal
               show={showModal}
               toggle={this.onModalToggle}
               onceSaved={(p) => p.then(() => this.onModalToggle())} />

            <ListGroup>
               {_.chain(tokens || [])
                     .filter(() => true)
                     .sortBy('meta.created')
                     .reverse()
                     .map((token) =>

                  <ListGroupItem
                     bsStyle={Item.bsStyle(token)}
                     key={token.fingerprint}
                     className="token">

                     <Item token={token} />

                  </ListGroupItem>
               ).value()}

               {_.times(Math.max(0, 7 - ((tokens || []).length || 0)), (n) =>
                  <ListGroupItem key={'dummy-' + n}>
                     <span className="dummy-block">
                        {_.times(32 + Math.round(Math.random()), () => ' ')}
                     </span>
                     &nbsp; &nbsp; &nbsp;
                     <span className="dummy-block">
                        {_.times(8 + Math.round(Math.random() * 10), () => ' ')}
                     </span>
                  </ListGroupItem>)}
            </ListGroup>
         </div>
      )
   }
}

View.propTypes = {
   tokens: React.PropTypes.array.isRequired
}

const submitToken = function(ev, p) {
   return TokenService.create(p)
}

// map of actions to apply to moment
const expirationValues = {
   'year': [1, 'year'],
   'half-year': [6, 'months'],
   'quarter': [3, 'months'],
   // always use 30 days to be consistent
   // when selecting `month` there's the issue of february usage time
   // which will be 28 or 29 days
   'month': [30, 'days'],
   'week': [1, 'week'],
   'day': [1, 'day'],
   'never': -1
}

// map of usage times
const usageValues = {
   'year': 86400 * 365 * 1000,
   'half-year': 86400 * 182 * 1000,
   'quarter': 86400 * 90 * 1000,
   'month': 86400 * 30 * 1000,
   'week': 86400 * 7 * 1000,
   'day': 86400 * 1000,
   'never': -1
}

const mapExpiration = function(interval) {
   const expiration = expirationValues[interval]

   if (_.isArray(expiration)) {
      let date, expires

      date = moment().add.apply(moment(), expiration)
      expires = date.toISOString()

      return [expires, usageValues[interval]]
   } else {
      return [expiration, usageValues[interval]]
   }
}

const processToken = function(patch) {
   console.log('patch', patch)
   const [expires, usage_time] = mapExpiration(patch.expires)

   return _.assign({}, patch, {expires, usage_time})
}

const CreateTokenModal = ({toggle, show, onceSaved}) =>
   <Modal
      className="modal-wait"
      onHide={toggle}
      show={show}>

      <Modal.Header closeButton>
         <span><Glyphicon glyph="plus" />&nbsp;Create new Token</span>
      </Modal.Header>

      <Form
         transform={processToken}
         onSubmit={!onceSaved ? submitToken : (...args) => onceSaved(submitToken(...args))}
         defaultValues={{expires: 'month'}}>
         <Modal.Body>
               <Form.Error>
                  Some error occured
               </Form.Error>

               <Row>
                  <Col xs={6}>
                     <Input
                        param="name"
                        label="Token Name"
                        validate={{size: 48}}
                        type="text" />
                  </Col>

                  <Col xs={6}>
                     <Input
                        param="usage_time"
                        label="Extend Expiry on usage"
                        type="checkbox" />
                  </Col>

                  <Col xs={12}>
                     <EnumInput
                        param="expires"
                        label="Token Expiration"
                        values={_.keys(expirationValues)} />
                  </Col>
               </Row>
         </Modal.Body>

         <Modal.Footer>
            <Submit>Create Token</Submit>
            <Reset>Reset Form</Reset>
         </Modal.Footer>
      </Form>
   </Modal>

CreateTokenModal.propTypes = {
   toggle: React.PropTypes.func.isRequired,
   show: React.PropTypes.bool.isRequired,
   onceSaved: React.PropTypes.func
}

export class Tokens extends React.Component {
   render() {
      const props = this.props

      return (
         <TokensStorage {...props}>
            <View tokens={[]} />
         </TokensStorage>
      )
   }
}
