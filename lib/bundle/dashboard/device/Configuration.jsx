import React from 'react'

export const Configuration = ({device}) => {
   return (
      <div>
         <h1>Configuration, need device state storage</h1>
         <pre>{JSON.stringify(device, null, 2)}</pre>
      </div>)
}

Configuration.propTypes = {
   device: React.PropTypes.object.isRequired
}

Configuration.providesGrid = false

