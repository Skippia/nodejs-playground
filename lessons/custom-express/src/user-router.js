const Router = require('../framework/Router')
const userController = require('./user-controller')


const userEndpointsMap = {
  '[/getUsers]:[GET]': userController.getUsers,
}

const userRouter = new Router(userEndpointsMap)

module.exports = userRouter