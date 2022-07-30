const path = require('path')
const Hyperswarm = require('hyperswarm')
const { app, BrowserWindow, ipcMain } = require('electron')
const { keyboard, Key: NutKey } = require('@nut-tree/nut-js')
const { Key: KeyMap } = require('./keymap')
keyboard.config.autoDelayMs = 0

let receiverTopic
let receiverListener = false
let senderTopic
let senderListener = false
const swarm1 = new Hyperswarm()
const swarm2 = new Hyperswarm()

const handleConnect = async (event, secret) => {
  if (senderTopic) swarm1.leave(senderTopic)
  senderTopic = Buffer.alloc(32).fill(secret)

  console.log('sender topic:', secret)

  if (!senderListener) {
    senderListener = true
    console.log('sender listening!')
    swarm1.on('connection', (conn, info) => {
      console.log('sender found connection')
      ipcMain.on('keyEvent', async (event, keyCodes) => {
        const webContents = event.sender
        const win = BrowserWindow.fromWebContents(webContents)
        const keys = keyCodes.map(keyCode => NutKey[KeyMap[keyCode]])
        console.log('sending', keys)
        conn.write(Buffer.from(JSON.stringify(keys)))
      })
    })
  }

  const discovery = swarm1.join(senderTopic, { server: false, client: true })
  try { await discovery.flushed() } catch (e) { console.error('sender error', e) }
}

const handleListen = async (event, secret) => {
  if (receiverTopic) swarm2.leave(receiverTopic)
  receiverTopic = Buffer.alloc(32).fill(secret)

  if (!receiverListener) {
    receiverListener = true
    console.log('receiver listening!')
    swarm2.on('connection', (conn, info) => {
      console.log('receiver found connection')
      conn.on('data', keys => {
        keys = JSON.parse(keys.toString())
        console.log('received', keys)
        keyboard.type(...keys)
      })
    })
  }

  swarm2.join(receiverTopic, { server: true, client: false })
  try { await swarm2.flush() } catch (e) { console.error('receiver error', e) }

  console.log('receiver topic:', secret)
}

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  ipcMain.on('connect', handleConnect)
  ipcMain.on('listen', handleListen)

  win.loadFile('index.html')
}

app.whenReady().then(async () => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
