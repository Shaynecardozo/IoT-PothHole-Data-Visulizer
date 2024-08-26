<template>
  <div class="dashboard q-mx-auto q-px-md">
    <div class="card">
      <q-icon name="note_alt" class="icon"></q-icon>
      <h3>{{ totalComplaints }}</h3>
      <p>Total Complaints</p>
    </div>
    <div class="card">
      <q-icon name="construction" class="icon"></q-icon>
      <h3>{{ fixedComplaints }}</h3>
      <p>Fixed Complaints</p>
    </div>
    <div class="card">
      <q-icon name="warning" class="icon"></q-icon>
      <h3>{{ unfixedComplaints }}</h3>
      <p>Unfixed Complaints</p>
    </div>
    <div class="card">
      <q-icon name="verified" class="icon"></q-icon>
      <h3>{{ pwdVerifications }}</h3>
      <p>PWD Verifications</p>
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
  justify-content: space-evenly;
  flex-wrap: wrap; /* Allow wrapping if needed */
  /* border:0.5px solid rgba(128, 128, 128, 0.658); */
  width: fit-content;
  margin-top: 2rem;
  border-radius: 2rem;
  background-color:white;
}

.card {
  background: linear-gradient(135deg, #2f4550, #4caf50);
  color: white;
  padding: 10px; /* Increase padding */
  border-radius: 15px; /* Increase border-radius for more rounded corners */
  text-align: left;
  display: flex;
  flex-direction: column;
  width: 19rem;
  align-items: flex-start; /* Align items to the left *//* Keep the width consistent */
  height: 160px; /* Set a fixed height for the card */
  margin: 6px; /* Margin between cards */
  /* gap: 20px; */
  transition: all 0.3s ease; /* Transition for transform and box-shadow */
}

.card:hover {
  transform: scale(1.05); /* Slightly increase size on hover */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg,#4caf50, #2f4550 );

  color:azure;
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
