const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  importSongs:  ()         => ipcRenderer.invoke('import-songs'),
  readSong:     (filename) => ipcRenderer.invoke('read-song', filename),
  listSongs:    ()         => ipcRenderer.invoke('list-songs'),
  deleteSong:   (filename) => ipcRenderer.invoke('delete-song', filename),
  saveLibrary:  (json)     => ipcRenderer.invoke('save-library', json),
  loadLibrary:  ()         => ipcRenderer.invoke('load-library'),
})
