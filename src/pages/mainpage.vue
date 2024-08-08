<template>
    <div class="main-page">
      <!-- Cards Section -->
      <div class="cards-section">
        <Cards :selectedConstituency="selectedConstituency" />
      </div>
  
      <!-- Charts Section -->
      <div class="charts-section">
        <BarChart :selectedConstituency="selectedConstituency" />
      </div>
    </div>
  </template>
  
  <script>
  import ChartsDisplay from '../components/ChartsDisplay.vue';
  import BarChart from '../components/BarChart.vue';
  
  export default {
    data() {
      return {
        selectedConstituency: ''
      };
    },
    components: {
    ChartsDisplay,
      BarChart
    },
  };
  </script>
  
  <style scoped>
  .main-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }
  
  .cards-section {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }
  
  .charts-section {
    display: flex;
    justify-content: space-between;
    width: 100%;
    min-height:300px;
    overflow: visible;
  }
  
  .charts-section > div {
    flex: 1;
    margin-left: 20px;
  }
  
  @media screen and (max-width: 768px) {
    .charts-section {
      flex-direction: column;
      align-items: center;
    }
    .charts-section > div {
      margin-left: 0;
      margin-bottom: 20px;
    }
  }
  </style>
  