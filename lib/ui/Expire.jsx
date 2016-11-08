import React from 'react';

export default class Expire extends React.Component {
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
    this._timer != null ? clearTimeout(this._timer) : null
  }
  componentDidMount() {
    this.setTimer()
  }

  setTimer() {
    this._timer != null ? clearTimeout(this._timer) : null

    if (this.props.delay > 0) {
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
