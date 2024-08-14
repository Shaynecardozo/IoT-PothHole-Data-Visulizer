<template>
    <div class="carousel-container">
      <q-carousel
        v-model="slide"
        infinite
        animated
        autoplay
        swipeable
        control-color="black"
        arrows
        padding
        :interval="1000" 
        class="custom-carousel"
      >
        <q-carousel-slide v-for="(sensor, index) in sensors" :key="index" :name="index + 1">
          <div class="carousel-content">
            <h3>{{ sensor.title }}</h3>
            <component :is="sensor.component" v-bind="sensor.props" />
          </div>
        </q-carousel-slide>
      </q-carousel>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import PressureGaugeComponent from 'components/PressureGaugeComponent.vue';
  import LevelGaugeComponent from 'components/LevelGaugeComponent.vue';
  import FlowMeterGaugeComponent from 'components/FlowMeterGaugeComponent.vue';
  import axios from 'axios';
  import * as XLSX from 'xlsx';
  import * as d3 from 'd3';
  
  export default {
    components: {
      PressureGaugeComponent,
      LevelGaugeComponent,
      FlowMeterGaugeComponent,
    },
    setup() {
      const slide = ref(1);
      const sensors = ref([]);
  
      onMounted(() => {
        loadData().then(() => {
          sensors.value = [
            { title: 'Pressure Sensor 1', component: PressureGaugeComponent, props: { pressureAvg: pressureAvg.value } },
            { title: 'Level Sensor 1', component: LevelGaugeComponent, props: { levelAvg: levelAvg.value } },
            { title: 'Flowmeter 1', component: FlowMeterGaugeComponent, props: { flowAvg: flowAvg1.value, maxValue: 1500 } },
            { title: 'Flowmeter 2', component: FlowMeterGaugeComponent, props: { flowAvg: flowAvg2.value, maxValue: 2000 } },
            { title: 'Flowmeter 3', component: FlowMeterGaugeComponent, props: { flowAvg: flowAvg3.value, maxValue: 600 } },
            { title: 'Flowmeter 4', component: FlowMeterGaugeComponent, props: { flowAvg: flowAvg4.value, maxValue: 600 } }
          ];
        });
      });
  
      const pressureAvg = ref(0);
      const levelAvg = ref(0);
      const flowAvg1 = ref(0);
      const flowAvg2 = ref(0);
      const flowAvg3 = ref(0);
      const flowAvg4 = ref(0);
  
      async function loadData() {
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
          flowAvg1.value = d3.mean(flowData1);
          flowAvg2.value = d3.mean(flowData2);
          flowAvg3.value = d3.mean(flowData3);
          flowAvg4.value = d3.mean(flowData4);
          pressureAvg.value = d3.mean(pressureData);
          levelAvg.value = d3.mean(levelData);
        } catch (error) {
          console.error('Error loading Excel file:', error);
        }
      }
  
      return {
        slide,
        sensors,
        pressureAvg,
        levelAvg,
        flowAvg1,
        flowAvg2,
        flowAvg3,
        flowAvg4,
      };
    }
  };
  </script>
  
  <style scoped>
  .carousel-container {
    /* border: 2px solid #4caf50; */
    max-width: 100vw; /* Ensure the container does not exceed viewport width */
    overflow: hidden; /* Hide any overflow */
    /* box-shadow: 0 6px 12px rgba(0, 0, 0, 0.9); Shadow for the entire carousel container */
    border-radius: 10px; /* Rounded corners */
  }
  
  .custom-carousel {
    width: 100%;
    height: 100%;
  }
  
  .carousel-content {
    /* border: 2px solid #4caf50; */
    display: flex;
    flex-direction: column;
    align-items: center;
    /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); */
    border-radius: 8px;
    padding: 10px; /* Reduced padding to fit content better */
    background-color: #ffffff;
  }
  
  .carousel-content h3 {
    margin-bottom: 5px; /* Reduce space between header and gauge */
  }
  
  .q-carousel-slide {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  </style>
  