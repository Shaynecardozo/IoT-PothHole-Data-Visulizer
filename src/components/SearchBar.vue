<template>
  <div class="dropdown full-width row justify-center">
    <!-- <label for="constituency">Select Constituency:</label> -->
    <q-select style="width: 80vw;" clearable v-model="internalSelectedConstituency" :options="constituencies" label="Filter By Constituency" @update:model-value="emitUpdateCounts" filled />
    <!-- <select v-model="internalSelectedConstituency" @change="emitUpdateCounts">
      <option v-for="constituency in constituencies" :key="constituency" :value="constituency">
        {{ constituency }}
      </option>
    </select> -->
  </div>
</template>

<script>
export default {
  props: {
    constituencies: Array,
    selectedConstituency: String
  },
  data() {
    return {
      internalSelectedConstituency: this.selectedConstituency
    };
  },
  watch: {
    selectedConstituency(newVal) {
      this.internalSelectedConstituency = newVal;
    },
    internalSelectedConstituency(newVal) {
      this.$emit('update:selectedConstituency', newVal);
    }
  },
  methods: {
    emitUpdateCounts() {
      this.$emit('updateCounts');
    }
  }
};
</script>

<style scoped>
.dropdown {
  margin-top: 20px;
}
.dropdown label {
  margin-right: 10px;
  font-size: 1.2em;
}
.dropdown select {
  padding: 5px;
  font-size: 1em;
}
</style>
