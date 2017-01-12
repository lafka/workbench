import React from 'react'

const Title = ({children}) =>
      <h4 style={{display: 'inline'}} className="title">{children}</h4>

Title.propTypes = {children: React.PropTypes.node.isRequired}

const ItemDate = ({date}) => <span className="pull-right date">{date.toString()}</span>

ItemDate.propTypes = {date: React.PropTypes.string.isRequired}

const Content = ({children}) => <p>{children}</p>

Content.propTypes = {children: React.PropTypes.node.isRequired}

export class TaggedItem extends React.Component {
   static get propTypes() {
      return {
         className: React.PropTypes.string,
         tagStyle: React.PropTypes.string,
         children: React.PropTypes.node.isRequired
      }
   }

   render() {
      const {className, tagStyle, children} = this.props

      return (
         <div className={'tagged-item ' + (className || '')}>
            <div className={'item item-' + tagStyle || 'default'}>
               {children}
             </div>
         </div>
      )
   }
}

TaggedItem.Title = Title
TaggedItem.Date = ItemDate
TaggedItem.Content = Content
