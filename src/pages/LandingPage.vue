<template height="90vh">
  <div class="landing-page">
    <div class="card-container top-cards">
      <div class="card small-card" @click="navigateTo('/potholes')" style="cursor: pointer;">
        <div class="card-content">
          <q-icon name="location_city" class="icon1"></q-icon>
          <div class="text-content">
            <p>Number of Constituencies</p>
            <h4>{{ constituenciesCount }} Constituencies</h4>
            <p class="constituency-name">{{ currentConstituency }}</p>
          </div>
        </div>
      </div>
      <div class="card small-card" @click="navigateTo('/Gauges')" style="cursor: pointer;">
        <div class="card-content">
          <q-icon name="sensors" class="icon1"></q-icon>
          <div class="text-content">
            <p>Number of Sensors</p>
            <h4>6 Sensors</h4>
            <p>{{ currentAverageName }}: {{ currentAverage.toFixed(2) }}{{ currentUnit }}</p>
          </div>
        </div>
      </div>
      <div class="card small-card">
        <div class="card-content">
          <q-icon name="verified" class="icon1"></q-icon>
          <div class="text-content">
            <p>Top Card 3</p>
            <h4>Content</h4>
          </div>
        </div>
      </div>
    </div>
    <div class="card-container bottom-cards">
      <div class="card big-card">
        <GaugeCarousel1 />
      </div>
      <div class="card big-card">
        <BarChartConstituency/>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import * as XLSX from 'xlsx';
import * as d3 from 'd3';
import GaugeCarousel1 from 'src/components/GaugeCarousel1.vue';
import BarChartConstituency from 'src/components/BarChartConstituency.vue';

export default {
  components: {
     GaugeCarousel1,
    BarChartConstituency
  },
  data() {
    return {
      constituenciesCount: 0,
      constituencies: [],
      currentConstituency: '',
      constituencyIndex: 0,
      pressureAvg: 0,
      levelAvg: 0,
      flowAvg1: 0,
      flowAvg2: 0,
      flowAvg3: 0,
      flowAvg4: 0,
      averageValues: [],
      averageNames: [],
      averageIndex: 0,
      Unit: []
    };
  },
  mounted() {
    this.loadData();
    this.fetchConstituencies();
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

        // Prepare average values for cycling
        this.averageValues = [
          this.pressureAvg,
          this.levelAvg,
          this.flowAvg1, // Assuming you want to show one of the flow averages
          this.flowAvg2,
          this.flowAvg3,
          this.flowAvg4
        ];

        this.averageNames = [
          "Pressure Avg",
          "Level Avg",
          "Flow1 Avg",
          "Flow2 Avg",
          "Flow3 Avg",
          "Flow4 Avg"
        ];
        this.Unit = [
          "Kg/cm²",
          "m",
          "m³/h",
          "m³/h",
          "m³/h",
          "m³/h"
        ];

        // Start cycling through average values
        this.cycleAverageValues();
      } catch (error) {
        console.error('Error loading Excel file:', error);
      }
    },
    fetchConstituencies() {
      fetch('/path/to/PotholeData for analysis_fileForInterns.geojson')
        .then(response => response.json())
        .then(data => {
          const constituenciesSet = new Set(
            data.features.map(feature => feature.properties.constituency)
          );
          this.constituencies = Array.from(constituenciesSet);
          this.constituenciesCount = this.constituencies.length;
          this.cycleConstituencyNames();
        })
        .catch(error => console.error('Error fetching constituencies data:', error));
    },
    navigateTo(h) {
      this.$router.push(h);
    },
    cycleConstituencyNames() {
      if (this.constituencies.length > 0) {
        this.currentConstituency = this.constituencies[this.constituencyIndex];
        setInterval(() => {
          this.constituencyIndex = (this.constituencyIndex + 1) % this.constituencies.length;
          this.currentConstituency = this.constituencies[this.constituencyIndex];
        }, 2000);
      }
    },
    cycleAverageValues() {
      if (this.averageValues.length > 0) {
        setInterval(() => {
          this.averageIndex = (this.averageIndex + 1) % this.averageValues.length;
        }, 2000); // Update every 2 seconds
      }
    }
  },
  computed: {
    currentAverage() {
      return this.averageValues[this.averageIndex] || 0;
    },
    currentAverageName() {
      return this.averageNames[this.averageIndex] || "";
    },
    currentUnit() {
      return this.Unit[this.averageIndex] || "";
    }
  }
};
</script>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  height: fit-content;
  gap: 25px; /* Adjust as needed */
  padding: 20px; /* Padding around the page */
}

.card-container {
  display: flex;
  gap: 10px;
}

.top-cards {
  justify-content: space-between;
}

.bottom-cards {
  justify-content: space-between;
}

.card {
  border: 2px solid #4caf50; /* Green border */
  padding: 15px; /* Padding inside cards */
  border-radius: 8px; /* Rounded corners */
  background-color: #ffffff; /* White background */
  box-shadow: 0 2px 10px rgba(3, 201, 36, 0.548);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
}

.card h4 {
  margin: 0;
}

.card p {
  font-size: 1em;
  margin: 0;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 10px; /* Space between icon and text */
}

.icon1 {
  font-size: 3em; /* Increase icon size */
}

.text-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.constituency-name {
  font-size: 1.2em;
  color: #ffffff;
  transition: opacity 0.5s ease;
}

.small-card {
  flex: 1;
  max-width: 30%;
  min-height: 150px; /* Fixed height for equal sizing */
  background: linear-gradient(135deg, #2f4550, #4caf50);
  color: white;
  transition: all 0.6s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.small-card:hover {
  background: linear-gradient(135deg, #4caf50, #2f4550);
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.6);
}

.big-card {
  flex: 1;
  height: 400px; /* Fixed height for bottom cards */
  background: #ffffff; /* White background */
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;

}
</style>
