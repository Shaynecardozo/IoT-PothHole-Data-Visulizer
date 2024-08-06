<template>
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
</template>

<script>
export default {
  props: {
    totalComplaints: Number,
    fixedComplaints: Number,
    unfixedComplaints: Number
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
