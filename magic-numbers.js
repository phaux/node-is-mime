module.exports = {

  // PNG
  'image/png': {
    data: Buffer([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]),
  },

  // JPG
  'image/jpeg': {
    data: Buffer([0xFF,0xD8]),
  },

  // GIF
  'image/gif': {
    data: Buffer('GIF'),
  },

  // WebP
  'image/webp': {
    data: Buffer('RIFF'),
  },

  // MP3
  'audio/mpeg': {
    data: [
      Buffer([0xFF, 0xFB]),
      Buffer('ID3'),
    ],
  },

  // OGG, OGV, Opus
  'video/ogg': {
    data: Buffer('OggS'),
  },
  'audio/ogg': {
    data: Buffer('OggS'),
  },

  // WebM
  'video/webm': {
    data: Buffer([0x1A,0x45,0xDF,0xA3]),
  },

  // MP4
  'video/mp4': {
    offset: 4,
    data: Buffer('ftyp'),
  },

}
