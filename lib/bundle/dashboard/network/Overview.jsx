import React from 'react'

import {SetupSteps} from '../setup-guide'

export const Overview = ({network, ...props}) =>
   <div>
      <SetupSteps link={true} network={network} {...props} />

      Why am i not a dashboard?
   </div>
