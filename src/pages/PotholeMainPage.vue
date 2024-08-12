<template>
  <div>
    <div :class="['drawer', { 'drawer-closed': !isDrawerOpen }]" style="z-index: 10;">
      <!-- Drawer Toggle Button -->
      <button @click="toggleDrawer" class="menu-icon">☰</button>

      <!-- Drawer Content -->
      <ul v-if="isDrawerOpen" class="q-mt-xl">
        <li clickable @click="RoutePage('/potholes')"><q-icon name="query_stats" /> Analytics</li>
        <li clickable @click="RoutePage('/map')"><q-icon name="map" /> Map</li>
        <li clickable @click="RoutePage('/PotholeData')"><q-icon name="edit_road" /> Pothole Dashboard</li>
      </ul>
    </div>
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
        selectedConstituency: '',
        isDrawerOpen: true, // State of the left drawer
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
      },
      toggleDrawer() {
      this.isDrawerOpen = !this.isDrawerOpen;
    },
    RoutePage(value){
      this.$router.push(value)
    }
    }
  };
  </script>

  <style>
/* Navbar styling */
.navbar {
  background-color: #333;
  color: white;
  padding: 10px;
  display: flex;
  align-items: center;
}

/* Drawer styling */
.drawer {
  width: 250px;
  height: calc(100vh - 50px); /* Adjust height to be below the navbar */
  position: fixed;
  top: 50px; /* Height of the navbar */
  left: 0;
  background-color: #f4f4f4;
  overflow-x: hidden;
  transition: all 0.3s ease;

}

.drawer-closed {
  width: 60px; /* Narrow width when the drawer is closed */
  height: fit-content;
  border-radius:0 50% 50% 0;
  transition: all 0.3s ease;
}

.drawer ul {
  list-style-type: none;
  padding: 0;
}

.drawer ul li {
  padding: 5px 10px;
  margin:10px 20px;
  width:fit-content;
}
.drawer ul li:hover {
  transition:all 0.5s ease;
  cursor:pointer;
  background-color: blue;
  border-radius: 20px;
  color:white
}

/* Toggle button styling */
.menu-icon {
  font-size: 24px;
  margin: 10px;
  float: right;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
}

  .charts{
    display: flex;
  }
  </style>
