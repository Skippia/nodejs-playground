const cluster = require('cluster')
const os = require('os')

/**
 * If we are in main thread
 */
if (cluster.isMaster) {
  console.log(`Parent thread pid: ${process.pid}`);
  
  /**
   * Create child threads
   */
  for (let i = 0; i < os.cpus().length - 2; i++) {
    cluster.fork()
  }
  /**
   * If thread has gone - create new thread (kill pid - command for killing process)
   */
  cluster.on('exit', worker => {
    console.log(`Worker with pid =${worker.process.pid} has gone`);
    cluster.fork()
  })
} else {
  console.log(`Worker with pid =${process.pid} запущен`);

  setInterval(() => {
    console.log(`Worker with pid = ${process.pid} still is working`);

  }, 5000)
}
