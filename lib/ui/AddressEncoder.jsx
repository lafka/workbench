import React from 'react'

export class AddressEncoder extends React.Component {
   static get propTypes() {
      return {
         value: React.PropTypes.number.isRequired,
         pretty: React.PropTypes.bool
      }
   }

   static encode(addr, pretty) {
      switch (AddressEncoder.format) {
         case 'hex':
            return AddressEncoder.encodeHex(addr, AddressEncoder.endian, pretty)

         case 'bin':
            return AddressEncoder.encodeBin(addr, AddressEncoder.endian, pretty)

         case 'dec':
         default:
            return AddressEncoder.encodeDec(addr, AddressEncoder.endian)
      }
   }

   static encodeHex(addr, endian, pretty) {
      let parts = [
         (addr >> 24) & 255,
         (addr >> 16) & 255,
         (addr >> 8) & 255,
         (addr >> 0) & 255
      ]

      return ('big' === endian ? parts : parts.reverse()).map(
         (n) => ('0' + n.toString(16)).slice(-2)
      ).join(pretty ? ' : ' : ':')
   }

   static encodeBin(addr, endian, pretty) {
      let parts = [
         (addr >> 24) & 255,
         (addr >> 16) & 255,
         (addr >> 8) & 255,
         (addr >> 0) & 255
      ]

      return ('big' === endian ? parts : parts.reverse()).join(pretty ? ' . ' : '.')
   }

   static encodeDec(addr, endian) {
      if ('little' === endian)
         return ((addr & 0xff) << 24)
                | ((addr & 0xff00) << 8)
                | ((addr >> 8) & 0xff00)
                | ((addr >> 24) & 0xff)

      return addr
   }

   render() {
      let {pretty} = this.props
      return (
         <span className="addr">{AddressEncoder.encode(this.props.value, pretty)}</span>
      )
   }
}

AddressEncoder.format = 'hex'
AddressEncoder.endian = 'big'
