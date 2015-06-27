var refEntries = require('./magic-numbers')
  , btools = require('buffertools')
  , PassThrough = require('stream').PassThrough

function checkStream(mimes) {

  var stream   = new PassThrough()
    , checkers = []

  // force it to be array
  mimes = [].concat(mimes)

  mimes.forEach(function(mime) {

    if (!(mime in refEntries))
      throw Error("Unsupported mime type: " + mime)

    // TODO allow functions as checkers
    var refEntry = refEntries[mime]
      , refBuffs = refEntry.data

    refBuffs = [].concat(refBuffs)

    refBuffs.forEach(function(refBuff) {
      checkers.push({
        mime:   mime,
        buffer: refBuff,
        offset: refEntry.offset || 0,
        length: refBuff.length,
      })
    })

  })

  var chunk  = Buffer(0)
    , minLen = 0

  // compute the number of first bytes required to buffer
  checkers.forEach(function(checker) {
    var len = checker.offset + checker.length
    if (len > minLen) minLen = len
  })

  stream.on('data', checkerFn)

  function checkerFn(data) {
    chunk = Buffer.concat([chunk, data])
    if (chunk.length >= minLen) {
      stream.removeListener('data', checkerFn)
      var result = null
      checkers.forEach(function(checker) {
        var slice = chunk.slice(checker.offset, checker.length)
        if (btools.equals(slice, checker.buffer)) {
          result = checker.mime
        }
      })
      if (result) {
        stream.mimetype = result
        stream.emit('mimetype', result)
      }
    }
  }

  return stream

}

function checkBuffer(mimes, buffer) {

  var checkers = []

  // force it to be array
  mimes = [].concat(mimes)

  mimes.forEach(function(mime) {

    if (!(mime in refEntries))
      throw Error("Unsupported mime type: " + mime)

    // TODO allow functions as checkers
    var refEntry = refEntries[mime]
      , refBuffs = refEntry.data

    refBuffs = [].concat(refBuffs)

    refBuffs.forEach(function(refBuff) {
      checkers.push({
        mime:   mime,
        buffer: refBuff,
        offset: refEntry.offset || 0,
        length: refBuff.length,
      })
    })

  })

  var minLen = 0

  // compute the minimum buffer size
  checkers.forEach(function(checker) {
    var len = checker.offset + checker.length
    if (len > minLen) minLen = len
  })

  var result = null
  if (buffer.length >= minLen) {
    checkers.forEach(function(checker) {
      var slice = buffer.slice(checker.offset, checker.length)
      if (btools.equals(slice, checker.buffer)) {
        result = checker.mime
      }
    })
  }

  return result

}

module.exports = {
  checkStream: checkStream,
  checkBuffer: checkBuffer,
}
