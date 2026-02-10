const dotenv = require('dotenv')

dotenv.config()

// Variable from .env
console.log(process.env.PORT)
// Variable from cross-env running parameter
console.log(process.env.NODE_ENV)

// for example npm run proccess hello ->
/**
 * [
 *  '/usr/bin/node',
 *  '/home/lormida/.../lessons/process.env',
 *  'hello'
 * ]
 */
console.log(process.argv);
