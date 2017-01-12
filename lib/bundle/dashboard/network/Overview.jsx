import React from 'react'
import _ from 'lodash'

import {SetupGuide, SetupSteps} from '../setup-guide'

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

   render() {
      let {network, ...props} = this.props

      return (
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

            <pre>
               {JSON.stringify(network, null, 2)}
            </pre>
         </div>
      )
   }
}
