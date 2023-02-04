/**
 * Stream !== Thread
 */

const fs = require('fs')
const path = require('path')
const http = require('http')

const server = http.createServer((req, res) => {
	const readableStream = fs.createReadStream(path.join(__dirname, 'file.txt'))
	// Readable stream не начинает читать новую порцию данных, пока writable не 
	// закончил читать предыдущую
	readableStream.pipe(res)
})

server.listen(3000, ()=> console.log('success start listening...'))