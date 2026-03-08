/**
 * Streaming Large JSON Files in Node.js
 *
 * Problem: fs.readFile() or require() loads the entire file into memory.
 *          For large JSON files this causes memory exhaustion.
 * Solution: SAX-like streaming parsers (event-driven, parse-as-you-read).
 *
 * Key concept: SAX (Simple API for XML) — event-driven parsing pattern.
 * Instead of building the full document tree in memory, a SAX parser emits
 * events (onObject, onArray, onString...) as it encounters tokens.
 * Combined with Node.js streams, this gives O(1) memory usage.
 *
 * Library: JSONStream (npm) — built on `jsonparse`, provides pattern matching.
 */

const fs = require('fs')
const path = require('path')

// ─────────────────────────────────────────────
// Setup: create sample JSON files for testing
// ─────────────────────────────────────────────

const listFile = path.join(__dirname, 'sample-list.json')
const nestedFile = path.join(__dirname, 'sample-nested.json')

fs.writeFileSync(listFile, JSON.stringify([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
]))

fs.writeFileSync(nestedFile, JSON.stringify({
  list: [
    { name: 'Item A' },
    { name: 'Item B' }
  ],
  other: [
    { key: 'val' }
  ]
}))

// ─────────────────────────────────────────────
// Approach 1 (BAD): load everything into memory
// ─────────────────────────────────────────────

// const data = JSON.parse(fs.readFileSync(listFile, 'utf8'))
// Works for small files, but for large files (100MB+) → memory spike / OOM.

// ─────────────────────────────────────────────
// Approach 2 (GOOD): stream with JSONStream
// ─────────────────────────────────────────────

// npm install JSONStream
// const JSONStream = require('JSONStream')

// Example 1: Stream each element of a top-level array
// parse('.') emits each array element one at a time.
//
// const readable = fs.createReadStream(listFile, { encoding: 'utf8' })
// const parser = JSONStream.parse('.')
// readable.pipe(parser)
// parser.on('data', item => {
//   console.log('Item:', item) // { id: 1, name: 'Alice' }, then { id: 2, ... }, ...
// })

// Example 2: Extract only a specific nested array
// parse('list.*') emits only elements from the "list" key.
//
// const readable2 = fs.createReadStream(nestedFile, { encoding: 'utf8' })
// const parser2 = JSONStream.parse('list.*')
// readable2.pipe(parser2)
// parser2.on('data', item => {
//   console.log('List item:', item) // { name: 'Item A' }, then { name: 'Item B' }
//   // "other" array is never emitted
// })

// ─────────────────────────────────────────────
// Approach 3: Manual SAX-style with stream + line parsing
// ─────────────────────────────────────────────

// For simple cases (JSON lines / NDJSON format), you can process line-by-line:
const readline = require('readline')
const { Readable } = require('stream')

async function processNDJSON(input) {
  const rl = readline.createInterface({ input })
  for await (const line of rl) {
    if (line.trim()) {
      const obj = JSON.parse(line)
      console.log('[NDJSON]', obj)
    }
  }
}

// Simulate NDJSON input
const ndjson = '{"id":1,"name":"Alice"}\n{"id":2,"name":"Bob"}\n{"id":3,"name":"Charlie"}\n'
const ndjsonStream = Readable.from([ndjson])
processNDJSON(ndjsonStream)

// ─────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────

// • fs.readFile / require() — loads all into memory. Avoid for large files.
// • fs.createReadStream — gives raw chunks, not parsed objects.
// • JSONStream.parse(pattern) — SAX-based, streams parsed objects with pattern matching.
// • NDJSON (newline-delimited JSON) — simplest format for streaming JSON records.
// • For production: consider JSONStream, stream-json, or BFJ (Big-Friendly JSON).

console.log('\n[json-stream] Sample files created at:', listFile, nestedFile)
console.log('[json-stream] Uncomment JSONStream examples after: npm install JSONStream')
