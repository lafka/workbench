import React from 'react'

import {Grid, Row, Col} from 'react-bootstrap'
import {Link} from 'react-router'

import {AuthService, AuthStore} from '../../Auth'
import {Login, Register} from '../../components/auth'
import {Notify} from '../../ui'

export class Logout extends React.Component {
   static get propTypes() {
      return {
         location: React.PropTypes.object.isRequired,
         history: React.PropTypes.any.isRequired,
         route: React.PropTypes.any.isRequired
      }
   }

   constructor(props) {
      super(props)
      this._notify = null
   }

   componentWillMount() {
      this._notify = new Notify.Store()

      if (AuthStore.auth || localStorage.auth)
         AuthService.logout('component')
            .then(() => this.forceUpdate())
            .catch(() => this.forceUpdate())
   }

   render() {
      console.log('render: auth/logout', window.location.hash)

      let
         {location, route, history} = this.props,
         authview = location.query.auth


      return (
         <div
            className="featured"
            style={{
               padding: '140px 0 80px',
               background: '#34495e',
               color: '#fff',
               borderBottom: '3px solid #23384d'}}>

            <Grid>
               <Row>
                  <Col sm={6} className="text-center">
                     <h1>You are now logged out!</h1>

                     <p className="lead">
                        Thanks for using our service, if you did not mean to
                        logout use the form to sign back in.
                     </p>
                  </Col>
                  <Col sm={6}>
                     <div style={{display: 'register' !== authview ? 'inherit' : 'none'}}>
                        <Login notify={this._notify} redirect="/dashboard" history={history} />
                        <p>
                           <Link to={{pathname: route.path, query: {auth: 'register'}}}>
                              Don't have an account? sign up now!
                           </Link>
                        </p>
                     </div>

                     <div style={{display: 'register' === authview ? 'inherit' : 'none'}}>
                        <Register notify={this._notify} redirect="/dashboard" history={history} />
                        <p>
                           <Link to={{pathname: route.path, query: {auth: 'login'}}}>
                              Already have an account? sign in!
                           </Link>
                        </p>
                     </div>
                  </Col>
               </Row>
            </Grid>
         </div>
      )
   }
}
