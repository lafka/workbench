import React from 'react'
import _ from 'lodash'

import {PageHeader, Row, Col} from 'react-bootstrap'
import {Button, ButtonToolbar, Alert} from 'react-bootstrap'

import {Loading} from '../../ui'
import {Form, Input} from '../../forms'

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

export class Account extends React.Component {
   static get propTypes() {
      return {
         user: React.PropTypes.object.isRequired
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
               <Form input={user} onSubmit={(ev) => this.handleSubmit(ev)}>
                  <Row>
                     <Col xs={12} sm={6}>
                        <Input
                           param="email"
                           type="text"
                           label="Email"
                           type="text"
                           placeholder="email@address.com" />
                     </Col>

                     <Col xs={12} sm={6}>
                        <Input
                           param="name"
                           label="Full Name"
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
                           label="Password" />
                     </Col>

                     <Col xs={12} sm={6}>
                        <Input
                           param={null}
                           type="password"
                           label="Confirm Password"
                           disabled />
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
               </Form>
            </Loading>
         </div>
      )
   }
}
