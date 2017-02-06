import React from 'react'
import {Button, Glyphicon} from 'react-bootstrap'

import {AuthService} from '../../Auth'
import {Spinkit} from '../../ui'

export class Login extends React.Component {
   constructor(p) {
      super(p)

      this.state = {
         email: '',
         password: '',
         promise: null,
         loading: false
      }

      this.updateEmail = this.updateEmail.bind(this)
      this.updatePw = this.updatePw.bind(this)
   }

   static get propTypes() {
      return {
         // react-router
         router: React.PropTypes.object,

         notify: React.PropTypes.object,
         redirect: React.PropTypes.string
      }
   }

   componentWillMount() {
      this._mounted = true
   }

   componentWillUnmount() {
      this._mounted = false
      this.setState({password: ''})
   }

   login(ev) {
      ev.preventDefault()

      let {email, password} = this.state
      let {notify} = this.props
      if (notify)
         notify.clear()

      if (!email) {
         notify.add(
               <span> <Glyphicon glyph="comment" /> A email is required</span>,
               'warning')
         this.forceUpdate()
         return
      }

      if (!password) {
         notify.add(
               <span> <Glyphicon glyph="comment" /> A password is required</span>,
               'warning')
         this.forceUpdate()
         return
      }

      let promise = AuthService.login(email, password)
         .catch((err) => {
            let msg = 'an unknown error occurred'

            if (notify)
               if (err.req && 401 === err.req.status)
                  notify.add(
                     <span>
                        <Glyphicon glyph="warning-sign" />
                        Login failed: <em>{err.data.error}</em>
                     </span>, 'danger')
               else
                  notify.add(
                     <span> <Glyphicon glyph="warning-sign" /> Login failed: <em>{msg}</em></span>,
                     'danger')

            this.setState({loading: false})
         })
         .then((arg) => {
            let [resp, req] = arg

            if (this._mounted)
               this.setState({loading: false})

            if (!resp)
               return

            if (200 === req.status) {
               if (!this.props.router)
                  console.log('Login: missing router param, can\'t redirect')
               else if (this.props.redirect)
                  this.props.router.replace(this.props.redirect)
               else
                  console.log('Login: nothing to redirect to...')
            } else {
               const {status, statusText} = req
               console.log('Login: unknown API response: ' + status + ' ' + statusText, resp)
               if (notify)
                  notify.add(
                     <span>
                        <Glyphicon glyph="warning-sign" /> Login failed:
                        <em>Unknown API response: <b>{req.status} {req.statusText}</b></em>
                     </span>, 'danger')
            }
         })

      this.setState({promise, loading: true})
   }

   updateEmail(ev) {
      let email = ev.target.value
      this.setState({email})
   }

   updatePw(ev) {
      let password = ev.target.value
      this.setState({password})
   }

   render() {
      let {loading} = this.state

      return (
         <form onSubmit={this.login.bind(this)}>
            <div className="form-group">
              <label htmlFor="login-email">Email address</label>
              <div className="input-group">
                <span className="input-group-addon" id="at-addon">@</span>
                <input
                  type="text"
                  className="form-control"
                  name="login-email"
                  id="login-email"
                  onChange={this.updateEmail.bind(this)}
                  placeholder="email@address" />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-group">
                <span className="input-group-addon" id="at-addon">***</span>
                <input
                  type="password"
                  className="form-control"
                  name="login-password"
                  id="login-password"
                  onChange={this.updatePw.bind(this)}
                  placeholder="********" />
              </div>
            </div>

            <div className="text-right">
              <Button
                bsStyle="success"
                type="submit"
                disabled={loading}
                onSubmit={this.login.bind(this)}
                onClick={this.login.bind(this)}>

                <Spinkit spin={loading} />

                Sign in
              </Button>
            </div>
         </form>
      )
   }
}
