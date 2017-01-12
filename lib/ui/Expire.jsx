import React from 'react'

class Expire extends React.Component {
   static get propTypes() {
      return {
         children: React.PropTypes.node.isRequired,
         delay: React.PropTypes.number.isRequired
      }
   }

   constructor() {
      super()
      this.state = {
         visible: true
      }
   }

   static defaultProps: {
      delay: 5000
   }

   componentWillReceiveProps(nextProps) {
      if (nextProps.children !== this.props.children) {
         this.setTimer()
         this.setState({visible: true})
      }
   }

   componentWillUnmount() {
      if (null !== this._timer)
         clearTimeout(this._timer)
   }
   componentDidMount() {
      this.setTimer()
   }

   setTimer() {
      if (null !== this._timer)
         clearTimeout(this._timer)

      if (0 < this.props.delay) {
         this._timer = setTimeout(function() {
            this.setState({visible: false})
            this._timer = null
         }.bind(this), this.props.delay)
      }
   }

   render() {
      return this.state.visible ? <div>{this.props.children}</div> : <span />
   }
}

export {Expire}
