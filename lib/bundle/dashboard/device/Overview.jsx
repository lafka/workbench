import React from 'react'

export const Overview = ({device}) => {
   return (
      <div>
         <pre>{JSON.stringify(device, null, 2)}</pre>
      </div>)
}

Overview.propTypes = {
   device: React.PropTypes.object.isRequired
}

Overview.providesGrid = false