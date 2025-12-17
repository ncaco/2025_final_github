import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  loadPortfolio: () => ipcRenderer.invoke("portfolio:load"),
  savePortfolio: (store: unknown) => ipcRenderer.invoke("portfolio:save", store)
});


