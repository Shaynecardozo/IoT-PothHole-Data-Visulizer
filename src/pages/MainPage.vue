<template>
  <div>
    <h1>Charts Dashboard</h1>
    <div class="cards-container">
      <BarChart />
      <LineChart />
      <PieChart />
    </div>
  </div>
</template>

<script>
import BarChart from 'components/BarChart.vue';
import LineChart from 'components/LineChart.vue';
// import PieChart from '@/components/PieChart.vue';

export default {
  components: {
    BarChart,
    LineChart,
    // PieChart,
  }
};
</script>

<style>
.cards-container {
  display: flex;
  flex-wrap: wrap;
}
</style>
