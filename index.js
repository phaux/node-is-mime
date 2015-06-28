var refEntries = require('./magic-numbers')
  , bufferEq = require('buffer-equal')
  , PassThrough = require('stream').PassThrough
  , Promise = require('promise')
  , fs = require('fs')

function checkBuffer(mimes, buffer) {

  var checkers = []

  mimes = [].concat(mimes)

  mimes.forEach(function (mime) {

    if (!(mime in refEntries)) return

    // TODO allow functions as checkers
    var refEntry = refEntries[mime]
      , refBuffs = refEntry.data

    refBuffs = [].concat(refBuffs)

    refBuffs.forEach(function (refBuff) {

      checkers.push({
        mime:   mime,
        buffer: refBuff,
        offset: refEntry.offset || 0,
        length: refBuff.length,
      })

    })

  })

  var result = null

  checkers.forEach(function (checker) {

    var slice

    if (buffer.length >= checker.offset + checker.length) {
      slice = buffer.slice(checker.offset, checker.length)
      if (bufferEq(slice, checker.buffer)) result = checker.mime
    }

  })

  return result

}

function checkStream(mimes) {

  var stream   = new PassThrough()
    , chunk    = Buffer(0)

  stream.on('data', checkerFn)

  function checkerFn(data) {

    chunk = Buffer.concat([chunk, data])

    if (chunk.length >= 32) {

      stream.removeListener('data', checkerFn)

      var mime = checkBuffer(mimes, chunk)
      stream.mimetype = mime
      if (mime) stream.emit('mimetype', mime)

    }

  }

  return stream

}

function checkFile(mimes, file) {
  return new Promise(function (fulfill, reject) {

    fs.open(file, 'r', function (err, fd) {

      if (err) return reject(err)

      var buffer = new Buffer(32)

      fs.read(fd, buffer, 0, 32, 0, function (err) {

        if (err) return reject(err)
        var result = checkBuffer(mimes, buffer)
        fulfill(result)

      })

    })
    
  })
}

module.exports = {
  checkBuffer: checkBuffer,
  checkStream: checkStream,
  checkFile:   checkFile,
}
