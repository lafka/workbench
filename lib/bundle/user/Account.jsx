import React from 'react'
import _ from 'lodash'

import {PageHeader, Row, Col} from 'react-bootstrap'
import {ButtonToolbar, Alert} from 'react-bootstrap'

import {UserService} from '../../User'

import {Loading} from '../../ui'
import {Form, Input, Submit, Reset} from '../../forms'

import IntlPhoneNumbers from './international-phone-codes.json'

function filtermap(array, f) {
   return _.reduce(array, function(acc, el, k) {
      let res = f(el, k)

      if (undefined !== res && null !== res)
         acc.push(res)

      return acc
   }, [])
}

const phoneNumbers = _.map(IntlPhoneNumbers, function(codes, country) {
   return {
      country,
      sanitizedcodes: _.map(codes.split(/ and /),
         (code) => code.replace(/^([0-9]+)$/, '+$1').replace(/-/, '')),
      codes: _.map(codes.split(/ and /), (code) => code.replace(/^([0-9]+)$/, '+$1'))
   }
})

const filterNumberPrefix = function(number, code) {
   if (!code)
      return false

   if (number === code)
      return true

   if (number.length >= code.length)
      return number.slice(0, code.length) === code
   else
      return number === code.slice(0, number.length)
}

const sanitizeNumber = function(number) {
   if (!number)
      return null


   return '+' + number
      .replace(/^(00|\+)/, '')
      .replace(/[^0-9]*/g, '')
}

const findCountriesByNumber = function(number) {
   let result = filtermap(phoneNumbers, function({sanitizedcodes, codes, ...rest}) {
      let matches = filtermap(
            _.zip(sanitizedcodes, codes),
            ([sanitized, code]) =>
               filterNumberPrefix(number, sanitized) ? [sanitized, code] : undefined)

      return 0 < matches.length
         ? _.assign(rest, {sanitizedcode: matches[0][0], code: matches[0][1]})
         : null
   })

   // reverse sort by returning the length as a negative value
   // this ensures the longest common prefix will be at the head of `result`
   return _.sortBy(result, ({code}) => -1 * code.length)
}

export class PhoneInput extends React.Component {
   static get contextTypes() {
      return {
         input: React.PropTypes.object,
         submitState: React.PropTypes.any,
         patch: React.PropTypes.object
      }
   }

   static get propTypes() {
      return {
         param: React.PropTypes.string.isRequired
      }
   }

   static formatNumber(number, def) {
      if (!def)
         return number

      // replace the prefix with a nicely formated prefix
      return number.replace(new RegExp('^\\' + def.sanitizedcode + '\\s*'), def.code + ' ')
   }

   // takes second argument def which contains format props
   static validateNumber(num) {
      // mom always said no input is good input
      if (!num)
         return true

      if (15 < num.length)
         return {error: 'Phone numbers can not exceed 15 digits in length'}

      if (!num.match(/^\+/))
         return {error: 'Phone numbers must start with a +', state: 'warn'}

      if (num.match(/[^0-9() +-]/))
         return {error: 'Phone numbers may only contain numbers, (, ), - and spaces', state: 'warn'}

      return true
   }

   render() {
      let
         {param} = this.props,
         number = _.get(this.context.patch, param) || _.get(this.context.input, param),
         countries = findCountriesByNumber(number),
         country, flag

      // if we have a number and length, with + prefix, of number > 3
      if (number && 3 <= number.length && countries && 1 <= countries.length) {
         flag = countries[0].country
         country = countries[0].country
      }

      return (
         <Input
            param={param}
            label="Phone Number"
            type="tel"
            transform={[sanitizeNumber]}
            format={(num) => PhoneInput.formatNumber(num, countries[0])}
            validate={(num) => PhoneInput.validateNumber(num, countries[0])}
            size="16"
            placeholder="+47 79 13 ...">

            <span
               style={{top: '22px', right: '2px'}}
               className="form-control-feedback">

               {country && <img alt={country} src={`/public/flags/${flag}.png`} />}
            </span>
         </Input>
      )
   }
}

// compact password scoring by tm_lv
// http://stackoverflow.com/questions/948172/password-strength-meter
function scorePassword(pass) {
   let score = 0
   if (!pass)
      return score

   // award every unique letter until 5 repetitions
   let letters = {}

   for (let i = 0; i < pass.length; i = i + 1) {
      letters[pass[i]] = (letters[pass[i]] || 0) + 1
      score = score + (5.0 / letters[pass[i]])
   }

   // bonus points for mixing it up
   let variations = {
      digits: /\d/.test(pass),
      lower: /[a-z]/.test(pass),
      upper: /[A-Z]/.test(pass),
      nonWords: /\W/.test(pass)
   }

   let variationCount = 0

   _.each(variations, function(v) {
      variationCount = variationCount + (true === v ? 1 : 0)
   })

   score = score + ((variationCount - 1) * 10)

   return parseInt(score, 10)
}

const PasswordStrength = function({score, error}) {
   const
      strength = parseInt(score / 25, 10),
      scoreClass = 'strength-' + strength,
      quality = ['terrible', 'poor', 'average', 'good', 'excellent']

   if (score)
      return (
         <div>
            <div className={'password-strength ' + scoreClass}>
               <span className="bar-1" />
               <span className="bar-2" />
               <span className="bar-3" />
               <span className="bar-4" />
            </div>

            <span className="help-block">
               {error && error}
               {!error && <span className={'password-strength-text ' + scoreClass}>
                  Password strength: {quality[strength]}
               </span>}
            </span>
         </div>
      )

   return null
}

PasswordStrength.propTypes = {
   score: React.PropTypes.number,
   error: React.PropTypes.string
}

export class Account extends React.Component {
   static get propTypes() {
      return {
         user: React.PropTypes.object
      }
   }

   constructor(props) {
      super(props)

      this.state = {
         notify: null
      }
   }

   componentWillMount() {
      this._mounted = true
   }

   componentWillUnmount() {
      this._mounted = false
   }

   dismissNotification() {
      this.setState({notify: null})
   }

   validatePw(pw, {param}, input, patch) {
      if ('password' === param && !pw && !patch.$password)
         return true

      // validate that passwords match
      if ('$password' === param && pw !== patch.password) {
         return '' === patch.password ? true : {error: 'Password does not match'}
      } else {
         const score = scorePassword(pw)

         if (!pw)
            return true

         if (30 > score)
            return {error: 'Password is to weak', score}

         if (8 > pw.length)
            return {error: 'Password should be atleast 8 characters long', score}


         return {score}
      }
   }

   handleSubmit(ev, newdata) {
      ev.preventDefault()

      return UserService.update(newdata)
   }

   render() {
      let {user} = this.props

      const transform = (data) => _.omit(data, '$password')

      if (!user)
         user = {}

      return (
         <div>
            {this.state.notify || <Alert key="placeholder" className="transparent">&nbsp;</Alert>}

            <PageHeader>Account Settings</PageHeader>
            <Loading loading={_.eq({}, user)}>
               <Form
                  transform={transform}
                  input={user}
                  onSubmit={this.handleSubmit}>

                  <Form.Updated>
                     Success! Your user details where updated!
                  </Form.Updated>

                  <Form.Error>
                     Unfortunately an error occured and we where not able to update
                     your user.<br /><br />
                  </Form.Error>

                  <Row>
                     <Col xs={12} sm={6}>
                        <label>Email</label>
                        <p className="form-control-static">{user.email}</p>
                     </Col>

                     <Col xs={12} sm={6}>
                        <Input
                           param="name"
                           label="Full Name"
                           validate={{size: 48}}
                           type="text" />
                     </Col>

                     <Col xs={12} sm={6}>
                        <PhoneInput param="phone" />
                     </Col>
                  </Row>

                  <hr />

                  <Row>
                     <Col xs={12} sm={6}>
                        <Input
                           param="password"
                           type="password"
                           label="Password"
                           validate={this.validatePw}
                           feedback={PasswordStrength} />
                     </Col>

                     <Col xs={12} sm={6}>
                        <Input
                           param="$password"
                           type="password"
                           label="Confirm Password"
                           validate={this.validatePw}
                           disabled={false} />
                     </Col>
                  </Row>

                  <Row style={{marginBottom: '20px'}}>
                     <Col xs={12}>
                        <ButtonToolbar >
                           <Submit>Update Account</Submit>
                           <Reset>Reset Form</Reset>
                        </ButtonToolbar>
                     </Col>
                  </Row>
               </Form>
            </Loading>
         </div>
      )
   }
}
