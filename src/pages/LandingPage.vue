<template>
    <div class="landing-page">
      <div class="card-container top-cards">
        <div class="card small-card">
          <h3>Top Card 1</h3>
          <p>Content for top card 1</p>
        </div>
        <div class="card small-card">
          <h3>Top Card 2</h3>
          <p>Content for top card 2</p>
        </div>
        <div class="card small-card">
          <h3>Top Card 3</h3>
          <p>Content for top card 3</p>
        </div>
      </div>
      <div class="card-container bottom-cards">
        <div class="card big-card">
          <GaugeCarousel1 />
        </div>
        <div class="card big-card">
          <h3>Bottom Card 2</h3>
          <p>Content for bottom card 2</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import GaugeCarousel1 from 'src/components/GaugeCarousel1.vue';
  export default {
    components: {
      GaugeCarousel1
    }
  }
  </script>
  
  <style scoped>
  .landing-page {
    display: flex;
    flex-direction: column;
    gap: 10px; /* Adjust as needed */
    background-color: #e9f5e9; /* Light green background */
    padding: 20px; /* Padding around the page */
  }
  
  .card-container {
    display: flex;
    gap: 10px; /* Space between cards */
  }
  
  .top-cards {
    justify-content: space-evenly;
  }
  
  .bottom-cards {
    justify-content: space-evenly;
  }
  
  .card {
    border: 2px solid #4caf50; /* Green border */
    padding: 15px; /* Padding inside cards */
    border-radius: 8px; /* Rounded corners */
    background-color: #ffffff; /* White background */
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2); /* Subtle shadow */
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .card:hover {
    transform: translateY(-2px); /* Lift effect on hover */
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5); /* Darker shadow on hover */
  }
  
  .small-card {
    flex: 1;
    max-width: 30%; /* Adjusted max-width for better fit */
  }
  
  .big-card {
    flex: 1;
    max-width: 65%; /* Adjusted max-width for better fit */
  }
  </style>
  