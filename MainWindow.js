const { BrowserWindow } = require("electron");

class MainWindow extends BrowserWindow {
  constructor(file, isDev) {
    super({
      title: "SysTop",
      width: isDev ? 800 : 500,
      height: 600,
      icon: `${__dirname}/assets/icons/icon.png`,
      resizable: isDev ? true : false,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    this.loadFile(file);

    if (isDev) {
      this.webContents.openDevTools();
    }
  }
}

module.exports = MainWindow;
