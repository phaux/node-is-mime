var magicNumbers = require('./magic-numbers')
  , Promise = Promise || require('promise')
  , concat = require('concat-stream')
  , btools = require('buffertools')

function checkStream(mime, stream) {

	if (!(mime in magicNumbers))
		throw Error("Unsupported mime type: " + mime)

	var ref      = magicNumbers[mime]
	  , refBuffs = ref.data
	  , offset   = ref.offset || 0
	  , chunkSz  = 0
	  , chunk    = Buffer(0)

	if (!Array.isArray(refBuffs)) refBuffs = [refBuffs]

	refBuffs.forEach(function(refBuff) {
		if (refBuff.length > chunkSz) chunkSz = refBuff.length
	})

	stream.on('data', checker)

	function checker(data) {
		chunk = Buffer.concat([chunk, data])
		if (chunk.length >= offset + chunkSz) {
			stream.removeListener('data', checker)
			var ok = false
			refBuffs.forEach(function(refBuff) {
				var slice = chunk.slice(offset, refBuff.length)
				if (btools.equals(slice, refBuff)) {
					ok = true
				}
			})
			if (ok) {
				stream.mimetype = mime
				stream.emit('mimetype', mime)
			}
		}
	}

}

function checkBuffer(mime, buffer) {

	if (!(mime in magicNumbers))
		throw Error("Unsupported mime type: " + mime)

	var ref      = magicNumbers[mime]
	  , refBuffs = ref.data
	  , offset   = ref.offset || 0
	  , chunkSz  = 0
	  , ok       = false

	if (!Array.isArray(refBuffs)) refBuffs = [refBuffs]

	refBuffs.forEach(function(refBuff) {
		if (refBuff.length > chunkSz) chunkSz = refBuff.length
	})

	if (buffer.length >= offset + chunkSz) {
		refBuffs.forEach(function(refBuff) {
			var slice = buffer.slice(offset, refBuff.length)
			if (btools.equals(slice, refBuff)) {
				ok = true
			}
		})
	}

	if (!ok) return false
	return mime

}

function checkStreamBuffered(mime, stream, cb) {
	var p = new Promise(function(resolve, reject) {
		stream.pipe(concat(function(buffer) {
			if (checkBuffer(mime, buffer)) {
				resolve(mime)
			}
			else {
				reject(Error("Stream is not valid " + mime))
			}
		}))
	})
	if (typeof cb === 'function') {
		p.then(function() {
			cb(null, mime)
		}, function(err) {
			cb(err)
		})
	}
	else {
		return p
	}
}

module.exports = {
	checkStream: checkStream,
	checkBuffer: checkBuffer,
	checkStreamBuffered: checkStreamBuffered,
}
