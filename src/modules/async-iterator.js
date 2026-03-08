/**
 * Async Iterators in Node.js
 *
 * Symbol.asyncIterator is supported by core modules (Stream, Events)
 * and some third-party modules (e.g. mongodb).
 * for await...of lets you consume async data sources elegantly.
 */

const { on, EventEmitter } = require('events')
const fs = require('fs')
const path = require('path')
const stream = require('stream')

// ─────────────────────────────────────────────
// 1. events.on() — returns an async iterable over event emissions
// ─────────────────────────────────────────────

async function eventsOnExample() {
  const ee = new EventEmitter()
  const iter = on(ee, 'foo')

  process.nextTick(() => {
    ee.emit('foo', 'Hello')
    ee.emit('error', new Error('something went wrong'))
    ee.emit('foo', 'World') // never reached
  })

  try {
    for await (const [value] of iter) {
      console.log('[events.on]', value) // 'Hello'
    }
  } catch (err) {
    console.log('[events.on] caught:', err.message)
  }
}

// NOTE: for await...of processes events sequentially (one at a time).
// The loop blocks on each iteration, so it's NOT suitable for concurrent handling.
// Example: using events.on() for an HTTP server would serialize all requests!

// ─────────────────────────────────────────────
// 2. Readable streams as async iterables
// ─────────────────────────────────────────────

async function readableAsyncIterExample() {
  // Old way: listen to 'data' + 'end' events, concatenate chunks manually.
  // New way: for await...of — much cleaner.

  const readable = fs.createReadStream(path.join(__dirname, 'text.txt'), {
    encoding: 'utf-8',
    highWaterMark: 16 // small buffer to see chunking
  })

  let data = ''
  for await (const chunk of readable) {
    data += chunk
  }
  console.log('[readable async iter] file content:', data.trim())

  // Under the hood, Readable.prototype[Symbol.asyncIterator] is an async
  // generator that calls stream.read() in a loop, yielding chunks.
  // If break/throw terminates the loop, the stream is automatically destroyed.
}

// ─────────────────────────────────────────────
// 3. Readable.from() — create readable from any iterable
// ─────────────────────────────────────────────

async function readableFromExample() {
  // Any sync/async iterable can become a readable stream
  async function* generateNumbers() {
    for (let i = 1; i <= 5; i++) {
      yield String(i)
    }
  }

  const readable = stream.Readable.from(generateNumbers())
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(chunk)
  }
  console.log('[Readable.from]', chunks) // ['1', '2', '3', '4', '5']
}

// ─────────────────────────────────────────────
// 4. Piping async iterables to writable streams via pipeline
// ─────────────────────────────────────────────

async function pipelineWithGeneratorExample() {
  const { pipeline } = require('stream/promises')

  async function* source() {
    yield 'line1\n'
    yield 'line2\n'
    yield 'line3\n'
  }

  const dest = path.join(__dirname, 'async-iter-output.txt')
  await pipeline(
    stream.Readable.from(source()),
    // Transform step: generator functions can be used as transforms
    async function* (src) {
      for await (const chunk of src) {
        yield chunk.toString().toUpperCase()
      }
    },
    fs.createWriteStream(dest)
  )
  console.log('[pipeline] wrote transformed data to', dest)
}

// ─────────────────────────────────────────────
// Run all examples
// ─────────────────────────────────────────────

;(async () => {
  await eventsOnExample()
  await readableAsyncIterExample()
  await readableFromExample()
  await pipelineWithGeneratorExample()
})()
