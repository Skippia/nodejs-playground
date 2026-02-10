const fs = require('fs')
/**
 * В новых версиях ноды 
 */
// const fsPromise = require('fs/promises')
const path = require('path')

function promisify(fn) {
  return (...args) => {
    return new Promise((res, rej) => {
      fn(...args, (err, data) => {
          if (err) {
            rej(err)
            return
          }
          res(data)
      })
    })
  }

}

const promiseAppendFile = promisify(fs.appendFile)
const writeFilePromise = promisify(fs.writeFile)

writeFilePromise(path.join(__dirname, 'text.txt'), 'data')
  .then(() => promiseAppendFile(path.join(__dirname, 'text.txt'),'\n123'))
  .then(() => promiseAppendFile(path.join(__dirname, 'text.txt'),'\n456'))
  .then(() => promiseAppendFile(path.join(__dirname, 'text.txt'),'\n789'))
  .catch(e => console.log('Catch some error!', e))



/* fs.mkdir(path.resolve(__dirname, 'dir', 'dir2'), {recursive: true}, (err)=> {
  if (err) {
    console.log(err)
    return
  }

  console.log('Success!');

}) */


