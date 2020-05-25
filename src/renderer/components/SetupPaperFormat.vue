<template>
  <div class="page-container">
    <br />
    <center>
      <h1>Setup Paper Format</h1>
    </center>

    <form v-if="!loading" @submit.prevent="savePaperFormat">
      <md-card>
        <md-card-content>
          <div v-for="(unit, unit_no) in form.units">
            <div class="md-layout md-gutter md-alignment-center-center">
              <div class="md-layout-item md-size-25">
                <p>Unit {{unit_no+1}}</p>
              </div>
              <div class="md-layout-item md-size-25">
                <md-field>
                  <label>No of Questions</label>
                  <md-input v-model="unit.questions_count" type="number" />
                </md-field>
              </div>
              <div class="md-layout-item md-size-25">
                <md-field>
                  <label>Marks Per Question</label>
                  <md-input v-model="unit.marks_per_question" type="number" />
                </md-field>
              </div>
              <div class="md-layout-item md-size-25">
                <md-field>
                  <label>Select Best of</label>
                  <md-input v-model="unit.best_of" type="number" />
                </md-field>
              </div>
            </div>
          </div>
        </md-card-content>
        <md-card-actions>
          <md-button class="md-primary" @click="addUnit">Add Unit</md-button>
          <md-button class="md-primary" @click="removeUnit">Remove Last Unit</md-button>
          <md-button type="submit" class="md-primary">Save Paper Format</md-button>
        </md-card-actions>
      </md-card>
    </form>
    <div v-else>
      <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
    </div>
  </div>
</template>

<script>
export default {
  name: "setup-paper-format",
  data() {
    return {
      loading: true,
      form: {}
    };
  },
  created() {
    this.$db.read().then(() => {
      this.form = this.$db.get("paperFormat").value();
      this.loading = false;
    });
  },
  components: {},
  methods: {
    addUnit() {
      this.form.units.push({
        questions_count: 2,
        marks_per_question: 10,
        best_of: 1
      });
    },
    removeUnit() {
      this.form.units.pop();
    },
    savePaperFormat() {
      this.loading = true;
      try {
        this.$store
          .dispatch("savePaperFormat", this.form)
          .then(() => {
            console.log("changing to dashboard");
            this.$router.push({ name: "dashboard" });
          })
          .catch(error => {
            console.error(error);
            this.$toasted.show("There was an issue while saving the format");
            this.loading = false;
          });
      } catch (error) {
        console.error(error);
        this.$toasted.show("There was an issue while saving the format");
        this.loading = false;
      }
    }
  }
};
</script>
