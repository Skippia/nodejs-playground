/**
 * Stream Copy — implementing pipe() with async iterators
 *
 * Goal: copy data from a readable to a writable stream,
 * handling backpressure correctly, using async iterators.
 *
 * This is what pipe() does internally, but we implement it manually
 * to understand the mechanics.
 */

const fs = require('fs')
const path = require('path')

// ─────────────────────────────────────────────
// 1. Helper: write with backpressure handling
// ─────────────────────────────────────────────

/**
 * Writes a chunk to the writable stream.
 * If the internal buffer is full (write returns false),
 * waits for 'drain' before resolving.
 */
function _write(dest, chunk) {
  return new Promise(resolve => {
    if (dest.write(chunk)) {
      return resolve()
    }
    // Buffer full — wait until it's drained
    dest.once('drain', resolve)
  })
}

// ─────────────────────────────────────────────
// 2. Stream copy using async iterators
// ─────────────────────────────────────────────

/**
 * Copies data from src (readable) to dest (writable).
 * Uses for-await-of to read chunks and _write() to handle backpressure.
 *
 * Readable streams implement Symbol.asyncIterator, so we can iterate
 * over them directly. Each iteration yields the next available chunk.
 * If the writable's buffer is full, `await _write()` pauses the loop
 * until the buffer drains — this is backpressure in action.
 */
async function streamCopy(src, dest) {
  try {
    for await (const chunk of src) {
      await _write(dest, chunk)
    }
    dest.end()
  } catch (err) {
    dest.destroy(err)
    throw err
  }
}

// ─────────────────────────────────────────────
// 3. Demo
// ─────────────────────────────────────────────

;(async () => {
  const srcPath = path.join(__dirname, 'text.txt')
  const destPath = path.join(__dirname, 'text-copy.txt')

  const readable = fs.createReadStream(srcPath)
  const writable = fs.createWriteStream(destPath)

  await streamCopy(readable, writable)
  console.log('[stream-copy] Copied', srcPath, '→', destPath)

  // Compare with the built-in approach:
  // readable.pipe(writable)
  // or: await pipeline(readable, writable)
  //
  // Both do the same thing, but with better error handling
  // and stream lifecycle management.
})()
