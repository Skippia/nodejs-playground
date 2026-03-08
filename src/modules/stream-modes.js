/**
 * Stream Modes: Flowing vs Paused
 *
 * All readable streams start in PAUSED mode.
 * You must switch to flowing mode to consume data.
 * Failing to do so will hang the stream (e.g., HTTP request never ends).
 */

const http = require('http')

// ─────────────────────────────────────────────
// The problem: why does commenting out req.on('data') hang the request?
// ─────────────────────────────────────────────

// const server = http.createServer((req, res) => {
//   // req.on('data', chunk => { ... })  ← if commented out, req stays paused
//   req.on('end', () => res.end('done')) // ← never fires! Request hangs.
// })

// ─────────────────────────────────────────────
// FLOWING mode — data is pushed automatically
// ─────────────────────────────────────────────
// Switch to flowing mode via ANY of these:

// Method 1: Register a 'data' event handler
// req.on('data', chunk => { buffer += chunk })

// Method 2: Call pipe()
// req.pipe(writable)

// Method 3: Call resume() (discards data, but triggers 'end')
// req.resume()

// Method 4: Use async iteration (for await...of)
// for await (const chunk of req) { ... }

// ─────────────────────────────────────────────
// PAUSED mode — you pull data manually via read()
// ─────────────────────────────────────────────
// Use the 'readable' event + read() method:
//
// req.on('readable', () => {
//   let chunk
//   while (null !== (chunk = req.read())) {
//     data += chunk
//   }
// })
//
// read() returns null when buffer is empty → 'readable' fires again
// when more data is available. If you stop calling read(), the stream stalls.

// ─────────────────────────────────────────────
// Demo server showing all 4 flowing mode approaches
// ─────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const route = req.url

  if (route === '/data-event') {
    // Approach 1: 'data' event switches to flowing mode
    let body = ''
    req.on('data', chunk => { body += chunk })
    req.on('end', () => res.end(`[data event] received: ${body}\n`))

  } else if (route === '/resume') {
    // Approach 2: resume() — discard body, just get 'end'
    req.resume()
    req.on('end', () => res.end('[resume] request consumed\n'))

  } else if (route === '/readable') {
    // Approach 3: Paused mode with 'readable' + read()
    let body = ''
    req.on('readable', () => {
      let chunk
      while (null !== (chunk = req.read())) {
        body += chunk
      }
    })
    req.on('end', () => res.end(`[readable] received: ${body}\n`))

  } else if (route === '/async-iter') {
    // Approach 4: async iteration (flowing mode)
    ;(async () => {
      let body = ''
      for await (const chunk of req) {
        body += chunk
      }
      res.end(`[async iter] received: ${body}\n`)
    })()

  } else {
    req.resume()
    req.on('end', () => {
      res.end([
        'Stream Modes Demo — POST to these routes:',
        '  /data-event  — flowing via data event',
        '  /resume      — flowing via resume()',
        '  /readable    — paused mode with read()',
        '  /async-iter  — flowing via for-await-of',
        '',
        'Example: curl -X POST -d "hello" http://localhost:3001/data-event',
        ''
      ].join('\n'))
    })
  }
})

server.listen(3001, () => {
  console.log('[stream-modes] Server on http://localhost:3001')
  console.log('Try: curl -X POST -d "hello" http://localhost:3001/data-event')
})
