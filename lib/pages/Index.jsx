import React from 'react'

import {Grid, Row, Col} from 'react-bootstrap'
import {Button, Glyphicon} from 'react-bootstrap'
import {LinkContainer} from 'react-router-bootstrap'
import {Link} from 'react-router'

import {Login, Register} from '../components/auth'
import {Notify} from '../ui'
import {AuthStore} from '../Auth'

//import {hashHistory} from 'react-router'
//
//import {Login, Register} from '../components/auth'
//
//import BodyClass from 'react-body-classname'
//
////import {Grid, Row, Col, Navbar, Nav, NavItem} from 'react-bootstrap'
//import {Button, Input, Alert} from 'react-bootstrap'
//
//import {Link} from 'react-router'
//
//import {Box, Notify} from '../ui'
//let branding = require('../../public/images/workbench-neg.png')
//
//import {UserService} from '../User'
//import {AuthStore, AuthService, AuthConstants} from '../Auth'
//import AppDispatcher from '../AppDispatcher'

export class Index extends React.Component {
  constructor(props) {
    super(props)
    this._notify = null
  }

  componentWillMount() {
    this._notify = new Notify.Store()
  }

  render() {
    let
      {location, history} = this.props,
      {auth} = location.query

    console.log('render', 'pages/Index', window.location.hash)

    return (
      <div className="page index">
         <TopRow auth={auth} notify={this._notify} history={history} />
         <Grid>
            <MainFeatures />

            <hr />

            <GuidedTour />
            <hr />
            <Innovations />
         </Grid>
      </div>
      )
  }
}

let Innovations = (props) =>
   <Row style={{padding: '4rem 0 2rem'}}>
      <Col md={8}>
         <h1>Support from start until finish</h1>

         <p className="lead">
            I'm a luberjack an i'm okey! i work all night n'sleep all day!
         </p>

         <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Duis volutpat eros tellus, non semper augue finibus id.
            Nulla facilisi. In gravida purus et dolor aliquam, quis tincidunt nisi porttitor.
            Duis eros dui, pulvinar quis erat quis, mollis pharetra sem.
            Nullam arcu metus, vehicula in posuere quis, dapibus ut arcu.
            Praesent et turpis fermentum, gravida purus vel, vulputate diam.
         </p>
      </Col>
      <Col md={4}>
         <div className="text-center" style={{fontSize: '10em'}}>
            <Glyphicon glyph="table" />
         </div>
      </Col>
   </Row>

let GuidedTour = (props) =>
   <Row style={{padding: '4rem 0 2rem'}}>
      <Col md={6}>
         <div className="text-center" style={{fontSize: '10em'}}>
            <Glyphicon glyph="home" />
         </div>
      </Col>

      <Col md={6}>
         <h1>Getting started</h1>

         <p className="lead">
            I'm a luberjack an i'm okey! i work all night n'sleep all day!
         </p>

         <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            Duis volutpat eros tellus, non semper augue finibus id.
            Nulla facilisi. In gravida purus et dolor aliquam, quis tincidunt nisi porttitor.
            Duis eros dui, pulvinar quis erat quis, mollis pharetra sem.
            Nullam arcu metus, vehicula in posuere quis, dapibus ut arcu.
            Praesent et turpis fermentum, gravida purus vel, vulputate diam.
         </p>

         <p className="text-right">
            <Button>&gt; Get a development kit</Button>
         </p>
      </Col>
   </Row>

const TopRow = (props) => {
   let auth = AuthStore.auth
   if (!auth) {
      return (
         <div className="featured" style={{padding: '140px 0 80px', background: '#34495e', color: "#fff", borderBottom: '3px solid #23384d'}}>
            <Grid>
               <Row>
                  <Col sm={6}><IntroCopy /></Col>
                  <Col sm={6}>
                     <div style={{display: 'register' !== props.auth ? 'inherit' : 'none'}}>
                        <Login notify={props.notify} redirect="/dashboard" history={props.history} />
                        <p>
                           <Link to={{path: "/", query: {auth: "register"}}}>
                              Don't have an account? sign up now!
                           </Link>
                        </p>
                     </div>

                     <div style={{display: 'register' === props.auth ? 'inherit' : 'none'}}>
                        <Register notify={props.notify} redirect="/dashboard" history={props.history} />
                        <p>
                           <Link to={{path: "/", query: {auth: "login"}}}>
                              Already have an account? sign in!
                           </Link>
                        </p>
                     </div>
                  </Col>
               </Row>
            </Grid>
         </div>
      )
   } else {
      return (
         <div className="featured" style={{padding: '140px 0 80px', background: '#34495e', color: "#fff", borderBottom: '3px solid #23384d'}}>
            <Grid>
               <Row>
                  <Col sm={6}><IntroCopy /></Col>
                  <Col sm={6}>
                     <h1>Welcome back</h1>

                     <LinkContainer to="/dashboard">
                        <Button>Go to dashboard</Button>
                     </LinkContainer>
                  </Col>
               </Row>
            </Grid>
         </div>
      )
   }
}

const IntroCopy = (props) =>
   <div>
     <p className="lead">
       Sense, Monitor and Control <strong>any device</strong>
     </p>

     <p className="body">
       Sense inputs, monitor alerts, or control outputs
       of your <strong>Tiny Mesh™</strong> device from anywhere in the world!
     </p>

     <p>
       <LinkContainer to="/" query={{register: true}}>
         <Button bsStyle="success">Sign Up</Button>
       </LinkContainer>
       &nbsp;
       <a href="https://tiny-mesh.com">
         <Button>Learn more at tiny-mesh.com</Button>
       </a>
     </p>
   </div>

const MainFeatures = (props) =>
   <Row className="text-center features" style={{padding: '4rem 0 2rem'}}>
      <Col sm={4}>
         <div className="lead text-center">
            <Glyphicon glyph="remove" />
         </div>

         <h4>Read, write GPIO</h4>

         <p>
            Lorem ipsum dolor sit ametus, consectetur adipiscing elit. Praesent at dui quis tortor
            mollis feugiat. In luctus ornare turpis. Donec nec auctor tortor, sit amet vehicula dui.
         </p>
      </Col>

      <Col sm={4}>
         <div className="lead text-center">
            <Glyphicon glyph="home" />
         </div>

         <h4>Connect Everywhere</h4>

         <p>
            Lorem ipsum dolor sit ametus, consectetur adipiscing elit. Praesent at dui quis tortor
            mollis feugiat. In luctus ornare turpis. Donec nec auctor tortor, sit amet vehicula dui.
         </p>
      </Col>

      <Col sm={4}>
         <div className="lead text-center">
            <Glyphicon glyph="ok" />
         </div>

         <h4>Over-the-air configuration</h4>

         <p>
            Lorem ipsum dolor sit ametus, consectetur adipiscing elit. Praesent at dui quis tortor
            mollis feugiat. In luctus ornare turpis. Donec nec auctor tortor, sit amet vehicula dui.
         </p>
      </Col>

   </Row>

