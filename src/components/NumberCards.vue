<template>
  <div class="dashboard">
    <div class="card">
      <q-icon name="favorite" class="icon"></q-icon>
      <p>Total Complaints</p>
      <h3>{{ totalComplaints }}</h3>
    </div>
    <div class="card">
      <q-icon name="verified" class="icon"></q-icon>
      <p>Fixed Complaints</p>
      <h3>{{ fixedComplaints }}</h3>
    </div>
    <div class="card">
      <q-icon name="warning" class="icon"></q-icon>
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
  background: linear-gradient(to right, #007bff, #0056b3); /* Gradient background */
  color: white;
  padding: 10px;
  border-radius: 10px;
  text-align: left; /* Align text to the left */
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align items to the left */
  max-width: 20rem;
  width: 100%;
}
.card .icon {
  font-size: 3em; /* Increase icon size */
  margin-bottom: 10px; /* Add spacing between icon and count */
}

.card h3 {
  margin: 0;
}
.card p {
  font-size: 2em;
  margin: 0;
}
</style>
