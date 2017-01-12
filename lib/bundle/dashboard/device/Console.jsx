import React from 'react'

export const Console = ({device}) => {
   return (
      <div>
         <h1>Console</h1>
         <pre>{JSON.stringify(device, null, 2)}</pre>
      </div>)
}

Console.propTypes = {
   device: React.PropTypes.object.isRequired
}

Console.providesGrid = false

