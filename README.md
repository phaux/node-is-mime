# Is Mime

[![Build Status](https://travis-ci.org/phaux/node-is-mime.svg?branch=master)](https://travis-ci.org/phaux/node-is-mime)

Checks whether a buffer, stream or file is a valid MIME type.
Checks known byte offsets for
[magic numbers](https://en.wikipedia.org/wiki/Magic_number_%28programming%29).

# Examples

Checking buffers:

```js
var fs = require('fs')
  , assert = require('assert')
  , isMime = require('is-mime')

fs.readFile(__dirname + '/image.png', function(err, buffer) {
  if (err) throw err

  // simply pass a type and buffer to `checkBuffer`
  // it will return the type string or null
  assert.ok(isMime.checkBuffer('image/png', buffer))
  // type argument can be an array too
})
```

Checking files:

```js
var assert = require('assert')
  , isMime = require('is-mime')
  , types = ['image/jpeg', 'image/png']

isMime.checkFile(types, __dirname + '/image.png')
// returns a Promise for a type string or null
.then(function (mimetype) {
  assert.equal(mimetype, 'image/png')
})
```

Checking streams:

```js
var fs = require('fs')
  , assert = require('assert')
  , isMime = require('is-mime')
  , input, checker

input = fs.createReadStream(__dirname + '/image.jpg')

// checker is a PassThrough stream that emits `mimetype` event
checker = isMime.checkStream(['image/jpeg', 'image/png'])

checker.on('mimetype', function(mimetype) {
  // emitted once it is certain that stream contains
  // one of the provided types

  // argument is the detected mime type
  assert.equal(mimetype, 'image/jpeg')

  // also sets a `mimetype` property on stream object itself
  assert.equal(checker.mimetype, 'image/jpeg')
})

input.pipe(checker)
checker.resume() // discard data
```

Copy a file and print the detected MIME type:

```js
var fs = require('fs')
  , isMime = require('is-mime')

fs.createReadStream(__dirname + '/image.png')
.pipe(
  isMime.checkStream([
    'image/jpeg',
    'image/png',
    'image/gif',
  ])
  .on('mimetype', console.log)
)
.pipe(
  fs.createWriteStream(__dirname + '/image2.png')
  .on('end', function() {
    console.log('Copying finished')
  })
)
```

# Supported MIME types

- image/png
- image/jpeg
- image/gif
- image/webp
- audio/mpeg (MP3)
- audio/ogg (Vorbis, Opus)
- video/webm
- video/mp4
