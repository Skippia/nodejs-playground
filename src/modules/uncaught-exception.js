/**
 * Handling Uncaught Exceptions in Node.js
 *
 * Node.js runs on a single process. An uncaught exception crashes it,
 * killing all in-flight requests. Graceful shutdown is essential.
 *
 * Two key events:
 *   process.on('uncaughtException', handler)  — sync throws
 *   process.on('unhandledRejection', handler) — unhandled Promise rejections
 */

const http = require('http')

// ─────────────────────────────────────────────
// 1. The problem: unhandled error crashes the process
// ─────────────────────────────────────────────

// Without any error handling:
//   GET /error → ReferenceError → process crashes → all other requests fail

// ─────────────────────────────────────────────
// 2. graceful() — a shutdown helper
// ─────────────────────────────────────────────

function graceful(options = {}) {
  const killTimeout = options.killTimeout || 30_000
  const onError = options.onError || (() => {})
  const servers = options.servers || []

  const throwCount = { uncaughtException: 0, unhandledRejection: 0 }

  process.on('uncaughtException', error => {
    throwCount.uncaughtException++
    onError(error, 'uncaughtException', throwCount.uncaughtException)
    if (throwCount.uncaughtException > 1) return
    shutdown(servers, killTimeout)
  })

  process.on('unhandledRejection', error => {
    throwCount.unhandledRejection++
    onError(error, 'unhandledRejection', throwCount.unhandledRejection)
    if (throwCount.unhandledRejection > 1) return
    shutdown(servers, killTimeout)
  })
}

function shutdown(servers, killTimeout) {
  // Stop accepting new connections, set Connection: close on in-flight requests
  for (const server of servers) {
    if (server instanceof http.Server) {
      server.on('request', (req, res) => {
        req.shouldKeepAlive = false
        res.shouldKeepAlive = false
        if (!res.headersSent) {
          res.setHeader('Connection', 'close')
        }
      })
    }
  }

  // Give existing requests time to finish, then exit
  const timer = setTimeout(() => process.exit(1), killTimeout)
  if (timer.unref) timer.unref()
}

// ─────────────────────────────────────────────
// 3. Demo server
// ─────────────────────────────────────────────

const PORT = 3002

const server = http.createServer((req, res) => {
  if (req.url === '/error') {
    // This will throw ReferenceError (a is not defined)
    // Without graceful(), this crashes the entire process.
    // With graceful(), the error is caught, logged, and the server
    // continues serving existing requests before shutting down.
    const result = undefinedVariable.property // intentional error
    res.end(result)
  } else {
    // Simulate a slow response
    setTimeout(() => res.end('OK\n'), 3000)
  }
})

server.listen(PORT, () => {
  console.log(`[uncaught-exception] Server on http://localhost:${PORT}`)
  console.log('Try in two terminals:')
  console.log('  Terminal 1: curl http://localhost:3002       (slow response)')
  console.log('  Terminal 2: curl http://localhost:3002/error (triggers crash)')
  console.log('Without graceful(), Terminal 1 would fail. With it, Terminal 1 completes.')
})

// Register graceful shutdown
graceful({
  servers: [server],
  killTimeout: 15_000,
  onError: (error, type, count) => {
    console.error(`[${new Date().toISOString()}] [pid:${process.pid}] [${type} #${count}]`, error.message)
  }
})

// ─────────────────────────────────────────────
// Best practices
// ─────────────────────────────────────────────

// • uncaughtException / unhandledRejection are LAST RESORT handlers.
//   Always try-catch and .catch() your code properly first.
// • After an uncaught exception, the process is in an unknown state.
//   Graceful shutdown = finish existing work, then EXIT. Don't try to continue.
// • In production, use a process manager (PM2, systemd, Kubernetes)
//   that auto-restarts crashed processes.
// • For clusters: when a worker catches an uncaught exception,
//   disconnect it and let the master fork a replacement.
// • Consider the npm `graceful` package for production use.
