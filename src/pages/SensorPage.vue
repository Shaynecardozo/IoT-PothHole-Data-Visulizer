<template>
  <div id="app">

    <div class="q-pa-md back" v-if="selectedGauge !== null">
    <button @click="goBack" class="back-button">
      <q-icon name="arrow_back" /> Back
    </button>
  </div>

    <div class="row">
      <!-- Pressure Sensor -->
      <div class="column" v-if="selectedGauge === null || selectedGauge === 'pressure'">
        <div class="row">
          <div class="gauge-and-filter">
            <div class="gauge-container card">
              <h3 v-if="selectedGauge === 'pressure' || selectedGauge === null"
                style="color: #0e5b20; font-size: 36px;">Pressure Sensor</h3>
              <PressureGaugeComponent v-if="selectedGauge === 'pressure' || selectedGauge === null"
                :pressureAvg="pressureAvg" @gauge-clicked="handleGaugeClick('pressure')" />
            </div>
            <!-- Filter Controls for Pressure Gauge -->
            <div v-if="selectedGauge === 'pressure'" class="filter-container">
              <!-- <label for="filter">Select Filter:</label> -->
              <select id="filter" v-model="filter">
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>


              <div class="date-range-controls">
                <label for="startDate" style="color: black;">Start Date:</label>
                <input type="date" id="startDate" v-model="startDate" />

                <label for="endDate" style="color: black;">End Date:</label>
                <input type="date" id="endDate" v-model="endDate" />
              </div>
              <div class="threshold-controls">
                <div class="threshold-label">
                  <p>Set threshold:</p>
                </div>
                <input v-model.number="userThreshold" type="number" class="threshold-input"
                  placeholder="Set Threshold Value" />
                <button @click="toggleThreshold" class="threshold-button">
                  {{ thresholdEnabled ? 'Enabled' : 'Disabled' }}
                </button>
              </div>
            </div>

          </div>
        </div>

        <BarChartComponent v-if="selectedGauge === 'pressure'" :data="pressureData" :filter="filter"
          :startDate="startDate" :endDate="endDate" :threshold="userThreshold" :threshold-enabled="thresholdEnabled" />
        <TimeSeriesLineChartComponent v-if="selectedGauge === 'pressure'" :data="pressureData" :filter="filter"
          :startDate="startDate" :endDate="endDate" :threshold="userThreshold" :threshold-enabled="thresholdEnabled" />
      </div>

      <!-- Level Sensor -->
      <div class="column" v-if="selectedGauge === null || selectedGauge === 'level'">
        <div class="row">
          <div class="gauge-and-filter">
            <div class="gauge-container card">
              <h3 v-if="selectedGauge === 'level' || selectedGauge === null" style="color: #0e5b20; font-size: 36px;">
                Level Sensor</h3>
              <LevelGaugeComponent v-if="selectedGauge === 'level' || selectedGauge === null" :levelAvg="levelAvg"
                @gauge-clicked="handleGaugeClick('level')" />
            </div>

            <!-- Filter Controls for Level Gauge -->
            <div v-if="selectedGauge === 'level'" class="filter-container">
              <select id="filter" v-model="filter">
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>

              <div class="date-range-controls">
                <label for="startDate" style="color: black;">Start Date:</label>
                <input type="date" id="startDate" v-model="startDate" />

                <label for="endDate" style="color: black;">End Date:</label>
                <input type="date" id="endDate" v-model="endDate" />
              </div>
              <div class="threshold-controls">
                <div class="threshold-label">
                  <p>Set threshold:</p>
                </div>
                <input v-model.number="userThreshold" type="number" class="threshold-input"
                  placeholder="Set Threshold Value" />
                <button @click="toggleThreshold" class="threshold-button">
                  {{ thresholdEnabled ? 'Enabled' : 'Disabled' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <BarChartComponent v-if="selectedGauge === 'level'" :data="levelData" :filter="filter" :startDate="startDate"
          :endDate="endDate" :threshold="userThreshold" :threshold-enabled="thresholdEnabled" />
        <TimeSeriesLineChartComponent v-if="selectedGauge === 'level'" :data="levelData" :filter="filter"
          :startDate="startDate" :endDate="endDate" :threshold="userThreshold" :threshold-enabled="thresholdEnabled"/>
      </div>

      <!-- Flowmeter 1 -->
      <div class="column" v-if="selectedGauge === null || selectedGauge === 'flow1'">
        <div class="row">
          <div class="gauge-and-filter">
            <div class="gauge-container card">
              <h3 v-if="selectedGauge === 'flow1' || selectedGauge === null" style="color: #0e5b20; font-size: 36px;">
                Flowmeter 1</h3>
              <FlowMeterGaugeComponent v-if="selectedGauge === 'flow1' || selectedGauge === null" :flowAvg="flowAvg1"
                :maxValue="1500" @gauge-clicked="handleGaugeClick('flow1')" />
            </div>

            <!-- Filter Controls for Flowmeter 1 -->
            <div v-if="selectedGauge === 'flow1'" class="filter-container">
              <select id="filter" v-model="filter">
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>

              <div class="date-range-controls">
                <label for="startDate" style="color: black;">Start Date:</label>
                <input type="date" id="startDate" v-model="startDate" />

                <label for="endDate" style="color: black;">End Date:</label>
                <input type="date" id="endDate" v-model="endDate" />
              </div>
              <div class="threshold-controls">
                <div class="threshold-label">
                  <p>Set threshold:</p>
                </div>
                <input v-model.number="userThreshold" type="number" class="threshold-input"
                  placeholder="Set Threshold Value" />
                <button @click="toggleThreshold" class="threshold-button">
                  {{ thresholdEnabled ? 'Enabled' : 'Disabled' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <BarChartComponent v-if="selectedGauge === 'flow1'" :data="flow1Data" :filter="filter" :startDate="startDate"
          :endDate="endDate" :threshold="userThreshold" :threshold-enabled="thresholdEnabled"/>
        <TimeSeriesLineChartComponent v-if="selectedGauge === 'flow1'" :data="flow1Data" :filter="filter"
          :startDate="startDate" :endDate="endDate" :threshold="userThreshold" :threshold-enabled="thresholdEnabled"/>
      </div>
    </div>

    <div class="row">
      <!-- Flowmeter 2 -->
      <div class="column" v-if="selectedGauge === null || selectedGauge === 'flow2'">
        <div class="row">
          <div class="gauge-and-filter">
            <div class="gauge-container card">
              <h3 v-if="selectedGauge === 'flow2' || selectedGauge === null" style="color: #0e5b20; font-size: 36px;">
                Flowmeter 2</h3>
              <FlowMeterGaugeComponent v-if="selectedGauge === 'flow2' || selectedGauge === null" :flowAvg="flowAvg2"
                :maxValue="2000" @gauge-clicked="handleGaugeClick('flow2')" />
            </div>
            <!-- Filter Controls for Flowmeter 2 -->
            <div v-if="selectedGauge === 'flow2'" class="filter-container">
              <select id="filter" v-model="filter">
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>

              <div class="date-range-controls">
                <label for="startDate" style="color: black;">Start Date:</label>
                <input type="date" id="startDate" v-model="startDate" />

                <label for="endDate" style="color: black;">End Date:</label>
                <input type="date" id="endDate" v-model="endDate" />
              </div>
              <div class="threshold-controls">
                <div class="threshold-label">
                  <p>Set threshold:</p>
                </div>
                <input v-model.number="userThreshold" type="number" class="threshold-input"
                  placeholder="Set Threshold Value" />
                <button @click="toggleThreshold" class="threshold-button">
                  {{ thresholdEnabled ? 'Enabled' : 'Disabled' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <BarChartComponent v-if="selectedGauge === 'flow2'" :data="flow2Data" :filter="filter" :startDate="startDate"
          :endDate="endDate" :threshold="userThreshold" :threshold-enabled="thresholdEnabled"/>
        <TimeSeriesLineChartComponent v-if="selectedGauge === 'flow2'" :data="flow2Data" :filter="filter"
          :startDate="startDate" :endDate="endDate" :threshold="userThreshold" :threshold-enabled="thresholdEnabled"/>
      </div>

      <!-- Flowmeter 3 -->
      <div class="column" v-if="selectedGauge === null || selectedGauge === 'flow3'">
        <div class="row">
          <div class="gauge-and-filter">
            <div class="gauge-container card">
              <h3 v-if="selectedGauge === 'flow3' || selectedGauge === null" style="color: #0e5b20; font-size: 36px;">
                Flowmeter 3</h3>
              <FlowMeterGaugeComponent v-if="selectedGauge === 'flow3' || selectedGauge === null" :flowAvg="flowAvg3"
                :maxValue="600" @gauge-clicked="handleGaugeClick('flow3')" />
            </div>
            <!-- Filter Controls for Flowmeter 3 -->
            <div v-if="selectedGauge === 'flow3'" class="filter-container">
              <select id="filter" v-model="filter">
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>

              <div class="date-range-controls">
                <label for="startDate" style="color: black;">Start Date:</label>
                <input type="date" id="startDate" v-model="startDate" />

                <label for="endDate" style="color: black;">End Date:</label>
                <input type="date" id="endDate" v-model="endDate" />
              </div>
              <div class="threshold-controls">
                <div class="threshold-label">
                  <p>Set threshold:</p>
                </div>
                <input v-model.number="userThreshold" type="number" class="threshold-input"
                  placeholder="Set Threshold Value" />
                <button @click="toggleThreshold" class="threshold-button">
                  {{ thresholdEnabled ? 'Enabled' : 'Disabled' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <BarChartComponent v-if="selectedGauge === 'flow3'" :data="flow3Data" :filter="filter" :startDate="startDate"
          :endDate="endDate" :threshold="userThreshold" :threshold-enabled="thresholdEnabled"/>
        <TimeSeriesLineChartComponent v-if="selectedGauge === 'flow3'" :data="flow3Data" :filter="filter"
          :startDate="startDate" :endDate="endDate" :threshold="userThreshold" :threshold-enabled="thresholdEnabled"/>
      </div>

      <!-- Flowmeter 4 -->
      <div class="column" v-if="selectedGauge === null || selectedGauge === 'flow4'">
        <div class="row">
          <div class="gauge-and-filter">
            <div class="gauge-container card">
              <h3 v-if="selectedGauge === 'flow4' || selectedGauge === null" style="color: #0e5b20; font-size: 36px;">
                Flowmeter 4</h3>
              <FlowMeterGaugeComponent v-if="selectedGauge === 'flow4' || selectedGauge === null" :flowAvg="flowAvg4"
                :maxValue="600" @gauge-clicked="handleGaugeClick('flow4')" />
            </div>

            <!-- Filter Controls for Flowmeter 4 -->
            <div v-if="selectedGauge === 'flow4'" class="filter-container">
              <select id="filter" v-model="filter">
                <option value="day">Day</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>

              <div class="date-range-controls">
                <label for="startDate" style="color: black;">Start Date:</label>
                <input type="date" id="startDate" v-model="startDate" />

                <label for="endDate" style="color: black;">End Date:</label>
                <input type="date" id="endDate" v-model="endDate" />
              </div>
              <div class="threshold-controls">
                <div class="threshold-label">
                  <p>Set threshold:</p>
                </div>
                <input v-model.number="userThreshold" type="number" class="threshold-input"
                  placeholder="Set Threshold Value" />
                <button @click="toggleThreshold" class="threshold-button">
                  {{ thresholdEnabled ? 'Enabled' : 'Disabled' }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <BarChartComponent v-if="selectedGauge === 'flow4'" :data="flow4Data" :filter="filter" :startDate="startDate"
          :endDate="endDate" :threshold="userThreshold" :threshold-enabled="thresholdEnabled"/>
        <TimeSeriesLineChartComponent v-if="selectedGauge === 'flow4'" :data="flow4Data" :filter="filter"
          :startDate="startDate" :endDate="endDate" :threshold="userThreshold" :threshold-enabled="thresholdEnabled"/>
      </div>
    </div>

  </div>
</template>

<script>
import ComparisonBarChartComponent from 'components/ComparisonBarChartComponent.vue';
import PressureGaugeComponent from 'components/PressureGaugeComponent.vue';
import LevelGaugeComponent from 'components/LevelGaugeComponent.vue';
import FlowMeterGaugeComponent from 'components/FlowMeterGaugeComponent.vue';
import BarChartComponent from 'components/BarChartComponent.vue';
import TimeSeriesLineChartComponent from 'components/TimeSeriesLineChartComponent.vue';
import MultiLine from 'components/MultiLine.vue';
import axios from 'axios';
import * as XLSX from 'xlsx';
import * as d3 from 'd3';

export default {
  components: {
    ComparisonBarChartComponent,
    PressureGaugeComponent,
    LevelGaugeComponent,
    FlowMeterGaugeComponent,
    BarChartComponent,
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
      // filter1: 'day',
      // filter2: 'day',
      // chartType: 'bar',
      startDate: new Date(-8640000000000000),
      endDate: new Date(8640000000000000),

      // iotData: [],
      // sensors: ['Flowmeter 1', 'Flowmeter 2', 'Flowmeter 3', 'Flowmeter 4'],
      // colors: d3.scaleOrdinal(d3.schemeCategory10),
      // isDrawerOpen: true,
      // threshold: 6,
      userThreshold: 0,
      thresholdEnabled: false,
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
        // this.iotData = jsonData.slice(1).map(row => ({
        //   date: row[0],
        //   'Flowmeter 1': row[1],
        //   'Flowmeter 2': row[3],
        //   'Flowmeter 3': row[5],
        //   'Flowmeter 4': row[7],
        // }));

      } catch (error) {
        console.error('Error loading Excel file:', error);
      }
    },
    toggleThreshold() {
      this.thresholdEnabled = !this.thresholdEnabled;
    },
    resetDateRanges() {
      const defaultStartDate = new Date(-8640000000000000);
      const defaultEndDate = new Date(8640000000000000);
      this.startDate = defaultStartDate;
      this.endDate = defaultEndDate;
      this.userThreshold=0;
      this.thresholdEnabled= false;
      // this.startDate1 = defaultStartDate;
      // this.endDate1 = defaultEndDate;
      // this.startDate2 = defaultStartDate;
      // this.endDate2 = defaultEndDate;
    },
    handleGaugeClick(gauge) {
      this.selectedGauge = this.selectedGauge === gauge ? null : gauge;
      this.resetDateRanges();
    },
    goBack() {
      console.log("back button is clicked")
      this.selectedGauge = null;
      this.resetDateRanges();
    },
    // toggleDrawer() {
    //   this.isDrawerOpen = !this.isDrawerOpen;
    // },
    // RoutePage(value){
    //   this.$router.push(value)
    // }
  },
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #000000;
  /* margin-top: 3%; */
}

h3 {
  margin-bottom: 0px;
}

.row {
  display: flex;
  justify-content: space-evenly;
  margin-top:-5px

}

.column {
  flex: 1;
  text-align: center;
  padding: 10px;
  box-sizing: border-box;
}

.row+.row {
  margin-top: -50px;
}



/* Multiline Chart Section */
.container {
  display: flex;
  margin-left: 110px;
  margin-right: 110px;
  margin-top: 5%;
  /* Adjust to your layout */
}



select {
  margin-bottom: 10px;
  padding: 5px;
  font-size: 16px;
  border-radius: 8px;
  border-color: #a0eab6;
}


.chart {
  flex-grow: 1;
}

.back-button {
  background-color: #236d35;
  color: #f5f5f5;
  cursor: pointer;
  padding: 8px;
  padding-left: 20px;
  padding-right: 20px;
  border-radius: 9px;
  border: none;
  font-size: 18px;
}

.gauge-and-filter {
  display: flex;
  align-items: flex-start;
  /* Align items to the top */
  gap: 10px;
  /* Adjust the space between gauge and filter components */
  margin-bottom: 10px;
  /* Space below the row */
}

.gauge-container {
  flex: 1;
  cursor: pointer;
  /* Gauge takes available space */
  width: 500px;
  /* Set a fixed width or adjust as needed */
}

.filter-container {
  flex: 1;
  /* Filter takes available space */
  background-color: #e3faea;
  padding: 15px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  margin-top: 7%;
  max-width: 300px;
  /* Set a max width if necessary */
}


.threshold-controls {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.threshold-label p {
  margin: 0;
  margin-top: 5px;
  color: #000000;
}

.threshold-input {
  border-radius: 8px;
  border-color: #a0eab6;
  font-size: 16px;
}

.threshold-button {
  background-color: #0e5b20;
  color: #f5f5f5;
  cursor: pointer;
  padding: 8px;
  border-radius: 10px;
  border: none;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.threshold-button:hover {
  background-color: #0d4b1d;
  /* Darker green on hover */
}

/* Ensure the date range controls fit well */
.date-range-controls {
  display: flex;
  flex-direction: column;
  gap: 1px;
  /* Space between controls */
}

.date-range-controls input {
  border-radius: 8px;
  border-color: #a0eab6;
}
.q-icon{
 margin-bottom:4px ;

}
.back {
  display: flex;
  justify-content: flex-start;
  /* Aligns content to the left */
  /* margin-left: 15%; */

}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(3, 201, 36, 0.548);
  margin: 20px;
  padding: 20px;
  width: 100%;
  max-width: 500px;
  min-height: 325px;
  /* Set a fixed or minimum height */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  /* Smooth transition */
}

.card:hover {
  transform: scale(1.05);
  /* Enlarge the card by 5% */
  box-shadow: 0 4px 20px rgba(3, 201, 36, 0.548);
  /* Enhance the shadow on hover */
}
</style>
