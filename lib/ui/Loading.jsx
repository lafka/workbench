import React from 'react'

// css is in index.html

export class Loading extends React.Component {

   static get propTypes() {
      return {
         children: React.PropTypes.node.isRequired,
         loading: React.PropTypes.bool.isRequired,
         overlay: React.PropTypes.bool
      }
   }

   get loader() {
      return (
         <div className="loader" ref="loader">
            <div className="square clear" />
            <div className="square" />
            <div className="square last" />

            <div className="square clear" />
            <div className="square" />
            <div className="square last" />

            <div className="square clear" />
            <div className="square" />
            <div className="square last" />
         </div>
      )
   }

   render() {
      let children = this.props.children

      if ('string' === typeof children)
         children = <span>{children}</span>
      else if (!children)
         console.log('ERROR: Loading expected String or react element... got: ' + typeof children)

      if (this.props.loading && !this.props.overlay)
         return this.loader
      else if (this.props.loading && this.props.overlay)
         return (
            <div className="loader-wrapper" style={{position: 'relative'}}>
               {this.loader}
               <div className="overlay">&nbsp;</div>
               {children}
            </div>
         )
      else
         return children
   }
}
