const http = require('http')
const Emitter = require('events')
/**
 * router = {
 *  [/getAllUsers]:[GET] : callback
 * }
 */
module.exports = class Application {

  constructor(){
    this.router = []
    this.server = http.createServer((req, res) => {
      console.log('try to generate fake event....');
      this.emitter.emit('[/getUsers]:[GET]', req, res)
    })
    this.emitter = new Emitter()
  }

  listen(port, callback){
    return this.server.listen(port, callback)
  }

  addRouter(newRouter) {
    this.router.push(newRouter)
  }

  initRoutes(){
    this.router.forEach(router => {
      const _router = router.endpointsMap
      
        Object.keys(_router).forEach(maskEvent => {
          console.log(_router);
          this.emitter.on(maskEvent, _router[maskEvent])
        })
    })
  }

}