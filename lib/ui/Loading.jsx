import React from 'react'

// css is in index.html

export class Loading extends React.Component {

   static get propTypes() {
      return {
         children: React.PropTypes.node.isRequired,
         loading: React.PropTypes.bool.isRequired
      }
   }

   componentDidMount() {
      window.addEventListener('resize', this._resize = this._resize || this.handleResize.bind(this))
      // align first!
      setTimeout(this._resize, 0)
   }

   componentDidUpdate() {
      // align first!
      this.handleResize()
   }

   componentWillUnmount() {
      window.removeEventListener('resize', this._resize)
   }

   handleResize(ev) {
      if (ev)
         ev.preventDefault()

      // check that loading is not done
      if (!this.refs.loader) {
         window.removeEventListener('resize', this._resize)
         return
      }

      let
         loader = this.refs.loader,
         boundryBottom = document.body.getBoundingClientRect().bottom


      // loader.style.marginTop = Math.round(top / 2) + 'px'
      // loader.style.marginLeft = Math.round(left / 2) + 'px'
      const parentRect = loader.parentElement.getClientRects()[0]
      loader.style.marginTop = (((boundryBottom - parentRect.top) / 2) - 30) + 'px'
      loader.style.marginLeft = ((loader.parentElement.getClientRects()[0].width / 2) - 30) + 'px'
   }

   componentWillReceiveProps(next) {
      if (!this.refs.loader) {
         return
      }

      if (!next.loading) {
         this.refs.loader.style.marginTop = 'inherit'
         this.refs.loader.style.marginLeft = 'inherit'
      }
   }

   render() {
      let children = this.props.children

      if ('string' === typeof children)
         children = <span>{children}</span>
      else if (!children)
         console.log('ERROR: Loading expected String or react element... got: ' + typeof children)

      if (this.props.loading)
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
      else
         return children
   }
}
