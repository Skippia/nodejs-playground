const path = require('path')


__dirname  //* global variable - abosulute path to current directory
/**
 * Just join paths
 */
path.join(__dirname,'first', 'second'); // /home/lormida/../lessons/first/second

/**
 * Joint paths, but always return abosulute path - works non-stable (depends on slashes)
 */
const fullPath = path.resolve('first', 'second') // /home/lormida/../lessons/first/second
path.parse(fullPath); // {root, dir, base, ext, name}

