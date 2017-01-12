import React from 'react'
import _ from 'lodash'

import {PageHeader, Row, Col} from 'react-bootstrap'
import {FormControl, Button, ButtonToolbar, Alert} from 'react-bootstrap'

import {Loading} from '../../ui'

import {UserService} from '../../User'

export class Account extends React.Component {
   static get propTypes() {
      return {
         user: React.PropTypes.object.isRequired
      }
   }

   constructor(props) {
      super(props)

      this.state = {
         patch: {},
         password_confirm: '',
         notify: null
      }
   }

   componentWillMount() {
      this._mounted = true
      UserService.fetch()
   }

   componentWillUnmount() {
      this._mounted = false
   }

   dismissNotification() {
      this.setState({notify: null})
   }

   handleSubmit(ev) {
      ev.preventDefault()

      if (
         0 !== this.passwordValidationState().length ||
         0 !== this.nameValidationState().length ||
         0 !== this.phoneValidationState().length) {
         return
      }

      UserService.update(this.state.patch)
         .then(() =>
            this.setState({notify:
                  <Alert
                     key="success"
                     onDismiss={() => this.dismissNotification()}
                     bsStyle="success"
                     className="expand">

                     User was updated
                  </Alert>}))
         .catch((resp) =>
            this.setState({notify:
                  <Alert
                     key="error"
                     onDismiss={() => this.dismissNotification()}
                     bsStyle="danger"
                     className="expand">

                     Failed to update user: {resp.data.error || JSON.stringify(resp.data)}
                  </Alert>}))
   }


   passwordValidationState() {
      let
         password = this.state.patch.password,
         confirm = this.state.password_confirm

      if (!password)
         return []

      if (8 > password.length)
         return ['error', undefined, 'Passwords must be a minimum of 8 characters']

      if (password !== confirm)
         return ['error', 'error', 'Password does not match']

      return []
   }

   nameValidationState() {
      let name = this.state.patch.name
      if (!name)
         return []

      if (50 < name.length) {
         return ['error', 'Name must be a maximum of 50 characters long']
      } else if (6 > name.length) {
         return ['error', 'Name must be a at least 6 characters long']
      }

      return []
   }

   phoneValidationState() {
      let number = this.state.patch.phone
      if (!number)
         return []

      if (!number.match(/^(\+|00|$)[0-9]*/)) {
         return ['error', 'Phone number must start with a country code (`+47` or `0047`)']
      }

      if (15 <= number.replace(/[^0-9]*/g, '').length) {
         return ['error', 'Phone number must be maximum 15 characters']
      } else if (8 > number.replace(/[^0-9]*/g, '').length) {
         return [
            'warning',
            'Phone number must be a minimum of 8 characters - including country code']
      }

      return []
   }

   render() {
      let {user} = this.props

      console.log('user/ex', _.eq({}, user), user)

      if (!user)
         user = {}

      return (
         <div>
            {this.state.notify || <Alert key="placeholder" bsStyle="inline">&nbsp;</Alert>}

            <PageHeader>Account Settings</PageHeader>
            <Loading loading={_.eq({}, user)}>
               <form onSubmit={(ev) => this.handleSubmit(ev)}>
                  <Row>
                     <Col xs={12} sm={6}>
                        <FormControl
                           value={user.email}
                           type="text"
                           label="Email"
                           placeholder="your@email-address.com"
                           disabled />
                     </Col>

                     <Col xs={12} sm={6}>
                        <FormControl
                           type="text"
                           value={user.name || ''}
                           bsStyle={this.nameValidationState()[0]}
                           help={this.nameValidationState()[1] || ' '}
                           label="Name"
                           placeholder="Full name"
                           disabled
                           />
                     </Col>

                     <Col xs={12} sm={6}>
                        <FormControl
                           type="tel"
                           value={user.phone || ''}
                           bsStyle={this.phoneValidationState()[0]}
                           help={this.phoneValidationState()[1] || ' '}
                           label="Phone Number"
                           placeholder="+47 123 45 678"
                           disabled
                           />
                     </Col>
                  </Row>

                  <hr />

                  <Row>
                     <Col xs={12} sm={6}>
                        <FormControl
                           type="password"
                           label="New Password"
                           value={this.state.patch.password}
                           bsStyle={this.passwordValidationState()[0]}
                           help={this.passwordValidationState()[2] || ' '}
                           placeholder="..."
                           disabled
                           />
                     </Col>

                     <Col xs={12} sm={6}>
                        <FormControl
                           type="password"
                           label="Confirm Password"
                           value={this.state.patch.password_confirm}
                           bsStyle={this.passwordValidationState()[1]}
                           placeholder="..."
                           disabled
                           />
                     </Col>
                  </Row>

                  <Row style={{marginBottom: '20px'}}>
                     <Col xs={12}>
                        <ButtonToolbar >
                           <Button
                              type="submit"
                              bsStyle="warning"
                              className="pull-right" onClick={(ev) => this.handleSubmit(ev)}>

                                 Update Account
                           </Button>

                           <Button
                              type="reset"
                              bsStyle="link"
                              className="pull-right">

                              Reset Form
                           </Button>
                        </ButtonToolbar>
                     </Col>
                  </Row>
               </form>
            </Loading>
         </div>
      )
   }
}
