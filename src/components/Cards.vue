<template>
  <div>
    <div class="dashboard">
      <div class="card">
        <p>Total Complaints</p>
        <h3>{{ totalComplaints }}</h3>
      </div>
      <div class="card">
        <p>Fixed Complaints</p>
        <h3>{{ fixedComplaints }}</h3>
      </div>
      <div class="card">
        <p>Unfixed Complaints</p>
        <h3>{{ unfixedComplaints }}</h3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      totalComplaints: 0,
      fixedComplaints: 0,
      unfixedComplaints: 0,
    };
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const response = await fetch('/path/to/PotholeData%20for%20analysis_fileForInterns.geojson');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Data loaded:', data); // Debug: Log the loaded data
        this.totalComplaints = data.features.length;
        this.fixedComplaints = data.features.filter(feature => feature.properties.FixedOn).length;
        this.unfixedComplaints = this.totalComplaints - this.fixedComplaints;
        console.log('Total Complaints:', this.totalComplaints); // Debug: Log the total complaints
        console.log('Fixed Complaints:', this.fixedComplaints); // Debug: Log the fixed complaints
        console.log('Unfixed Complaints:', this.unfixedComplaints); // Debug: Log the unfixed complaints
      } catch (error) {
        console.error('Error loading data:', error); // Error handling
      }
    }
  }
};
</script>

<style scoped>
.dashboard {
  display: flex;
  justify-content: space-around;
}
.card {
  background-color: #007bff;
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
}
.card h3 {
  margin: 0;
}
.card p {
  font-size: 2em;
  margin: 0;
}
</style>
