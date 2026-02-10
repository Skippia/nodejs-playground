const os = require('os')

console.log(os.platform);
console.log(os.arch());
console.log(os.cpus().length)

const cpus = os.cpus()

/**
 * Можем распараллелить задачи
 */
for (let i = 0; i < cpus.length - 2; i++) {
  const coreCPU = cpus[i]
  console.log('Run one more node.js process', coreCPU);
}

