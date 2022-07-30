const { contextBridge, ipcRenderer } = require('electron')
const randomWords = require('random-words')

contextBridge.exposeInMainWorld('electron', {
  randomWords: (...args) => randomWords(...args),
  keyEvent: keyCodes => ipcRenderer.send('keyEvent', keyCodes),
  listen: secret => ipcRenderer.send('listen', secret),
  connect: secret => ipcRenderer.send('connect', secret)
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})
