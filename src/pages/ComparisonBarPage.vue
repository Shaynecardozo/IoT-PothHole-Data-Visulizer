<template>
    <div class="container">
      <ComparisonBarChartComponent :data="iotData" :filter="filter" :startDate="startDate" :endDate="endDate" class="chart" />
      
      <div class="sidebar">
        <select v-model="filter" @change="loadData">
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
        <div class="date-range-controls">
          <label for="startDate">Start Date:</label>
          <input type="date" id="startDate" v-model="startDate" />
  
          <label for="endDate">End Date:</label>
          <input type="date" id="endDate" v-model="endDate" />
        </div>
  
        <div class="legend">
          <div class="legend-item" v-for="(sensor, index) in sensors" :key="sensor">
            <div class="legend-color" :style="{ backgroundColor: colors(index) }"></div>
            <span>{{ sensor }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import ComparisonBarChartComponent from 'components/ComparisonBarChartComponent.vue';
  import axios from 'axios';
  import * as XLSX from 'xlsx';
  import * as d3 from 'd3';
  
  export default {
    components: {
      ComparisonBarChartComponent,
    },
    data() {
      return {
        filter: 'day',
        startDate: new Date(-8640000000000000),
        endDate: new Date(8640000000000000),
        iotData: [],
        sensors: ['Flowmeter 1', 'Flowmeter 2', 'Flowmeter 3', 'Flowmeter 4'],
        colors: d3.scaleOrdinal([
      "#006400", // DarkGreen
      "#32CD32", // LimeGreen
      "#8FBC8F", // DarkSeaGreen
      "#ADFF2F", // GreenYellow
    ]),
      };
    },
    mounted() {
      this.loadData();
    },
    methods: {
      async loadData() {
        try {
          const response = await axios.get('/IOTData for analysis_fileForInterns.ods', { responseType: 'arraybuffer' });
          const data = new Uint8Array(response.data);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
          // Prepare data for charts
          this.iotData = jsonData.slice(1).map(row => ({
            date: row[0],
            'Flowmeter 1': row[1],
            'Flowmeter 2': row[3],
            'Flowmeter 3': row[5],
            'Flowmeter 4': row[7],
          }));
        } catch (error) {
          console.error('Error loading Excel file:', error);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .container {
    display: flex;
    margin-left: 110px;
    margin-right: 110px;
    margin-top: 5%;
  }
  
  .sidebar {
    width: 160px;
    height: 350px;
    padding: 20px;
    background-color: #e3faea;
    margin-top: 150px;
    margin-right: 20px;
    margin-left: 20px;
    border-radius: 20px;
  }
  
  select {
    margin-bottom: 20px;
    padding: 5px;
    font-size: 16px;
    border-radius: 8px;
    border-color: #a0eab6;
    margin-left: 19px;
  }
  
  .date-range-controls {
    margin-bottom: 20px;
  }
  
  .legend {
    margin-top: 20px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
  }
  
  .legend-color {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    border-radius: 2px;
  }

  .date-range-controls input {
  border-radius: 8px;
  border-color: #a0eab6;
  margin-bottom: 15px;
}

  .chart {
    flex: 1;
  }
  </style>
  