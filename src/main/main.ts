import { app, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import url from "url";
import fs from "fs-extra";

function getPortfolioPath() {
  const userData = app.getPath("userData");
  return join(userData, "portfolios.json");
}

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "preload.js")
    }
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadURL(
      url.format({
        pathname: join(__dirname, "../renderer/index.html"),
        protocol: "file:",
        slashes: true
      })
    );
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle("portfolio:load", async () => {
    const filePath = getPortfolioPath();
    if (!(await fs.pathExists(filePath))) {
      return { portfolios: [] };
    }
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  });

  ipcMain.handle("portfolio:save", async (_event, store) => {
    const filePath = getPortfolioPath();
    await fs.outputFile(filePath, JSON.stringify(store, null, 2), "utf8");
    return true;
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


