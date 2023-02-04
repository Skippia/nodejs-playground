const path = require('path')

__dirname  //* global variable - absolute path to current directory

/**
 * Just join paths use OS-specific separator
 * Returns absolute or relative path
 */
path.join("dir", "subdir", "file.txt"); // 'dir/subdir/file.txt'
path.join("/dir", "subdir", "file.txt"); // '/dir/subdir/file.txt'
path.join(__dirname, "subdir", "file.txt");
// '/home/skippy/CURRENT_PROJECTS/[playgrounds]/nodejs-playground/src/modules/subdir/file.txt'

/**
 * Joins paths, but always return absolute path starting from current directory
 * Works from right to left, stops when find absolute path and ignores left segments
 */
path.resolve("dir", "subdir", "file.txt"); 
// '/home/skippy/CURRENT_PROJECTS/[playgrounds]/nodejs-playground/dir/subdir/file.txt'
path.resolve(__dirname, "subdir", "file.txt");
// '/home/skippy/CURRENT_PROJECTS/[playgrounds]/nodejs-playground/src/modules/subdir/file.txt'
path.resolve(__dirname, "/subdir", "file.txt"); // /subdir/file.txt
path.resolve("dir", "subdir", "/abs", "file.txt"); // '/abs/file.txt'
path.resolve("/dir", "subdir", "/abs", "file.txt"); // '/abs/file.txt'

// path.parse(fullPath); // {root, dir, base, ext, name}

console.log(a)
