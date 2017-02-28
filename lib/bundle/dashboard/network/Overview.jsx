import React from 'react'
import _ from 'lodash'

import {Row, Col} from 'react-bootstrap'
import {Glyphicon, Button, ButtonToolbar, PageHeader} from 'react-bootstrap'

import {SetupGuide, SetupSteps} from '../setup-guide'
import {AddressEncoder, Loading} from '../../../ui'
import {Form, Input, Submit, Reset} from '../../../forms'

import {NetworkService} from '../../../api/network'

export class Overview extends React.Component {
   static get propTypes() {
      return {
         network: React.PropTypes.object.isRequired,
         router: React.PropTypes.object.isRequired,
         routes: React.PropTypes.array.isRequired,
         params: React.PropTypes.object.isRequired
      }
   }

   constructor(props) {
      super(props)

      this.ignoreSetup = this.ignoreSetup.bind(this)
      this.gotoSetup = this.gotoSetup.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
   }

   componentWillMount() {
   }

   componentDidMount() {
   }

   ignoreSetup() {
      SetupGuide.skipSetup(this.props.network)
      this.forceUpdate()
   }

   gotoSetup() {
      let
         {router, params, routes} = this.props,
         newRoutes = _.slice(routes, 0, -1).concat([{path: 'setup'}]),
         nextPath = _.map(newRoutes, r => r.path)
                     .join('/')
                     .replace('//', '/'),
         url

      url = _.reduce(params, (acc, v, k) => acc.replace(':' + k, v), nextPath)

      router.push(url)
   }

   handleSubmit(ev, patch) {
      ev.preventDefault()

      const {key} = this.props.network

      return NetworkService.update(key, patch)
   }

   render() {
      let {network, ...props} = this.props

      return (
         <Loading loading={_.eq({}, network)}>
            <div>
               <div
                  style={{
                     marginBottom: '1rem',
                     display: SetupGuide.setupFinished(network) ? 'none' : 'inherit'}}>
                  <div>
                     <button
                        onClick={this.ignoreSetup}
                        type="button"
                        className="close">
                           <span style={{fontSize: '12px', verticalAlign: 'middle'}}>Ignore</span>
                           &nbsp;
                           <span aria-hidden="true">&times;</span>
                     </button>
                  </div>

                  <div
                     onClick={this.gotoSetup}
                     style={{clear: 'both', marginTop: '1rem', opacity: 0.5}}>

                     <SetupSteps link={true} network={network} {...props} />
                  </div>
               </div>

               <Form
                  onSubmit={this.handleSubmit}
                  transform={(input) => _.omit(input, (v, k) => k.match(/^\$/))}
                  input={network}>

                  <Form.Updated>Network was successfully updated</Form.Updated>
                  <Form.Error>Some error occurred during submit</Form.Error>

                  <Info network={network} />

                  <Types network={network} />

                  <ButtonToolbar style={{clear: 'both'}}>
                     <Submit>Update Network</Submit>
                     <Reset>Reset Form</Reset>
                  </ButtonToolbar>
               </Form>
            </div>
         </Loading>
      )
   }
}

class Editable extends React.Component {
   static get propTypes() {
      return {
         children: React.PropTypes.node.isRequired,
         value: React.PropTypes.string
      }
   }

   constructor() {
      super()

      this.state = {
         update: undefined,
         editing: false
      }

      this.toggleEdit = this.toggleEdit.bind(this)
      this.updateValue = this.updateValue.bind(this)
   }

   toggleEdit(ev) {
      ev.preventDefault()

      this.setState((state) => _.set(state, 'editing', !state.editing), this.focusInput)
   }

   updateValue(ev) {
      const val = ev.target.value

      this.setState((state) => _.set(state, 'update', val))
   }


   render() {
      const
         {children, value} = this.props,
         {editing, update} = this.state

      return (
         <div style={{display: 'inline'}}>
            <a
               style={{display: editing ? 'none' : 'inherit'}}
               onClick={this.toggleEdit}>

               {undefined !== update ? update || children : value || children}

               <Glyphicon className="pull-right" glyph="pencil" style={{paddingLeft: '1em'}} />
            </a>

            <Input
               onUpdate={this.updateValue}
               groupCssClass="input-group-sm"
               type="text"
               style={{display: !editing ? 'none' : 'inherit'}}
               param="name"
               onBlur={this.toggleEdit}
               feedback={() =>
                  <span
                    style={{display: undefined === update || update === value || editing
                                       ? 'none'
                                       : 'inherit'}}
                     className="input-meta"
                     title="Not saved">
                        <Glyphicon glyph="exclamation-sign" />
                  </span>}
               autoFocus={editing} />
         </div>
      )
   }
}

const Info = ({network}) =>
   <Row>
      <Col xs={6}>
         <dl className="dl-horizontal dl-form">
            <dt>Key</dt>
            <dd>{network.key}</dd>

            <dt>Address</dt>
            <dd><AddressEncoder value={network.address} /></dd>

            <dt>Name</dt>
            <dd>
               <Editable value={network.name}>
                  Unnamed Network
               </Editable>
            </dd>
         </dl>
      </Col>
   </Row>

Info.propTypes = {
   network: React.PropTypes.object.isRequired
}

//
// const Channels = () =>
//   <div>
//      <PageHeader>Channels</PageHeader>
//   </div>

const Types = ({network}, {patch, onChange}) => {
   const
      defaultType = _.get(patch, 'provision.type', network.provision.type),
      currentTypes = _.get(patch, 'types', network.types),
      addType = (ev) => {
         ev.preventDefault()

         onChange(ev, {param: '$newType'}, undefined)
         onChange(ev, {param: 'types'}, currentTypes.concat([patch.$newType]))
      }

   if (Button || onChange || defaultType || currentTypes)
      window.y = null

   return (
      <div style={{clear: 'both'}}>
         <PageHeader>Types</PageHeader>

            <div className="type-squares">
               {_.map(currentTypes, (type, idx) =>
                  <div className="square" key={idx}>
                     <span>{type}</span>

                     <span className="pull-right">
                        <Button
                           onClick={(ev) => onChange(ev, {param: 'provision.type'}, type)}
                           bsSize="xsmall"
                           bsStyle="success"
                           value={type}
                           disabled={defaultType === type}>

                           Make default
                        </Button>

                        &nbsp;

                        <Button
                           onClick={(ev) => onChange(ev,
                                                     {param: 'types'},
                                                     _.without(currentTypes, type))}
                           bsSize="xsmall"
                           bsStyle="danger"
                           disabled={defaultType === type}
                           value={type}>
                           Remove
                        </Button>

                     </span>
                  </div>
               )}

               <div className="square"
                 style={{padding: '5px 15px 4px'}}>

                  <div className="input-group">
                     <Input
                        feedback={null}
                        className="form-control input-sm"
                        param="$newType"
                        placeholder="New type name ..."/>

                     <span className="input-group-btn">
                        <Button
                           type="submit"
                           onClick={addType}
                           bsSize="xsmall"
                           bsStyle="link">

                           Add Type
                        </Button>
                     </span>
                  </div>
               </div>
            </div>
      </div>)
}

Types.propTypes = {
   network: React.PropTypes.object.isRequired
}

Types.contextTypes = {
   form: React.PropTypes.object,
   onChange: React.PropTypes.func,
   input: React.PropTypes.object,
   patch: React.PropTypes.object,
   submitState: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
   ])
}
