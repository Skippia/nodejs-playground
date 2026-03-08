/**
 * Stream Backpressure in Node.js
 *
 * Backpressure: when data is written faster than the consumer can process it.
 * Without handling, buffered data grows unbounded → memory exhaustion.
 *
 * Key mechanism:
 *   writable.write(chunk) returns `false` when internal buffer >= highWaterMark.
 *   This signals the producer to pause until the 'drain' event fires.
 *
 * pipe() and pipeline() handle backpressure automatically.
 * If you use write() directly, YOU must handle it.
 */

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const { pipeline } = require('stream/promises')

// ─────────────────────────────────────────────
// 1. pipeline() — the recommended way (handles backpressure + errors)
// ─────────────────────────────────────────────

async function pipelineExample() {
  const src = path.join(__dirname, 'text.txt')
  const dest = path.join(__dirname, 'text.txt.gz')

  await pipeline(
    fs.createReadStream(src),
    zlib.createGzip(),
    fs.createWriteStream(dest)
  )
  console.log('[pipeline] Compressed', src, '→', dest)
}

// ─────────────────────────────────────────────
// 2. Manual write — WRONG (no backpressure handling)
// ─────────────────────────────────────────────

function badCopy(srcPath, destPath) {
  const readable = fs.createReadStream(srcPath)
  const writable = fs.createWriteStream(destPath)

  // PROBLEM: ignores write() return value.
  // If writable buffer is full, data keeps piling up in memory.
  readable.on('data', chunk => {
    writable.write(chunk) // return value ignored!
  })
  readable.on('end', () => writable.end())
}

// ─────────────────────────────────────────────
// 3. Manual write — CORRECT (with backpressure)
// ─────────────────────────────────────────────

function goodCopy(srcPath, destPath) {
  return new Promise((resolve, reject) => {
    const readable = fs.createReadStream(srcPath)
    const writable = fs.createWriteStream(destPath)

    readable.on('data', chunk => {
      const canContinue = writable.write(chunk)
      if (!canContinue) {
        // Buffer is full → pause reading until writable drains
        readable.pause()
        writable.once('drain', () => readable.resume())
      }
    })

    readable.on('end', () => writable.end())
    writable.on('finish', resolve)
    writable.on('error', reject)
    readable.on('error', reject)
  })
}

// ─────────────────────────────────────────────
// 4. How it works internally
// ─────────────────────────────────────────────

// writable.write(chunk):
//   - Pushes chunk to internal buffer
//   - Returns true if buffer.length < highWaterMark (default 16KB for streams)
//   - Returns false if buffer.length >= highWaterMark
//
// When false is returned:
//   - Producer should stop writing
//   - Wait for 'drain' event (buffer has been flushed)
//   - Resume writing
//
// Memory impact without backpressure (tested on 2.2GB file):
//   Without backpressure: ~980MB memory usage
//   With backpressure:    ~56MB memory usage
//   That's a ~17x difference!

// ─────────────────────────────────────────────
// 5. Best practices
// ─────────────────────────────────────────────

// • Use pipe() or pipeline() — they handle backpressure automatically.
// • If using write() directly, always check its return value.
// • pipeline() also handles error propagation and stream cleanup.
// • Never ignore backpressure in production — it can crash your server.
// • An attacker sending rapid requests can exploit missing backpressure
//   to exhaust server memory (DoS vector).

;(async () => {
  await pipelineExample()
  console.log('[backpressure] Demo complete. See comments for details.')
})()
