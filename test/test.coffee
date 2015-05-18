{checkStream, checkBuffer, checkStreamBuffered} = require '../'

chai = require 'chai'
expect = chai.expect
chai.use require 'chai-as-promised'

{createReadStream, readFile} = require 'fs'

tests = [
	file: 'cat.jpg'
	result: 'image/jpeg'
,
	file: 'pink.png'
	types: ['image/jpeg', 'image/png', 'image/gif']
	result: 'image/png'
,
	file: 'break.mp3'
	result: 'audio/mpeg'
,
	file: 'text.txt'
	types: 'image/jpeg'
	result: null
,
	file: 'empty'
	types: ['image/jpeg', 'image/png', 'image/gif']
	result: null
]

describe "#checkStream()", -> tests.forEach (test) ->
	filename = "#{__dirname}/media/#{test.file}"
	types = test.types ? test.result
	types = [types] unless Array.isArray types

	if test.result
		it "should validate #{test.file} file as #{types}", (done) ->
			stream = createReadStream filename
			checkStream type, stream for type in types
			stream.on 'mimetype', (mime)->
				expect(mime).to.equal test.result
			stream.on 'end', ->
				expect(stream.mimetype).to.equal test.result
				done()
			stream.resume()
	else
		it "should reject #{test.file} file as #{types}", (done) ->
			stream = createReadStream filename
			checkStream type, stream for type in types
			stream.on 'end', ->
				expect(stream.mimetype).to.not.exist
				done()
			stream.resume()

describe "#checkBuffer()", -> tests.forEach (test) ->
	filename = "#{__dirname}/media/#{test.file}"
	types = test.types ? test.result
	types = [types] unless Array.isArray types

	if test.result
		it "should validate #{test.file} file as #{types}", (done) ->
			readFile filename, (err, buffer) ->
				done err if err
				expect checkBuffer test.result, buffer
					.to.equal test.result
				done()
	else
		it "should reject #{test.file} file as #{types}", (done) ->
			readFile filename, (err, buffer) ->
				done err if err
				for type in types
					expect checkBuffer type, buffer
						.to.not.be.ok
				done()

describe "#checkStreamBuffered()", -> tests.forEach (test) ->
	filename = "#{__dirname}/media/#{test.file}"
	types = test.types ? test.result
	types = [types] unless Array.isArray types

	if test.result
		it "should validate #{test.file} file as #{types}", ->
			expect checkStreamBuffered test.result, createReadStream filename
				.to.become test.result
	else
		it "should reject #{test.file} file as #{types}", ->
			expect checkStreamBuffered types[0], createReadStream filename
				.to.be.rejected
