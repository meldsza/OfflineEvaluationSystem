const fs = require('fs').promises
const path = require('path')
const low = require('lowdb')
let _ = require('lodash');
import Vue from 'vue'

const FileASync = require('lowdb/adapters/FileASync')


const state = {
  folderpath: '',
  db: null,
  paperFormat: {},
  loadingComplete: false
}

const mutations = {
  CHANGE_FOLDER_PATH(state, newPath) {
    state.folderpath = newPath
  },
  UPDATE_PAPER_FORMAT(state, format) {
    state.paperFormat = format;
  }

}

const actions = {
  async changeFolderPath({ commit, state }, newPath) {
    // do something async
    commit('CHANGE_FOLDER_PATH', newPath)
    window.db = await low(new FileASync(path.join(newPath, 'database.json'), {
      defaultValue: {
        papers: [], paperFormat: {
          units: [
            {
              questions_count: 2,
              marks_per_question: 10,
              best_of: 1
            },
            {
              questions_count: 2,
              marks_per_question: 10,
              best_of: 1
            }
          ]
        }
      },

    }))
    console.log("NODE", process.version)
    console.log("Loading", state.folderpath)
    let papers = await fs.readdir(state.folderpath, { encoding: 'utf8' });

    papers = papers.filter(paper_name => {
      paper_name = paper_name.toLowerCase()
      if (!paper_name.endsWith('.pdf')) return false;
      if (!paper_name.startsWith('4nm')) return false;
      if (!paper_name.includes('_')) return false;
      return true;
    })
    console.log("FOUND PAPERS IN DIR", papers)
    let papersStored = _.map(await window.db.get('papers').value(), 'filename')
    console.log("PAPERS IN DB", papersStored, typeof (papersStored))
    let papersToStore = _.difference(papers, papersStored);

    console.log("PAPERS TO STORE", papersToStore)
    let s = await window.db.get('papers');
    await Promise.all(papersToStore.map(paper => {

      console.log("PAPERS TO WRITE", paper)
      return s.push({
        filename: paper,
        fullpath: path.join(state.folderpath, paper),
        usn: paper.toLowerCase().split("_")[0],
        subject: paper.toLowerCase().replace(".pdf", "").split("_")[1],
        totalMarks: false,
        marks: [],
        corrected: false
      }).write()

    }))
    await s.write();
    await window.db.value()
    Vue.prototype.$db = window.db

  },
  async savePaperFormat({ commit }, newFormat) {
    await (window.db.write())
    commit("UPDATE_PAPER_FORMAT", newFormat)
    return true;
  },
  async exportResults() {
    await window.db.read();
    let papers = window.db.get('papers').filter({ corrected: true }).value();
    if (papers.length < 1) return alert("No papers to export");
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('saveFile', papers)
  }
}

export default {
  state,
  mutations,
  actions
}
