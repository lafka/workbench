import React from 'react'
import {Buffer} from 'buffer'
import _ from 'lodash'

import {Terminal} from '../../../ui'

let usage = `
usage: "string" | [ 1 10 100 255 ] | < 00 1a ff >, type help for more info
`

let help = `
Online terminal emulator

This terminal enables you to communicate with the serial port of a
Tinymesh device. Each payload will be packed as a Tinymesh packet and
sent to the device. The terminal supports the following formats:

 1. "quoted string" - sends an ascii string
 2. [0, 1, 2, 3, 4] - sends a byte array each item is a decimal
 3. <01 ab cd ff>   - sends a byte array each item is a hex number
 4. "trigger" <0a>  - combine any of the above

Commands:
  - help          - shows this text
  - usage         - shows usage
  - send \`data\`   - send data to device

`

let asHex = function(input) {
   var processed = input
    .split(/\s+/)
    .map(function(v) {
      return v ? ("0" + v).slice(-1 * v.length - (v.length % 2)) : '';
    })
    .join('')

  if (isNaN(parseInt(processed)))
    return {error: "invalid hex input"}

  return new Buffer(processed, "hex")
}

let asBin = function(input) {
  var err = undefined

  var processed = input
    .split(/\s+/)
    .reduce(function(acc, n) {
      if ('' === n)
        return acc

      var num = parseInt(n)

      if (isNaN(num && !err)) {
        err = {error: 'invalid number `' + n + '` in byte array', pos: -1}
      } else if (num > 255 || num < 0 && !err) {
        err = {error: 'invalid byte `' + n + ', out of range 0..255', pos: -1}
      } else {
        acc.push(num)
      }

      return acc
    }, [])

  return err || new Buffer(processed)
}

let asAscii = function(input) {
  input = input
    .replace(/\\0/g, "\0")
    .replace(/\\\\/g, "\\")
    .replace(/\\a/g, "\a")
    .replace(/\\t/g, "\t")
    .replace(/\\n/g, "\n")
    .replace(/\\v/g, "\v")
    .replace(/\\f/g, "\f")
    .replace(/\\r/g, "\r")

  return new Buffer(input)
}

let parseData = function(input, pos, acc) {
   let head, rest, p, parts, res

   pos = pos || 0

   acc = acc || new Buffer("")

   if (!input)
     return acc

   let input2 = _.trimLeft(input)
   pos += input.length - input2.length // preserve spaces for pos

   head = input2[0]
   rest = input2.slice(1)

   parts = rest.split(pairs[head])
   pos += parts[0].length + 1

   if (undefined === parts[1])
     return {error: "expected a `" + pairs[head] + "`", pos: pos + 1}

   res = parseAs[head](parts[0])
   parts.shift()

   rest = parts.join(pairs[head])
   return res.error
      ? res
      : parseData(rest, pos + 1, Buffer.concat([acc, res]))
}

let shipData = function(res) {
   return res
}


let commands = {
   "usage": () => usage,
   "help":  () => help,
   "send":  (input, trimmed) => shipData(parseData(input, trimmed))
}

let
   parseAs = {
    '<': asHex,
    '[': asBin,
     '"': asAscii,
    '\'': asAscii
   },
   pairs = {
    '<': '>',
    '[': ']',
    '"': '"',
    '\'': '\''
   },
   handle = function(input) {
      let head, p, command, trimmed

      let input2 = _.trimLeft(input)
      trimmed = input.length - input2.length // preserve spaces for pos

      head = input2[0]

      command = (input2.split(/ /) || [])

      if (!pairs[head] && !commands[command[0]]) {
        p = _.map(pairs, (t) => "`" + t + "`").join(', ')
        return {error: "expected a command OR one of " + p + '. Got `' + head + '`', pos: trimmed}
      } else if (commands[command[0]]) {
        trimmed += command[0].length + 1
        return commands[command[0]](command.slice(1), trimmed)
      } else {
        return commands["send"](input2, trimmed)
      }
   }

let formatter = function(line) {
   if (line.error) {
      let buf = "! Error: " + line.error
      if (line.pos) {
        buf += " (char: " + line.pos + ")"
      }

      return buf
   }

   return Buffer.isBuffer(line) ? line.toString() : line
}


export class SerialConsole extends React.Component {
  render() {
    let
      cmds = { }

    return <Terminal
      body={[usage]}
      commands={cmds}
      formatter={formatter}
      handle={handle}
      height={20}
      {...this.props} />
  }
}