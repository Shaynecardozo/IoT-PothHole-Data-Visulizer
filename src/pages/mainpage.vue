<template>
  <div id="app">
    <div class="row">
      <!-- Pressure Sensor -->
      <div class="column" v-if="selectedGauge === null || selectedGauge === 'pressure'">
        <h3 v-if="selectedGauge === 'pressure' || selectedGauge === null">Pressure Sensor 1</h3>
        <PressureGaugeComponent
          v-if="selectedGauge === 'pressure' || selectedGauge === null"
          :pressureAvg="pressureAvg"
          @gauge-clicked="handleGaugeClick('pressure')"
        />

        <!-- Filter Controls for Pressure Gauge -->
        <div v-if="selectedGauge === 'pressure'" class="filter-controls">
          <label for="filter">Select Filter:</label>
          <select id="filter" v-model="filter">
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
          <!-- back button -->
          <div class="q-pa-md">
              <button @click="goBack" class="back-button">Back to Main Page</button>
          </div>
        </div>
        <BarChartComponent
          v-if="selectedGauge === 'pressure'"
          :data="pressureData"
          :filter="filter"
          :startDate="startDate"
          :endDate="endDate"
        />
        <TimeSeriesLineChartComponent
          v-if="selectedGauge === 'pressure'"
          :data="pressureData"
          :filter="filter"
          :startDate="startDate"
          :endDate="endDate"
        />
      </div>

      <!-- Level Sensor -->
      <div class="column" v-if="selectedGauge === null || selectedGauge === 'level'">
        <h3 v-if="selectedGauge === 'level' || selectedGauge === null">Level Sensor 1</h3>
        <LevelGaugeComponent
          v-if="selectedGauge === 'level' || selectedGauge === null"
          :levelAvg="levelAvg"
          @gauge-clicked="handleGaugeClick('level')"
        />

        <!-- Filter Controls for Level Gauge -->
        <div v-if="selectedGauge === 'level'" class="filter-controls">
          <label for="filter">Select Filter:</label>
          <select id="filter" v-model="filter">
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
          <!-- back button -->
          <div class="q-pa-md">
              <button @click="goBack" class="back-button">Back to Main Page</button>
          </div>
        </div>
        <BarChartComponent
          v-if="selectedGauge === 'level'"
          :data="levelData"
          :filter="filter"
          :startDate="startDate"
          :endDate="endDate"
        />
        <TimeSeriesLineChartComponent
          v-if="selectedGauge === 'level'"
          :data="levelData"
          :filter="filter"
          :startDate="startDate"
          :endDate="endDate"
        />
      </div>

      <!-- Flowmeter 1 -->
      <div class="column" v-if="selectedGauge === null || selectedGauge === 'flow1'">
        <h3 v-if="selectedGauge === 'flow1' || selectedGauge === null">Flowmeter 1</h3>
        <FlowMeterGaugeComponent
          v-if="selectedGauge === 'flow1' || selectedGauge === null"
          :flowAvg="flowAvg1"
          :maxValue="1500"
          @gauge-clicked="handleGaugeClick('flow1')"
        />

        <!-- Filter Controls for Flowmeter 1 -->
        <div v-if="selectedGauge === 'flow1'" class="filter-controls">
          <label for="filter">Select Filter:</label>
          <select id="filter" v-model="filter">
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
          <!-- back button -->
          <div class="q-pa-md">
              <button @click="goBack" class="back-button">Back to Main Page</button>
          </div>
        </div>
        <BarChartComponent
          v-if="selectedGauge === 'flow1'"
          :data="flow1Data"
          :filter="filter"
          :startDate="startDate"
          :endDate="endDate"
        />
        <TimeSeriesLineChartComponent
          v-if="selectedGauge === 'flow1'"
          :data="flow1Data"
          :filter="filter"
          :startDate="startDate"
          :endDate="endDate"
        />
      </div>
    </div>

    <div class="row">
      <!-- Flowmeter 2 -->
      <div class="column" v-if="selectedGauge === null || selectedGauge === 'flow2'">
        <h3 v-if="selectedGauge === 'flow2' || selectedGauge === null">Flowmeter 2</h3>
        <FlowMeterGaugeComponent
          v-if="selectedGauge === 'flow2' || selectedGauge === null"
          :flowAvg="flowAvg2"
          :maxValue="2000"
          @gauge-clicked="handleGaugeClick('flow2')"
        />

        <!-- Filter Controls for Flowmeter 2 -->
        <div v-if="selectedGauge === 'flow2'" class="filter-controls">
          <label for="filter">Select Filter:</label>
          <select id="filter" v-model="filter">
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
          <!-- back button -->
          <div class="q-pa-md">
              <button @click="goBack" class="back-button">Back to Main Page</button>
          </div>
        </div>
        <BarChartComponent
          v-if="selectedGauge === 'flow2'"
          :data="flow2Data"
          :filter="filter"
          :startDate="startDate"
          :endDate="endDate"
        />
        <TimeSeriesLineChartComponent
          v-if="selectedGauge === 'flow2'"
          :data="flow2Data"
          :filter="filter"
          :startDate="startDate"
          :endDate="endDate"
        />
      </div>

      <!-- Flowmeter 3 -->
      <div class="column" v-if="selectedGauge === null || selectedGauge === 'flow3'">
        <h3 v-if="selectedGauge === 'flow3' || selectedGauge === null">Flowmeter 3</h3>
        <FlowMeterGaugeComponent
          v-if="selectedGauge === 'flow3' || selectedGauge === null"
          :flowAvg="flowAvg3"
          :maxValue="600"
          @gauge-clicked="handleGaugeClick('flow3')"
        />

        <!-- Filter Controls for Flowmeter 3 -->
        <div v-if="selectedGauge === 'flow3'" class="filter-controls">
          <label for="filter">Select Filter:</label>
          <select id="filter" v-model="filter">
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
          <!-- back button -->
          <div class="q-pa-md">
              <button @click="goBack" class="back-button">Back to Main Page</button>
          </div>
        </div>
        <BarChartComponent
          v-if="selectedGauge === 'flow3'"
          :data="flow3Data"
          :filter="filter"
          :startDate="startDate"
          :endDate="endDate"
        />
        <TimeSeriesLineChartComponent
          v-if="selectedGauge === 'flow3'"
          :data="flow3Data"
          :filter="filter"
          :startDate="startDate"
          :endDate="endDate"
        />
      </div>

      <!-- Flowmeter 4 -->
      <div class="column" v-if="selectedGauge === null || selectedGauge === 'flow4'">
        <h3 v-if="selectedGauge === 'flow4' || selectedGauge === null">Flowmeter 4</h3>
        <FlowMeterGaugeComponent
          v-if="selectedGauge === 'flow4' || selectedGauge === null"
          :flowAvg="flowAvg4"
          :maxValue="600"
          @gauge-clicked="handleGaugeClick('flow4')"
        />

        <!-- Filter Controls for Flowmeter 4 -->
        <div v-if="selectedGauge === 'flow4'" class="filter-controls">
          <label for="filter">Select Filter:</label>
          <select id="filter" v-model="filter">
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
          <!-- back button -->
          <div class="q-pa-md">
              <button @click="goBack" class="back-button">Back to Main Page</button>
          </div>
        </div>
        <BarChartComponent
          v-if="selectedGauge === 'flow4' "
          :data="flow4Data"
          :filter="filter"
          :startDate="startDate"
          :endDate="endDate"
        />
        <TimeSeriesLineChartComponent
          v-if="selectedGauge === 'flow4' "
          :data="flow4Data"
          :filter="filter"
          :startDate="startDate"
          :endDate="endDate"
        />
      </div>
    </div>
    <div v-if="selectedGauge===null" class="container">
      <MultiLine :data="iotData" :filter="filter1" :startDate="startDate1" :endDate="endDate1"  class="chart" />

      <div class="sidebar">
        <select v-model="filter1" @change="loadData">
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
        <div class="date-range-controls">
            <label for="startDate">Start Date:</label>
            <input type="date" id="startDate" v-model="startDate1" />

            <label for="endDate">End Date:</label>
            <input type="date" id="endDate" v-model="endDate1" />
          </div>

        <div class="legend">
          <div class="legend-item" v-for="(sensor, index) in sensors" :key="sensor">
            <div class="legend-color" :style="{ backgroundColor: colors(index) }"></div>
            <span>{{ sensor }}</span>
          </div>
        </div>
      </div>

    </div>

    <div v-if="selectedGauge===null" class="container">
      <ComparisonBarChartComponent :data="iotData" :filter="filter2" :startDate="startDate2" :endDate="endDate2" class="chart" />

      <div class="sidebar">
        <select v-model="filter2" @change="loadData">
          <option value="day">Day</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
        <div class="date-range-controls">
            <label for="startDate">Start Date:</label>
            <input type="date" id="startDate" v-model="startDate2" />

            <label for="endDate">End Date:</label>
            <input type="date" id="endDate" v-model="endDate2" />
          </div>

        <div class="legend">
          <div class="legend-item" v-for="(sensor, index) in sensors" :key="sensor">
            <div class="legend-color" :style="{ backgroundColor: colors(index) }"></div>
            <span>{{ sensor }}</span>
          </div>
        </div>
      </div>

    </div>


  </div>
</template>

<script>

import PressureGaugeComponent from 'components/PressureGaugeComponent.vue';
import LevelGaugeComponent from 'components/LevelGaugeComponent.vue';
import FlowMeterGaugeComponent from 'components/FlowMeterGaugeComponent.vue';
import BarChartComponent from 'components/BarChartComponent.vue';
import TimeSeriesLineChartComponent from 'components/TimeSeriesLineChartComponent.vue';
import MultiLine from 'components/MultiLine.vue';
import ComparisonBarChartComponent from 'components/ComparisonBarChartComponent.vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import * as d3 from 'd3';

export default {
  components: {
    PressureGaugeComponent,
    LevelGaugeComponent,
    FlowMeterGaugeComponent,
    BarChartComponent,
    ComparisonBarChartComponent,
    TimeSeriesLineChartComponent,
    MultiLine,

  },
  data() {
    return {
      pressureAvg: 0,
      levelAvg: 0,
      flowAvg1: 0,
      flowAvg2: 0,
      flowAvg3: 0,
      flowAvg4: 0,
      selectedGauge: null,
      pressureData: [],
      levelData: [],
      flow1Data: [],
      flow2Data: [],
      flow3Data: [],
      flow4Data: [],
      filter: 'day',
      filter1: 'day',
      filter2: 'day',
      chartType: 'bar',
      startDate: new Date(-8640000000000000),
      endDate: new Date(8640000000000000),
      startDate1: new Date(-8640000000000000),
      endDate1: new Date(8640000000000000),
      startDate2: new Date(-8640000000000000),
      endDate2: new Date(8640000000000000),
      iotData: [],
      sensors: ['Flowmeter 1', 'Flowmeter 2', 'Flowmeter 3', 'Flowmeter 4'],
      colors: d3.scaleOrdinal(d3.schemeCategory10),
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

        // Process sensor data
        const flowData1 = jsonData.slice(1).map(row => row[1]);
        const flowData2 = jsonData.slice(1).map(row => row[3]);
        const flowData3 = jsonData.slice(1).map(row => row[5]);
        const flowData4 = jsonData.slice(1).map(row => row[7]);
        const pressureData = jsonData.slice(1).map(row => row[9]);
        const levelData = jsonData.slice(1).map(row => row[11]);

        // Calculate averages
        this.flowAvg1 = d3.mean(flowData1);
        this.flowAvg2 = d3.mean(flowData2);
        this.flowAvg3 = d3.mean(flowData3);
        this.flowAvg4 = d3.mean(flowData4);
        this.pressureAvg = d3.mean(pressureData);
        this.levelAvg = d3.mean(levelData);

        // Prepare data for charts
        const dates1 = jsonData.slice(1).map(row => row[0]);
        const dates2 = jsonData.slice(1).map(row => row[2]);
        const dates3 = jsonData.slice(1).map(row => row[4]);
        const dates4 = jsonData.slice(1).map(row => row[6]);
        const dates5 = jsonData.slice(1).map(row => row[8]);
        const dates6 = jsonData.slice(1).map(row => row[10]);

        this.flow1Data = dates1.map((date, index) => ({ date, value: flowData1[index] }));
        this.flow2Data = dates2.map((date, index) => ({ date, value: flowData2[index] }));
        this.flow3Data = dates3.map((date, index) => ({ date, value: flowData3[index] }));
        this.flow4Data = dates4.map((date, index) => ({ date, value: flowData4[index] }));
        this.pressureData = dates5.map((date, index) => ({ date, value: pressureData[index] }));
        this.levelData = dates6.map((date, index) => ({ date, value: levelData[index] }));

        // Update the multiline data
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
    resetDateRanges() {
    const defaultStartDate = new Date(-8640000000000000);
    const defaultEndDate = new Date(8640000000000000);
    this.startDate = defaultStartDate;
    this.endDate = defaultEndDate;
    this.startDate1 = defaultStartDate;
    this.endDate1 = defaultEndDate;
    this.startDate2 = defaultStartDate;
    this.endDate2 = defaultEndDate;
  },
  handleGaugeClick(gauge) {
    this.selectedGauge = this.selectedGauge === gauge ? null : gauge;
    this.resetDateRanges();
  },
  goBack() {
    this.selectedGauge = null;
    this.resetDateRanges();
  },
  },
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #040c6e;
  margin-top: 5px;
  margin-bottom: 5px;
}

.row {
  display: flex;
  justify-content: center;
  margin-bottom: 1px;
}

.row + .row {
  margin-top: -100px;
}

.column {
  flex: 1;
  text-align: center;
}

.filter-controls {
  margin: auto;
  padding: 5px;
  background-color: #f0f0f0;
  border-radius: 5px;
  width: 200px;
}

.filter-controls label {
  display: block;
  margin-bottom: 5px;
}

.filter-controls select {
  width: 100%;
}

/* Multiline Chart Section */
.container {
  display: flex;
  margin-left: 110px;
  margin-right: 110px;
  margin-top: 5%; /* Adjust to your layout */
}

.sidebar {
  width: 160px;
  height: 250px;
  padding: 20px;
  background-color: #f5f5f5;
}

select {
  margin-bottom: 20px;
  padding: 5px;
  font-size: 16px;
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
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border-radius: 2px;
}

.chart {
  flex-grow: 1;
}
.date-range-controls {
  margin-top: 10px;
}
.filter-controls {
  margin-bottom: 20px;
}
.back-button {
  background-color: #f0f0f0;
  cursor: pointer;
}
</style>
