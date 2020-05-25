<template>
  <div class="page-container">
    <md-card v-if="!loading">
      <md-card-content>
        <md-table
          v-model="searched"
          md-sort="usn"
          md-sort-order="asc"
          @md-selected="onSelect"
          md-fixed-header
          md-card
        >
          <md-table-toolbar>
            <div class="md-toolbar-section-start">
              <h1 class="md-title">Papers</h1>
            </div>
            <div class="md-toolbar-section-end">
              <md-button class="md-icon-button md-raised" @click="exportResults">
                <md-icon>save</md-icon>
                <md-tooltip md-direction="bottom">Export as Excel</md-tooltip>
              </md-button>
              <md-button class="md-icon-button md-raised" @click="continueEval">
                <md-icon>forward</md-icon>
                <md-tooltip md-direction="bottom">Continue Evaluation</md-tooltip>
              </md-button>

              <md-field md-clearable>
                <md-input placeholder="Search by usn..." v-model="search" @input="searchOnTable" />
              </md-field>
            </div>
          </md-table-toolbar>

          <md-table-empty-state
            md-label="No papers found"
            :md-description="`No paper found for student with usn '${search}'. Try a different usn`"
          ></md-table-empty-state>

          <md-table-row
            slot="md-table-row"
            slot-scope="{ item }"
            class="md-primary"
            md-selectable="single"
          >
            <md-table-cell md-label="usn" md-sort-by="usn">{{ item.usn }}</md-table-cell>
            <md-table-cell
              md-label="corrected"
              md-sort-by="corrected"
            >{{ item.corrected?"Yes":"NO" }}</md-table-cell>
            <md-table-cell
              md-label="totalMarks"
              md-sort-by="totalMarks"
              md-numeric
            >{{ item.totalMarks?item.totalMarks:"N/A" }}</md-table-cell>
          </md-table-row>
        </md-table>
      </md-card-content>
    </md-card>
    <div v-else>
      <br />
      <md-card>
        <md-card-content>
          <center>
            <h3>Loading Papers</h3>
            <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
          </center>
        </md-card-content>
      </md-card>
    </div>
  </div>
</template>

<script>
export default {
  name: "dashboard",
  data() {
    return {
      loading: true,
      papers: [],
      search: "",
      searched: []
    };
  },
  created() {
    try {
      this.$db
        .read()
        .then(() => {
          return this.$db.get("papers").value();
        })

        .then(papers => {
          this.papers = papers;
          this.searched = papers;
          this.loading = false;
        })
        .catch(error => {
          console.error(error);
          this.$toasted.show("Error occured while loading papers");
        });
    } catch (error) {
      console.error(error);
      this.$toasted.show("Error occured while loading papers");
    }
  },
  components: {},
  methods: {
    searchOnTable() {
      this.searched = this.papers.filter(paper =>
        paper.usn.toLowerCase().includes(this.search.toLowerCase())
      );
    },
    onSelect(item) {
      this.$router.push({ name: "evaluate-paper", params: { usn: item.usn } });
    },
    continueEval() {
      let item = this.papers
        .filter(paper => !paper.corrected)
        .sort((a, b) => {
          return a.usn.toLowerCase().localeCompare(b.usn.toLowerCase());
        });
      if (item.length < 1) {
        return this.$toasted.show("All papers have already been evaluated");
      }

      this.$router.push({
        name: "evaluate-paper",
        params: { usn: item[0].usn }
      });
    },
    exportResults() {
      this.$store.dispatch("exportResults");
    }
  }
};
</script>

<style scoped>
.md-input {
  width: 100%;
}
</style>