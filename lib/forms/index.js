import React from 'react'
import {Alert} from 'react-bootstrap'

import Button from 'antd/lib/button'


import {Spinkit} from '../ui'

/**
 * This is a naive and simple form toolkit
 *
 * If you find yourself in more then this is probably not the right option
 * for you.
 *
 * Features:
 *  - validation
 *  - feedback (based on validation)
 *  - value transformation
 *
 * It expects that the `onSubmit` prop is set and returns a promise.
 *
 * Example:
 *
 * <Form input={dataObject} onSubmit={updateDataObject}>
 *    <Form.Updated>Submit returned successfully!</Form.Updated>
 *    <Form.Error>Some error occurred during submit</Form.Error>
 *
 *    <Input param="name" label="name" validate={customValidateFun} />
 *
 *    <Input
 *       param="countryCode"
 *       label="name"
 *       validate={{size: 2}}
 *       transform={[(str) => str.toUpperCase()]} />
 *       />
 *
 *    <Submit>Update data object</Submit>
 *    <Reset>Reset Form</Reset>
 * </Form>
 */

export class Form extends React.Component {
   constructor(p) {
      super(p)

      this.state = {
         patch: p.defaultValues || {},
         // state should be one of "default", "updating", "error", or "updated"
         // representing noSubmit, or the state of the submit
         state: "default",
         updatePromise: null,
      }

      this._mounted = false
      this._inputs = {}

      this.registerInput = this.registerInput.bind(this)
      this.onChange = this.onChange.bind(this)
      this.resetForm = this.resetForm.bind(this)
      this.submitForm = this.submitForm.bind(this)
      //this.submitState = this.submitState.bind(this)
   }

   static get propTypes() {
      return {
         onSubmit: React.PropTypes.func.isRequired,
      }
   }

   componentDidMount() {
      this._mounted = true
   }

   componentWillUnmount() {
      this._mounted = false
   }

   static get childContextTypes() {
      return {
         form: React.PropTypes.object,
         onChange: React.PropTypes.func,
         resetForm: React.PropTypes.func,
         submitForm: React.PropTypes.func,
         submitState: React.PropTypes.oneOfType([
            React.PropTypes.string,
            React.PropTypes.object
         ]),
         patch: React.PropTypes.object,
         input: React.PropTypes.object
      }
   }

   getChildContext() {
      return {
         form: this,
         onChange: this.onChange,
         resetForm: this.resetForm,
         submitForm: this.submitForm,
         submitState: this.submitState,
         patch: this.patch(),
         input: this.input()
      }
   }

   patch() {
      return this.state.patch
   }

   input() {
      return this.props.input
   }

   registerInput(props) {
      this._inputs[props.param] = props
   }

   onChange(ev, meta, val) {
      let error
      if (!meta || !ev) {
         console.warn('can\'t set form data, either missing meta or ev')
         return false
      }

      if (!meta.param) {
         console.warn('can\'t set form data, meta.param not set')
         return false
      }

      let value = val || ev.target.value

      if ('checkbox' === meta.type)
         value = !value

      if (meta.transform)
         value = _.reduce(meta.transform, (acc, f) => f(acc), value)

      this.setState((state) => _.set(state, `patch.${meta.param}`, value))
   }

   resetForm(ev) {
      ev.preventDefault()

      this.setState({patch: {}})
   }

   validateForm() {
      const
         {patch} = this.state,
         {user} = this.props

      var vals = _.map(this._inputs, function(props, k) {
         let
            {param} = props,
            value = _.get(patch, param)

         return _.set({}, param, doValidation(param, value, props, user, patch))
      })

      return _.reject(vals, (p) => _.eq([true], _.values(p)))
   }

   hasChanges() {
      return 0 < _.values(this.state.patch).length
   }

   submitForm(ev) {
      ev.preventDefault()

      const
         formValidation = this.validateForm(),
         {onSubmit, user, transform} = this.props

      let {patch} = this.state

      if (0 < formValidation.length) {
         this.setState({state: {"error": `There was ${formValidation.length} errors in the form`}})
         return
      }

      if (transform)
         patch = transform(patch)

      let promise = this.props.onSubmit(ev, patch, user)

      // should we care if another submit for this is in progress?
      if (!promise.then)
         console.warn("form/onSubmit did not return a promise")
      else  {
         this.setState({updatePromise: promise, state: "updating"})

         promise
            .then(() => this.setState({state: "updated", patch: {}}))
            .catch((resp) => this.setState({state: {"error": resp}}))
      }
   }

   get submitState() {
      return this.state.state
   }

   render() {
      return (
         <form className="form" onSubmit={this.submitForm}>
            {this.props.children}
         </form>
      )
   }
}

Form.Updated = ({children}, {submitState}) => {
   if ("updated" === submitState)
      return (
         <Alert bsStyle="success">
            {children}
         </Alert>)
   else
      return null
}

Form.Updated.contextTypes = {
   submitState: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
   ])
}

Form.Error = ({children}, {submitState}) => {
   if (_.isObject(submitState) && submitState.error)
      return (
         <Alert bsStyle="danger">
            {children}

            <span className="error">
               {submitState.error.toString()}
            </span>
         </Alert>)
   else
      return null
}
Form.Error.contextTypes = {
   submitState: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
   ])
}



export const Reset = (props, ctx) => {
   return (
      <Button
         onClick={ctx.resetForm}
         disabled={"updating" === ctx.submitState}>

         {props.children}
      </Button>
   )
}

Reset.contextTypes = {
   resetForm: React.PropTypes.func,
   submitState: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
   ])
}

export const Submit = (props, {form, ...ctx}) => {
   const
      changed = form.hasChanges(),
      invalid = 0 < form.validateForm().length,
      submitted = "updating" === ctx.submitState

   return (
      <Button
         onClick={form.submitForm}
         type="primary"
         disabled={!changed || invalid || submitted}>

         <Spinkit spin={"updating" === ctx.submitState} />

         {props.children}
      </Button>
   )
}

Submit.contextTypes = {
   form: React.PropTypes.object,
   submitForm: React.PropTypes.func,
   submitState: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
   ])
}

const doValidation = function(param, value, props, input, patch) {
   const validate = props.validate
   let res

   // function validation may return an object with meta data (like password score)
   // check that an error field is present to determine if it's an error
   if (_.isFunction(validate))  {
      res = validate(value, props, input, patch)
      return (_.isObject(res) && res.error) ? res : true
   } else if (_.isObject(validate)) {
      if (validate.size && validate.size < (value || "").length)
         return {error: `${param} exceeds maximum size of ${validate.size} characters`}
      else
         return true
   } else {
      return true
   }
}

// self validating input!
export class Input extends React.Component {
   componentWillMount() {
      // - register the input in the form
      //  - form may _.all(inputs, valid?)
      //  -> reply with errors?
      //  -> submit the thing
      this._node = null
      this.context.form.registerInput(this.props)
   }

   componentDidUpdate() {
      if (this._node)
         this._node.focus()
   }

   render() {
      const
         props = this.props,
         ctx = this.context

      let
         {onChange, input, patch} = ctx,
         inputValidated,
         {  param,
            className,
            format,
            label,
            children,
            validate,
            disabled,
            autoFocus,
            groupCssClass,
            value,
            onUpdate,
            ...rest} = props

      if (undefined !== _.get(patch, param))
         value = _.get(patch, param)
      else if (undefined !== _.get(input, param))
         value = _.get(input, param)

      inputValidated = doValidation(param, value, props, input, patch)

      let inputCssClass = (className || 'form-control').split(/ /)

      groupCssClass = (groupCssClass ? groupCssClass.split(/ /) : [])
                        .concat(props.children ? ['form-group', 'has-feedback'] : ['form-group'])

      if (_.isObject(inputValidated) && inputValidated.error)
         groupCssClass = groupCssClass.concat(['has-feedback', 'has-error'])

      if (!format)
         format = _.identity

      rest = _.omit(rest, 'transform', 'format')

      let feedback = props.feedback
         ? <props.feedback
               value={format(undefined !== value ? value.toString() : "")}
               originalValue={_.get(input, param)}
               {...inputValidated} />
         : (!inputValidated.error
            ? null
            : <span className="help-block">{inputValidated.error}</span>)

      const updating = 'updating' === ctx.submitState

      let ref = null
      if (autoFocus)
         ref = (input) => {
            this._node = input
         }

      return (
         <div className={_.uniq(groupCssClass).join(' ')}>
            {label && <label>{label}</label>}

            <input
               ref={ref}
               className={_.uniq(inputCssClass).join(' ')}
               onChange={(ev) => {onChange(ev, props); onUpdate && onUpdate(ev) }}
               value={format(undefined !== value ? value.toString() : "")}
               disabled={updating || (_.isFunction(disabled) ? disabled(value, props, input, patch) : disabled)}
               checked={value}
               {...rest} />

            {true === inputValidated && props.children}

            {feedback}
         </div>
      )
   }
}

Input.propTypes = {
   param: React.PropTypes.string.isRequired,
   className: React.PropTypes.string,
   label: React.PropTypes.string,
   transform: React.PropTypes.arrayOf(React.PropTypes.func),
   children: React.PropTypes.node,
   feedback: React.PropTypes.func
}


Input.contextTypes = {
   form: React.PropTypes.object,
   onChange: React.PropTypes.func,
   input: React.PropTypes.object,
   patch: React.PropTypes.object,
   submitState: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.object
   ])
}
