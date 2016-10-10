const {app, BrowserWindow} = require('electron');
const authenticateVK = require('electron-vk-oauth2');
const config = require('./config.js');
const Datastore = require('nedb');
var db = new Datastore({ filename: './' + config.db, autoload: true});

function createWindow () {
    db.find({}, function (err, docs) {
        if(docs.length == 0) {
            authentication(runMainWindow);
        } else {
            var now = new Date();
            if (docs[0].expires < now)
                authentication(runMainWindow);
            else{
                runMainWindow(docs[0]);
            }
        }
    });
}

app.on('ready', createWindow);

function authentication(cb) {
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
        var obj = {
            accessToken: res.accessToken,
            userId: res.userId,
            expires: now.setSeconds(now.getSeconds() + res.expiresIn)
        };
        db.insert(obj, function (err) {
            // TODO: show error window!
            if (err) console.log("Save error!");
            else cb(obj);
        });
    }).catch(function (err) {
        // E.g., user denied permissions, or user closed the window without
        // authorising the app.
        // TODO: show error window!
        console.error("Catch: " + err);
    });
}

function runMainWindow(credentials) {
    win = new BrowserWindow({
      fullscreen: true,
      darkTheme: true
    });
    win.loadURL(`file://${__dirname}/index.html`);
    win.setMenu(null);
    win.on('closed', function() {
        win = null;
    })
}