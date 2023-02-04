const siteURL = 'http://localhost:8080/users?id=5123'

/**
 * {
 *  href : 'http://localhost:8080/users?id=5123', 
 *  origin : 'http://localhost:8080', 
 *  protocol : 'http', 
 *  host : 'localhost:8080', 
 *  hostname : 'localhost', 
 *  port : '8080', 
 *  pathname : '/users', 
 *  search : '?id=5123', 
 *  searchParams: {id => '5123'}
 * }

 */
const url = new URL(siteURL) // 
console.log(url)