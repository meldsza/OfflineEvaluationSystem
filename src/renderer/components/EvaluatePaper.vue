<template>
  <div class="page-container">
    <div v-if="!loading" class="md-layout">
      <div class="md-layout-item">
        <embed
          type="application/pdf"
          :src="'file:///'+paper.fullpath"
          style="height: 100%  !important;width:100%"
        />
      </div>

      <div class="md-layout-item">
        <form @submit.prevent="saveEvaluation">
          <md-card>
            <md-card-header>
              <div class="md-title">Evaluate Paper - {{paper.usn}} - {{paper.subject}}</div>
            </md-card-header>

            <md-card-content>
              <div v-for="(unit, unit_no) in unit_question_map">
                <div class="md-layout">
                  <h3 class="md-layout-item">Unit {{unit_no+1}}</h3>
                  <p class="md-layout-item">Total: {{marksU[unit_no]}}</p>
                </div>
                <div
                  class="md-layout md-gutter md-alignment-center-center"
                  v-for="(question_no) in unit"
                >
                  <div class="md-layout-item md-size-15">
                    <p>Qno {{question_no+1}}</p>
                  </div>
                  <div class="md-layout-item md-size-15" v-for="subq_no in 4">
                    <md-field>
                      <label>{{String.fromCharCode(96+subq_no)}}</label>
                      <md-input
                        v-model="paper.marks[question_no][subq_no-1]"
                        type="number"
                        @input="calculateMarks"
                      />
                    </md-field>
                  </div>
                  <div class="md-layout-item md-size-15">
                    <p>Total: {{ marksQ[question_no] }}</p>
                  </div>
                </div>
              </div>
            </md-card-content>
            <md-card-actions>
              <p>Total: {{ paper.totalMarks?paper.totalMarks:'N/A'}}</p>
              <md-button type="submit" class="md-primary">Save and Next</md-button>
            </md-card-actions>
          </md-card>
        </form>
      </div>
    </div>

    <div v-else>
      <center>
        <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
      </center>
    </div>
  </div>
</template>

<script>
export default {
  name: "evaluate-paper",
  data() {
    return {
      loading: false,
      unit_question_map: [],
      qc: 0,
      paper: { marks: [] },
      paperFormat: {},
      marksU: [0, 0, 0, 0, 0, 0],
      marksQ: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };
  },
  mounted() {
    this.loading = true;
    try {
      this.$db
        .read()
        .then(() =>
          this.$db
            .get("papers")
            .find({ usn: this.$route.params.usn })
            .value()
        )
        .then(paper => {
          this.paper = paper;
          this.paperFormat = this.$store.state.FolderInfo.paperFormat;
          this.createUnitQuestionMap();
          this.createMarks();
          this.loading = false;
        })
        .catch(error => {
          console.error(error);
          this.$toasted.show("There was an issue while loading paper");
        });
    } catch (error) {
      console.error(error);
      this.$toasted.show("There was an issue while loading paper");
    }
  },
  components: {},
  methods: {
    roundToNearest50(res) {
      return Math.round(res * 2) / 2;
    },
    totalMarksPQ(qno) {
      return this.roundToNearest50(
        qno.reduce(
          (pv, cv) => parseFloat(pv ? pv : 0) + parseFloat(cv ? cv : 0),
          0
        )
      );
    },
    createUnitQuestionMap() {
      this.qc = 0;
      let unit_question_map = [];
      for (let i = 0; i < this.paperFormat.units.length; i++) {
        let question_map = [];
        for (let j = 0; j < this.paperFormat.units[i].questions_count; j++) {
          question_map[j] = this.qc++;
        }
        unit_question_map.push(question_map);
      }
      this.unit_question_map = unit_question_map;
    },
    createMarks() {
      for (let i = 0; i < this.qc; i++) {
        if (!this.paper.marks[i])
          this.$set(this.paper.marks, i, [null, null, null, null]);
        this.$set(this.marksQ, i, 0);
      }
      for (let i = 0; i < this.unit_question_map.length; i++) {
        this.$set(this.marksU, i, 0);
      }
      this.calculateMarks();
    },
    saveEvaluation() {
      this.paper.corrected = true;
      this.$db
        .write()
        .then(() => {
          this.$toasted.show("Sucessfully saved");
          this.continueEval();
        })
        .catch(e => {
          console.error("Unable to save", e);
          this.$toasted.show("Unable to save");
        });
    },
    calculateMarks() {
      for (let i = 0; i < this.qc; i++) {
        this.$set(
          this.marksQ,
          i,
          this.totalMarksPQ(this.paper.marks[i] ? this.paper.marks[i] : 0)
        );
      }
      let tmm = 0;
      for (let i = 0; i < this.unit_question_map.length; i++) {
        let tm = this.unit_question_map[i]
          .map(qno => this.marksQ[qno])
          .sort((a, b) => b - a)
          .slice(0, this.paperFormat.units[i].best_of);
        this.$set(this.marksU, i, this.totalMarksPQ(tm));
        tmm += this.marksU[i];
      }
      this.paper.totalMarks = tmm;
      this.paper.qm = this.marksQ;
      this.paper.um = this.marksU;
      this.paper.tq = this.qc;
      this.paper.tu = this.unit_question_map.length;
    },
    continueEval() {
      let item = this.$db
        .get("papers")
        .value()
        .filter(paper => !paper.corrected)
        .sort((a, b) => {
          return a.usn.toLowerCase().localeCompare(b.usn.toLowerCase());
        });
      if (item.length < 1) {
        this.$toasted.show("All papers have already been evaluated");
        this.$router.push({
          name: "dashboard"
        });
        return;
      }

      this.$router.push({
        name: "evaluate-paper",
        params: { usn: item[0].usn }
      });
    }
  }
};
</script>
<style scoped>
.md-input {
  width: 100%;
}
</style>