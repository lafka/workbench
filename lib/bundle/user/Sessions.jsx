import React from 'react'
import {FormattedRelative} from 'react-intl'
import _ from 'lodash'

import {SessionsStorage} from '../../storage/Session.jsx'

import {AuthStore} from '../../Auth'
import {Spinkit} from '../../ui'
import {TokenService} from '../../Auth/Tokens'
//
// import {Row, Col} from 'react-bootstrap'
import {PageHeader, Button} from 'react-bootstrap'
import {ListGroup, ListGroupItem} from 'react-bootstrap'
// import {ButtonToolbar, Button, Glyphicon} from 'react-bootstrap'

const hasExpired = ({expires}) => (new Date()).toISOString() >= expires
const isRevoked = (session) => !!session.revoked

class Item extends React.Component {
   constructor() {
      super()

      this.state = {
         revocation: null
      }

      this.handleRevoke = this.handleRevoke.bind(this)
   }

   handleRevoke(ev) {
      const {session} = this.props

      ev.preventDefault()

      this.setState((state) => {
         if (state.revocation)
            return state

         let promise = TokenService.revoke(session.fingerprint, 'user')
            .then(() => TokenService.fetchSessions())

         promise
            .catch(() => this.setState({revocation: null}))
            .done(() => this.setState({revocation: null}))

         return _.set(state, 'revocation', promise)
      })
   }

   render() {
      const
         {revocation} = this.state,
         {session} = this.props

      return (
         <div className="token">
            <Fingerprint {...session} />

            <span><strong className="name">{session.name}</strong></span>

            <span className="item created" title={session.meta.created}>
               <span className="title">Created</span>
               <FormattedRelative value={session.meta.created} />
            </span>

            <span className="item used" title={session.meta.used}>
               <span className="title">Last used</span>
               {session.meta.used
                  ? <FormattedRelative value={session.meta.used} />
                  : 'never'}
            </span>

            {!hasExpired(session) &&
               <span className="created" title={session.expires}>
                  <span className="title">Expires</span>&nbsp;
                  <FormattedRelative value={session.expires} />
               </span>}

            {hasExpired(session) && !session.revoked &&
               <span className="created" title={session.expires}>
                  Expired <FormattedRelative value={session.expires} />
               </span>}

            {hasExpired(session) && session.revoked &&
               <span className="revoked" title={session.revoked.at}>
                  Revoked <FormattedRelative value={session.revoked.at} />&nbsp;
                  ({session.revoked.reason})
               </span>}

            <span className="actions">
               {(!hasExpired(session) && !isRevoked(session)) &&
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

Item.bsStyle = function({fingerprint, revoked, expires}) {
   const
      myFingerprint = AuthStore.auth.fingerprint,
      now = (new Date()).toISOString()

   // active token
   if (myFingerprint === fingerprint)
      return 'success'
   else if (revoked)
      return 'danger'
   else if (now >= expires)
      return 'warning'
   else
      return undefined
}

Item.propTypes = {
   session: React.PropTypes.object.isRequired
}


const View = ({sessions}) =>
   <div>
      <PageHeader>Your Sessions</PageHeader>

      <ListGroup>
         {_.chain(sessions)
               .filter(() => true)
               .sortBy('meta.created')
               .reverse()
               .map((session) =>

            <ListGroupItem
               bsStyle={Item.bsStyle(session)}
               key={session.fingerprint}
               className="token">

               <Item session={session} />

            </ListGroupItem>
         ).value()}

         {_.times(Math.max(0, 7 - sessions.length), (n) =>
            <ListGroupItem key={'dummy-' + n}>
               <span className="dummy-block">
                  {_.times(32 + Math.round(Math.random()), () => ' ')}
               </span>
               &nbsp; &nbsp; &nbsp;
               <span className="dummy-block">
                  {_.times(8 + Math.round(Math.random() * 10), () => ' ')}
               </span>
            </ListGroupItem>)}
      </ListGroup>
   </div>


View.propTypes = {
   sessions: React.PropTypes.array.isRequired
}

const Fingerprint = ({fingerprint}) =>
   <span className="item fingerprint" title={'Fingerprint: ' + fingerprint}>
      <code>
         {7 < fingerprint.length ? fingerprint.slice(0, 7) + '..' : fingerprint}
      </code>
   </span>

Fingerprint.propTypes = {
   fingerprint: React.PropTypes.string.isRequired
}

export const Sessions = (props) => <SessionsStorage {...props}>
   <View sessions={[]} />
</SessionsStorage>
