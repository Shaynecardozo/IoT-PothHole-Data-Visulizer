<template>
  <div>
    <!-- <h1>Charts Dashboard</h1> -->
    <Cards />
    <div class="cards-container">
      <BarChart />
      <LineChart />
      <!-- <PieChart /> -->
    </div>
  </div>
</template>

<script>
import Cards from '../components/Cards.vue'
import BarChart from 'components/BarChart.vue';
import LineChart from 'components/LineChart.vue';
// import PieChart from '@/components/PieChart.vue';

export default {
  components: {
    Cards,
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
