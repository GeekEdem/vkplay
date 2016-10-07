const {app, BrowserWindow} = require('electron')
const authenticateVK = require('electron-vk-oauth2')
const config = require('./config.js')

let win;

function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({
      fullscreen: true,
      darkTheme: true
    })

    // and load the index.html of the app.
    win.loadURL(`file://${__dirname}/index.html`)
    win.setMenu(null)

    authenticateVK({
        appId: config.vk.AppID,
        scope: 'music',
        revoke: true
    }, {
        parent: win
    }).then((res) => {
        console.log('Access token: %s', res.accessToken)
        console.log('User id: %s', res.userId)
        console.log('Expires in: %s', res.expiresIn)
        // now you can make requests to API using access token and pass data to
        // to the renderer process.
    }).catch((err) => {
        // E.g., user denied permissions, or user closed the window without
        // authorising the app.
        console.error(err)
    })

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })
}

app.on('ready', createWindow)