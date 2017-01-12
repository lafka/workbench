import React from 'react'
import _ from 'lodash'
import {Button, Glyphicon} from 'react-bootstrap'

import {AuthService} from '../../Auth'

export class Register extends React.Component {
   static get propTypes() {
      return {
         notify: React.PropTypes.object,
         redirect: React.PropTypes.string,
         history: React.PropTypes.func
      }
   }

   constructor(p) {
      super(p)

      this.state = {
         email: '',
         password: '',
         confirm_password: '',
         loading: false
      }

      this.updateEmail = this.updateEmail.bind(this)
      this.updatePw = this.updatePw.bind(this)
      this.updateConfirmPw = this.updateConfirmPw.bind(this)
   }

   componentWillUnmount() {
      this.setState({password: '', confirm_password: ''})
   }


   updateEmail(ev) {
      let email = ev.target.value
      this.setState({email})
   }

   updatePw(ev) {
      let password = ev.target.value
      this.setState({password})
   }

   updateConfirmPw(ev) {
      let confirm_password = ev.target.value
      this.setState({confirm_password})
   }

   register(ev) {
      ev.preventDefault()

      let
         {email, password, confirm_password} = this.state,
         {notify} = this.props

      notify.clear()

      if (!email) {
         notify.add(<span> <Glyphicon glyph="comment" /> A email is required</span>, 'warning')
         this.forceUpdate()
         return
      }

      if (!password) {
         notify.add(
            <span>
               <Glyphicon glyph="comment" /> You must enter a password
            </span>, 'warning')
         this.forceUpdate()
         return
      }

      if (!confirm_password) {
         notify.add(
            <span>
               <Glyphicon glyph="comment" /> You must confirm your password
            </span>, 'warning')
         this.forceUpdate()
         return
      }

      if (password !== confirm_password) {
         notify.add(<span> <Glyphicon glyph="comment" /> Password did not match</span>, 'warning')
         this.forceUpdate()
         return
      }

      let promise = AuthService.register(email, password)
         .catch((resp) => {
            let msg = 'An unknown error occured'

            if (_.isError(resp))
               throw resp
            else
               msg = resp.data.error || JSON.stringify(resp.data)

            if (notify)
               notify.add(
                  <span>
                     <Glyphicon glyph="warning-sign" /> Registration failed: <em>{msg}</em>
                  </span>, 'danger')

            this.setState({loading: false})
         })
         .then(() => {
            this.setState({loading: false})

            if (this.props.redirect)
               this.props.history.replace(this.props.redirect)
         })

      this.setState({promise, loading: true})
   }

   render() {
      return (
         <form onSubmit={this.register.bind(this)}>
           <div className="form-group">
             <label htmlFor="register-email">Email address</label>
             <div className="input-group">
               <span className="input-group-addon" id="at-addon">@</span>
               <input
                 type="text"
                 className="form-control"
                 name="register-email"
                 onChange={this.updateEmail.bind(this)}
                 id="register-email"
                 placeholder="email@address.com" />
             </div>
           </div>

           <div className="form-group">
             <label htmlFor="register-password">Password</label>

             <div className="input-group">
               <span className="input-group-addon" id="at-addon">***</span>
               <input
                 type="password"
                 className="form-control"
                 name="register-password"
                 onChange={this.updatePw.bind(this)}
                 id="register-password"
                 placeholder="********" />
             </div>
           </div>

           <div className="form-group">
             <label htmlFor="register-confirm-password">Confirm Password</label>

             <div className="input-group">
               <span className="input-group-addon" id="at-addon">***</span>
               <input
                 type="password"
                 className="form-control"
                 name="register-confirm-password"
                 onChange={this.updateConfirmPw.bind(this)}
                 id="register-confirm-password"
                 placeholder="********" />
             </div>
           </div>

           <div className="text-right">
             <Button
               bsStyle="success"
               type="submit"
               onSubmit={this.register.bind(this)}
               onClick={this.register.bind(this)}>
               Register
             </Button>
           </div>
         </form>
      )
   }
}


