/**
 * Floating-Point Precision & BigInt in JavaScript/Node.js
 *
 * IEEE 754 double-precision: 52-bit mantissa → safe integer range is
 * [-(2^53 - 1), 2^53 - 1], i.e. Number.MIN_SAFE_INTEGER to Number.MAX_SAFE_INTEGER.
 */

// ─────────────────────────────────────────────
// 1. The classic precision problem
// ─────────────────────────────────────────────

console.log('0.1 + 0.2 =', 0.1 + 0.2) // 0.30000000000000004

console.log('MAX_SAFE_INTEGER:', Number.MAX_SAFE_INTEGER)  // 9007199254740991
console.log('2^53:           ', Math.pow(2, 53))           // 9007199254740992

// Large integers silently lose precision:
const num = 200000436035958034
console.log('Lost precision: ', num) // 200000436035958050 (!)

// ─────────────────────────────────────────────
// 2. JSON.parse also loses precision for large numbers
// ─────────────────────────────────────────────

const jsonStr = '{"id": 200000436035958034}'
const parsed = JSON.parse(jsonStr)
console.log('JSON.parse id:  ', parsed.id) // 200000436035958050 (wrong!)
// JSON spec encodes values as `number` type → same JS precision limits apply.

// ─────────────────────────────────────────────
// 3. BigInt — native support for arbitrary-precision integers
// ─────────────────────────────────────────────

// Two ways to create:
const a = 200000436035958034n          // literal syntax
const b = BigInt('200000436035958034') // from string (preferred for safety)

console.log('BigInt literal: ', a) // 200000436035958034n
console.log('BigInt(string): ', b) // 200000436035958034n

// GOTCHA: BigInt(number) still loses precision because the number is parsed first!
const bad = BigInt(200000436035958034)
console.log('BigInt(number): ', bad) // 200000436035958048n — WRONG

// Type checking
console.log('typeof bigint:  ', typeof a) // 'bigint'
console.log('1n === 1:       ', 1n === 1) // false

// Arithmetic — never mix BigInt and Number
console.log('BigInt math:    ', a + 1n)   // 200000436035958035n
// a + 1 → TypeError: Cannot mix BigInt and other types

// Conversion to string
console.log('toString:       ', String(a)) // '200000436035958034'

// ─────────────────────────────────────────────
// 4. BigInt & JSON — the conflict
// ─────────────────────────────────────────────

// JSON.parse('{"id": 200000436035958034n}') → SyntaxError
// JSON spec doesn't support BigInt notation.
// JSON.stringify with BigInt also throws: TypeError: BigInt value can't be serialized

// Solutions:
// (a) Return large IDs as strings from the backend (simplest).
// (b) Use `json-bigint` library for parsing:
//
//   const JSONbig = require('json-bigint')({ storeAsString: true })
//   const obj = JSONbig.parse('{"id": 200000436035958034}')
//   console.log(obj.id) // '200000436035958034' (string, no precision loss)

// ─────────────────────────────────────────────
// 5. Practical summary
// ─────────────────────────────────────────────

// • Always check if your numbers exceed Number.MAX_SAFE_INTEGER
// • Prefer BigInt('string') over BigInt(number)
// • For JSON interop with large numbers, use json-bigint or send as strings
// • BigInt is supported in Node.js 12+ and all modern browsers
