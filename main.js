const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')

const SONGS_DIR = path.join(app.getPath('userData'), 'songs')
const DB_FILE = path.join(app.getPath('userData'), 'library.json')

if (!fs.existsSync(SONGS_DIR)) fs.mkdirSync(SONGS_DIR, { recursive: true })

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    backgroundColor: '#0a0a0f',
    show: false
  })
  win.loadFile('melodix-final.html')
  win.once('ready-to-show', () => win.show())
}

// ── Import songs — copies file to userData/songs ──────────────────────────
ipcMain.handle('import-songs', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Import Music',
    filters: [{ name: 'Audio', extensions: ['mp3','wav','ogg','m4a','flac','aac'] }],
    properties: ['openFile', 'multiSelections']
  })
  if (result.canceled) return []
  const imported = []
  for (const src of result.filePaths) {
    const filename = path.basename(src)
    const dest = path.join(SONGS_DIR, filename)
    if (!fs.existsSync(dest)) fs.copyFileSync(src, dest)
    imported.push({ filename, path: dest })
  }
  return imported
})

// ── Read song as base64 ───────────────────────────────────────────────────
ipcMain.handle('read-song', async (_e, filename) => {
  const filePath = path.join(SONGS_DIR, filename)
  if (!fs.existsSync(filePath)) return null
  return fs.readFileSync(filePath).toString('base64')
})

// ── List ALL songs in storage folder ─────────────────────────────────────
ipcMain.handle('list-songs', async () => {
  return fs.readdirSync(SONGS_DIR)
    .filter(f => /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(f))
})

// ── Delete a song ─────────────────────────────────────────────────────────
ipcMain.handle('delete-song', async (_e, filename) => {
  const filePath = path.join(SONGS_DIR, filename)
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  return true
})

// ── Save library JSON ─────────────────────────────────────────────────────
ipcMain.handle('save-library', async (_e, json) => {
  fs.writeFileSync(DB_FILE, json, 'utf8')
  return true
})

// ── Load library JSON ─────────────────────────────────────────────────────
ipcMain.handle('load-library', async () => {
  if (!fs.existsSync(DB_FILE)) return null
  return fs.readFileSync(DB_FILE, 'utf8')
})

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })