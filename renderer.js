// Listen for connections
const code = document.getElementById('code')
const listen = document.getElementById('listen')
listen.addEventListener('click', e => {
  listen.disabled = true
  const secret = window.electron.randomWords(3).join(' ')
  code.innerHTML = `Connection Phrase: <strong>${secret}</strong>`
  window.electron.listen(secret)
})

// Initiate connection
const connect = document.getElementById('connect')
connect.addEventListener('keydown', e => {
  if (e.keyCode === 13) {
    connect.blur()
    connect.disabled = true
    window.sender = true

    const secret = e.target.value
    console.log(secret)
    window.electron.connect(secret)
  }
})

// Pipe keydowns
window.addEventListener('keydown', (e) => {
  if (!window.sender) return
  e.preventDefault()

  const keyCodes = [e.keyCode]
  if (e.shiftKey) keyCodes.push(16)
  if (e.ctrlKey) keyCodes.push(17)
  if (e.altKey) keyCodes.push(18)
  if (e.metaKey) keyCodes.push(91)

  console.log('send keys', keyCodes)
  window.electron.keyEvent(keyCodes)
})
