const Emitter = require('events')

/**
 * When is convenient to use?
 *  - http
 *  - websockets
 *  - long pulling
 *  - clusters
 */

const emitter = new Emitter()

/**
 * on | once | removeListener(event, calllback) | removeAllListeners()
 */
emitter.on('message', (data, second, third) => {
  console.log(`${data} | ${second} | ${third}`);
})


setTimeout(() => {
  emitter.emit('message', 'some data', 'second arg', 'third arg')
}, 2000)