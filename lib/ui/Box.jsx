import React from 'react'
import {Alert} from 'react-bootstrap'

export const Title = ({className, children}) =>
   <div className={(className || '') + ' box-title'}>
      <h4>{children}</h4>
   </div>

Title.propTypes = {
   children: React.PropTypes.node.isRequired,
   className: React.PropTypes.string
}

export const Notify = ({className, style, children}) =>
   <div className={(className || '') + ' box-notify'}>
      <Alert bsStyle={style}>{ children }</Alert>
   </div>

Notify.propTypes = {
   children: React.PropTypes.node.isRequired,
   style: React.PropTypes.string.isRequired,
   className: React.PropTypes.string
}

export const Content = ({className, children}) =>
   <div className={(className || '') + ' box-content'}>
      { children }
   </div>


Content.propTypes = {
   children: React.PropTypes.node.isRequired,
   className: React.PropTypes.string
}

const Info = ({className, children}) =>
   <div className={(className || '') + ' box-info'}>
      { children }
   </div>

Info.propTypes = {
   children: React.PropTypes.node.isRequired,
   className: React.PropTypes.string
}

export const Box = ({show, className, children}) =>
   show ? <div className={(className || '') + ' box'}>{ children }</div> : null

Box.propTypes = {
   children: React.PropTypes.node.isRequired,
   show: React.PropTypes.bool.isRequired,
   className: React.PropTypes.string
}

Box.Title = Title
Box.Notify = Notify
Box.Content = Content
Box.Info = Info
