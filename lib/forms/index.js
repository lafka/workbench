import React from 'react'

export class Form extends React.Component {
   constructor(p) {
      super(p)

      this.state = {
         patch: {}
      }

      this._mounted = false

      this.onChange = this.onChange.bind(this)
   }

   componentDidMount() {
      this._mounted = true
   }

   componentWillUnmount() {
      this._mounted = false
   }

   static get childContextTypes() {
      return {
         onChange: React.PropTypes.func,
         patch: React.PropTypes.object,
         input: React.PropTypes.object
      }
   }

   getChildContext() {
      return {
         onChange: this.onChange,
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

   onChange(ev, meta) {
      let error
      if (!meta || !ev) {
         console.log('can\'t set form data, either missing meta or ev')
         return false
      }

      if (!meta.param) {
         console.log('can\'t set form data, meta.param not set')
         return false
      }

      let value = ev.target.value

      if (meta.transform)
         value = _.reduce(meta.transform, (acc, f) => f(acc), value)

      this.setState((state) => _.set(state, `patch.${meta.param}`, value))
   }

   render() {
      return (
         <form className="form">
            {this.props.children}
         </form>
      )
   }
}

export const Input = (props, ctx) => {
   let
      {param, className, format, label, children, validate, ...rest} = props,
      {onChange, input, patch} = ctx,
      value = _.get(patch, param) || _.get(input, param),
      inputValidated = props.validate ? validate(value, props, input, patch) : true

   let
      inputCssClass = (className || 'form-control').split(/ /),
      groupCssClass = props.children ? ['form-group', 'has-feedback'] : ['form-group']

   if (_.isObject(inputValidated) && inputValidated.error)
      groupCssClass = groupCssClass.concat(['has-feedback', 'has-error'])

   if (!format)
      format = _.identity

   rest = _.omit(rest, 'transform', 'format')

   let feedback = props.feedback
      ? <props.feedback {...inputValidated} />
      : <span className="help-block">{inputValidated.error}</span>

   return (
      <div className={_.uniq(groupCssClass).join(' ')}>
         <label>{label}</label>

         <input
            className={_.uniq(inputCssClass).join(' ')}
            onChange={(ev) => onChange(ev, props)}
            value={format(value || "")}
            {...rest} />

         {true === inputValidated && props.children}

         {feedback}
      </div>
   )
}

Input.propTypes = {
   param: React.PropTypes.string.isRequired,
   className: React.PropTypes.string,
   label: React.PropTypes.string,
   transform: React.PropTypes.arrayOf(React.PropTypes.func),
   children: React.PropTypes.node,
   feedback: React.PropTypes.node
}


Input.contextTypes = {
   onChange: React.PropTypes.func,
   input: React.PropTypes.object,
   patch: React.PropTypes.object
}
