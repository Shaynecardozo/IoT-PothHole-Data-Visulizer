<template>
  <div>
    <div>
      <SearchBar
        :constituencies="constituencies"
        :selectedConstituency="selectedConstituency"
        @update:selectedConstituency="handleSelectedConstituencyChange"
        @updateCounts="updateCounts"
      />
      <NumberCards
        :totalComplaints="totalComplaints"
        :fixedComplaints="fixedComplaints"
        :unfixedComplaints="unfixedComplaints"
      />
    </div>
    <div class="charts">
      <DonutChart
        :fixedComplaints="fixedComplaints"
        :unfixedComplaints="unfixedComplaints"
      />
      <BarChart :selectedConstituency="selectedConstituency" />
        <!-- Line Chart Component -->
      <LineChart :selectedConstituency="selectedConstituency" />
    </div>
  </div>
  </template>

  <script>
  import SearchBar from '../components/SearchBar.vue';
  import NumberCards from '../components/NumberCards.vue';
  import DonutChart from '../components/DonutChart.vue';
  import BarChart from '../components/BarChart.vue'
  import LineChart from '../components/LineChart.vue'
  import * as d3 from 'd3';

  export default {
    components: {
      SearchBar,
      NumberCards,
      DonutChart,
      BarChart,
      LineChart
    },
    data() {
      return {
        totalComplaints: 0,
        fixedComplaints: 0,
        unfixedComplaints: 0,
        data: [],
        constituencies: [],
        selectedConstituency: ''
      };
    },
    mounted() {
      this.loadData();
    },
    methods: {
      loadData() {
        d3.json('/path/to/PotholeData for analysis_fileForInterns.geojson')
          .then(data => {
            console.log('Data loaded:', data);
            this.data = data.features;
            this.constituencies = [...new Set(this.data.map(feature => feature.properties.constituency))];
            this.updateCounts();
          })
          .catch(error => {
            console.error('Error loading data:', error);
          });
      },
      updateCounts() {
        const filteredData = this.selectedConstituency
          ? this.data.filter(feature => feature.properties.constituency === this.selectedConstituency)
          : this.data;

        this.totalComplaints = filteredData.length;
        this.fixedComplaints = filteredData.filter(feature => feature.properties.FixedOn).length;
        this.unfixedComplaints = this.totalComplaints - this.fixedComplaints;
      },
      handleSelectedConstituencyChange(newConstituency) {
        this.selectedConstituency = newConstituency;
        this.updateCounts();
      }
    }
  };
  </script>

  <style>
  /* Styles for MainPage.vue if needed */
  .charts{
    display: flex;
  }
  </style>
