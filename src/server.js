const http = require('http')
const fs = require('fs')
const path = require('path')

/**
 * Req is readable stream from client
 * Res is writable stream on the server (which will be returned to the client)
 * Res is stream, when we call res.end() - we close this stream and return it to the client
 */

const server = http.createServer((req, res) => {
	if (req.method === 'POST') {
		const body = []
		res.writeHead(200, {
			'Content-Type': 'text/html; charset=utf-8'
		})
		
		req.on('data', data => {
		body.push(Buffer.from(data))
		})

		req.on('end', () => {
			const message = body.toString().split('=')[1]

			res.end(`<h1> Ваше сообщение: ${message} </h1>`)
		})
	}
	else if (req.method === 'GET') {
		if (req.url == '/home') {
			res.writeHead(200, {
				'Content-Type': 'text/html'
			})
			res.end(`<h1> Hello from Node.js </h1>`)
		}
		else if (req.url === '/about') {
			fs.readFile(path.join(__dirname, 'about.html'), 'utf-8',
				(err, content) => {
					if (err) throw err
					res.end(content)
				})
		}
		else {
			res.writeHead(404)
			res.end('Page not found')
		}
	}
})


server.listen(3000, () => {
	console.log('Server is running on port 3000...')
})
