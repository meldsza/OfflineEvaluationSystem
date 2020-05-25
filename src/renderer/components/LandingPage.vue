<template>
  <div class="page-container">
    <br />
    <center>
      <h1>Welcome to Offline Evaluation Software</h1>
    </center>
    <div
      style="
    display: inline-block;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 200px;
    height: 100px;
    margin: auto;"
    >
      <md-field v-if="!loading">
        <label>Select a Folder</label>
        <md-file v-model="listSelectedFolder" @md-change="open" directory webkitdirectory />
      </md-field>
      <div v-else>
        <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "landing-page",
  data() {
    return {
      loading: false,
      folderpath: ""
    };
  },
  computed: {
    listSelectedFolder: {
      get() {
        return this.folderpath;
      },
      set() {}
    }
  },
  components: {},
  methods: {
    open(fl) {
      if (fl.length < 1) return;
      this.folderpath = fl[0].path.replace(fl[0].name, "");
      this.loading = true;
      this.$store
        .dispatch("changeFolderPath", this.folderpath)
        .then(() => {
          this.$router.push({ name: "setup-paper-format" });
        })
        .catch(error => {
          console.error(error);
          this.$toasted.show("There was an issue while loading the folder");
          this.loading = false;
        });
    }
  }
};
</script>
