# Is Mime

Checks whether a buffer or stream is a valid MIME type.
Checks known byte offsets for
[magic numbers](https://en.wikipedia.org/wiki/Magic_number_%28programming%29).

## Examples

Checking streams:

```js
var fs = require('fs')
  , isMime = require('is-mime')
  , stream = fs.createReadStream(__dirname + '/image.jpg')

// TODO allow passing an array of types
isMime.checkStream('image/jpeg', stream)
isMime.checkStream('image/png', stream)

stream.on('mimetype', function(mimetype) {
	// emitted when it is certain that stream contains type
	// usually after few first `data` events

	// argument is the detected mime type
	assert.equal(mimetype, 'image/jpeg')

	// also sets a `mimetype` property on stream object itself
	assert.equal(stream.mimetype, 'image/jpeg')
})

// use the stream like you would normally
// here we just discard the data
stream.resume()
```

Checking buffers:

```js
var fs = require('fs')
  , isMime = require('is-mime')

fs.readFile(__dirname + '/image.png', function(err, buffer) {
	if (err) throw err

	// simply pass a type and buffer to `checkBuffer`
	// it will return the type string or null
	assert.ok(isMime.checkBuffer('image/png', buffer))
})
```

## Supported MIME types

- image/png
- image/jpeg
- image/gif
- image/webp
- audio/mpeg (MP3)
- audio/ogg (Vorbis, Opus)
- video/webm
- video/mp4

## API

TODO
