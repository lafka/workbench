import React from 'react'
import {Button, Glyphicon} from 'react-bootstrap'

import {AuthService} from '../../Auth'

export class Login extends React.Component {
   constructor(p) {
      super(p)

      this.state = {
         email: "",
         password: "",
         promise: null,
         loading: false,
      }

      this.updateEmail = this.updateEmail.bind(this)
      this.updatePw = this.updatePw.bind(this)
   }

   componentWillMount() {
      this._mounted = true
   }

   componentWillUnmount() {
      this._mounted = false
      this.setState({password: ""})
   }

   login(ev) {
      ev.preventDefault()

      let {email, password} = this.state
      let {notify} = this.props
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
         .catch( (resp) => {
            let msg = "an unknown error occurred"

            if (_.isError(resp) )
               throw resp
            else
               msg = resp.data.error || JSON.stringify(resp.data)

            notify && notify.add(
               <span> <Glyphicon glyph="warning-sign" /> Login failed: <em>{msg}</em></span>,
               'danger')

            this.setState({loading: false})
         } )
         .then( (_resp) => {
             this._mounted && this.setState({loading: false})

             if (!this.props.history) {
               console.log('Login: missing history component, can\'t redirect')
               return
             }

             if (this.props.redirect)
               this.props.history.replace(this.props.redirect)
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

                Sign in
              </Button>
            </div>
         </form>
      )
   }
}



