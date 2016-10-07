const {app, BrowserWindow} = require('electron');
const authenticateVK = require('electron-vk-oauth2');
const config = require('./config.js');
const Datastore = require('nedb');
var db = new Datastore({ filename: './' + config.db, autoload: true});
const fileExists = require('file-exists');
const fs = require('fs');

function createWindow () {
    db.find({}, function (err, docs) {
        console.log("Docs: " + docs);
        if(docs.length == 0) {
            authentication();
        } else {
            var now = new Date();
            console.log(docs[0].expires);
            if (docs[0].expires < now)
                authentication();
            else{
                console.log(docs);
            }
        }
    });

    // Create the browser window.
    // win = new BrowserWindow({
    //   fullscreen: true,
    //   darkTheme: true
    // })
    //
    // // and load the index.html of the app.
    // win.loadURL(`file://${__dirname}/index.html`)
    // win.setMenu(null)

    // Emitted when the window is closed.
    // win.on('closed', () => {
    //     // Dereference the window object, usually you would store windows
    //     // in an array if your app supports multi windows, this is the time
    //     // when you should delete the corresponding element.
    //     win = null
    // })
}

app.on('ready', createWindow);

function authentication() {
    authenticateVK({
        appId: config.vk.AppID,
        scope: 'audio',
        revoke: true,
        display: 'popup'
    }).then(function (res) {
        console.log('Access token: %s', res.accessToken);
        console.log('User id: %s', res.userId);
        console.log('Expires in: %s', res.expiresIn);
        var now = new Date();
        db.insert({
            accessToken: res.accessToken,
            userId: res.userId,
            expires: now.setSeconds(now.getSeconds() + res.expiresIn)
        }, function (err) {
            // TODO: show error window!
            if (err) console.log("Save error!");
        });
    }).catch(function (err) {
        // E.g., user denied permissions, or user closed the window without
        // authorising the app.
        // TODO: show error window!
        console.error("Catch: " + err);
    });
}
