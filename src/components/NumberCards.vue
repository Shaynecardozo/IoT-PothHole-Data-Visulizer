<template>
  <div class="dashboard">
    <div class="card">
      <q-icon name="note_alt" class="icon"></q-icon>
      <p>Total Complaints</p>
      <h3>{{ totalComplaints }}</h3>
    </div>
    <div class="card">
      <q-icon name="construction" class="icon"></q-icon>
      <p>Fixed Complaints</p>
      <h3>{{ fixedComplaints }}</h3>
    </div>
    <div class="card">
      <q-icon name="warning" class="icon"></q-icon>
      <p>Unfixed Complaints</p>
      <h3>{{ unfixedComplaints }}</h3>
    </div>
    <div class="card">
      <q-icon name="verified" class="icon"></q-icon>
      <p>PWD Verifications</p>
      <h3>{{ pwdVerifications }}</h3>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    totalComplaints: Number,
    fixedComplaints: Number,
    unfixedComplaints: Number,
    pwdVerifications: Number
  }
};
</script>

<style scoped>
.dashboard {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap; /* Allow wrapping if needed */
}

.card {
  background: linear-gradient(to right, #138808, #90EE90); /* Gradient background */
  color: white;
  padding: 20px; /* Increase padding */
  border-radius: 15px; /* Increase border-radius for more rounded corners */
  text-align: left; /* Align text to the left */
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align items to the left */
  max-width: 20rem; /* Keep the width consistent */
  height: 160px; /* Set a fixed height for the card */
  margin: 10px; /* Margin between cards */
  gap: 20px;
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Transition for transform and box-shadow */
}

.card:hover {
  transform: scale(1.05); /* Slightly increase size on hover */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3); /* Add shadow for a popping effect */
}

.card .icon {
  font-size: 3em; /* Increase icon size */
  margin-bottom: 10px; /* Spacing between icon and count */
}

.card h3 {
  margin: 0;
}

.card p {
  font-size: 2.0em; /* Adjust font size to fit increased height */
  margin: 0;
}
</style>
