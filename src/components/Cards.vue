
<template>
  <div>
    <div class="dashboard">
      <div class="card">
        <h3>Total Complaints</h3>
        <p>{{ totalComplaints }}</p>
      </div>
      <div class="card">
        <h3>Fixed Complaints</h3>
        <p>{{ fixedComplaints }}</p>
      </div>
      <div class="card">
        <h3>Unfixed Complaints</h3>
        <p>{{ unfixedComplaints }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  data() {
    return {
      totalComplaints: 0,
      
      fixedComplaints: 0,
      unfixedComplaints: 0,
      
    };
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData() {
      d3.json('path/to/PotholeData_for_analysis_fileForInterns.geojson')
        .then(data => {
          console.log('Data loaded:', data); // Debug: Log the loaded data
          this.totalComplaints = data.features.length;
          this.fixedComplaints = data.features.filter(feature => feature.properties.FixedOn).length;
          this.unfixedComplaints = this.totalComplaints - this.fixedComplaints;
          console.log('Total Complaints:', this.totalComplaints); // Debug: Log the total complaints
          console.log('Fixed Complaints:', this.fixedComplaints); // Debug: Log the fixed complaints
          console.log('Unfixed Complaints:', this.unfixedComplaints); // Debug: Log the unfixed complaints
        })
        .catch(error => {
          console.error('Error loading data:', error); // Error handling
        });
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

