/* eslint-disable space-before-function-paren */
'use strict'

import { app, BrowserWindow, dialog, ipcMain } from 'electron'
const excel = require('node-excel-export');
const fs = require('fs').promises


/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    title: "Offline Evaluation System",
    width: 1000,
    autoHideMenuBar: true,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true,
      enableRemoteModule: true
    },

  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
function generateSheetOverall(papers) {
  let specification = {
    usn: {
      displayName: "USN",
      width: 120
    },
    totalMarks: {
      displayName: "Marks",
      width: 120
    }
  }
  for (let i = 0; i < papers[0].tu; i++) {
    specification['u_' + i] = {
      displayName: "Unit " + (i + 1)
    }
  }
  let dataset = papers.map(paper => {
    for (let i = 0; i < paper.tu; i++) {
      paper['u_' + i] = paper.um[i]
    }
    return paper;
  })
  return {
    name: 'Overall',
    specification: specification, // <- Report specification
    data: dataset // <-- Report data
  }
}
function generateSheetSub(papers) {
  let specification = {
    usn: {
      displayName: "USN",
      width: 120
    },
    totalMarks: {
      displayName: "Marks",
      width: 120
    }
  }
  for (let i = 0; i < papers[0].tq; i++) {
    specification[i + '_a'] = {
      displayName: "Q" + (i + 1) + '_a'
    }
    specification[i + '_b'] = {
      displayName: "Q" + (i + 1) + '_b'
    }
    specification[i + '_c'] = {
      displayName: "Q" + (i + 1) + '_c'
    }
    specification[i + '_d'] = {
      displayName: "Q" + (i + 1) + '_d'
    }
  }
  let dataset = papers.map(paper => {
    for (let i = 0; i < paper.tq; i++) {
      paper[i + '_a'] = paper.marks[i][0]
      paper[i + '_b'] = paper.marks[i][1]
      paper[i + '_c'] = paper.marks[i][2]
      paper[i + '_d'] = paper.marks[i][3]
    }
    return paper;
  })
  return {
    name: 'SubQuestionWiseReport',
    specification: specification, // <- Report specification
    data: dataset // <-- Report data
  }
}
function generateSheetQuestion(papers) {
  let specification = {
    usn: {
      displayName: "USN",
      width: 120
    },
    totalMarks: {
      displayName: "Marks",
      width: 120
    }
  }
  for (let i = 0; i < papers[0].tq; i++) {
    specification['q_' + i] = {
      displayName: "Q" + (i + 1)
    }
  }
  let dataset = papers.map(paper => {
    for (let i = 0; i < paper.tq; i++) {
      paper['q_' + i] = paper.qm[i]
    }
    return paper;
  })
  return {
    name: 'QuestionWiseReport',
    specification: specification, // <- Report specification
    data: dataset // <-- Report data
  }
}
ipcMain.on('saveFile', async function saveMarksToDiscCB(event, papers) {
  console.log(papers)
  let filename = await dialog.showSaveDialog({
    filters: [{
      name: 'Excel',
      extensions: ['xlsx']
    }]
  });
  filename = filename.filePath;
  if (!filename) return;
  const report = excel.buildExport(
    [
      generateSheetOverall(papers),
      generateSheetQuestion(papers),
      generateSheetSub(papers),
    ]
  );
  await fs.writeFile(filename, report)
  console.log("Write Completed.")
})
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
