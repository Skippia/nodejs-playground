const { MongoClient, ServerApiVersion } = require('mongodb');
const userRouter = require('./src/user-router')
const Application = require('./framework/Application')

const PORT = 3000

const app = new Application()


app.addRouter(userRouter)

app.initRoutes()

const start = async () => {
  await connectDB()
  app.listen(PORT, () => console.log('Start server on port 3000'))
}



async function connectDB() {
  const uri = "mongodb+srv://lormida:midapa24@cluster0.oien5qs.mongodb.net/test";
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

  try {
    await client.connect()
    console.log('Success connection...')
  } catch (e) {
    throw e
  }
}
start()