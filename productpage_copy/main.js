const {app, BrowserWindow} = require('electron')
const url = require('url')
const path = require('path')
 
let win
 
function createWindow() {
   win = new BrowserWindow(
    {width: 1800, 
    height: 1200,
    icon: path.join(__dirname, 'build/rpi-imager.icns')
})
   win.loadURL(url.format ({
      
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
      
    //   make all path relative to the index.html file
    
   }))
//    print the __dirname
    // console.log(__dirname)
}
 


app.on('ready', createWindow)