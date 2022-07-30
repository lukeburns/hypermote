const vkey = require('vkey')
const { keyboard, Key } = require('@nut-tree/nut-js')
keyboard.config.autoDelayMs = 0
const Hyperswarm = require('hyperswarm')

async function main () {
  const swarm1 = new Hyperswarm()
  const swarm2 = new Hyperswarm()

  swarm1.on('connection', (conn, info) => {
    process.stdin.pipe(conn)
  })
  swarm2.on('connection', (conn, info) => {
    conn.on('data', data => keyboard.type(data.toString().trim()))
  })

  const topic = Buffer.alloc(32).fill('hello world') // A topic must be 32 bytes
  const discovery = swarm1.join(topic, { server: true, client: false })
  await discovery.flushed()

  swarm2.join(topic, { server: false, client: true })
  await swarm2.flush()
}

main()
