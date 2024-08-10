<template>
  <div class="container">
    <MultiLine :data="iotData" :filter="filter" class="chart" />
    <div class="sidebar">
      <select v-model="filter" @change="loadData">
        <option value="day">Day</option>
        <option value="month">Month</option>
        <option value="year">Year</option>
      </select>
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
import { ref, onMounted } from 'vue';
import MultiLine from 'components/MultiLine.vue';
import * as XLSX from 'xlsx';
import axios from 'axios';
import * as d3 from 'd3';

export default {
  components: {
    MultiLine
  },
  setup() {
    const iotData = ref([]);
    const filter = ref('day');
    const sensors = ref(['Flowmeter 1', 'Flowmeter 2', 'Flowmeter 3', 'Flowmeter 4']);
    const colors = d3.scaleOrdinal(d3.schemeCategory10);

    const loadData = async () => {
      try {
        const response = await axios.get('/IOTData for analysis_fileForInterns.ods', { responseType: 'arraybuffer' });
        const data = new Uint8Array(response.data);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        iotData.value = XLSX.utils.sheet_to_json(worksheet, { header: 1 }).slice(1).map((row) => ({
          date: row[0],
          'Flowmeter 1': row[1],
          'Flowmeter 2': row[3],
          'Flowmeter 3': row[5],
          'Flowmeter 4': row[7],
        }));
      } catch (error) {
        console.error('Error loading Excel file:', error);
      }
    };

    onMounted(() => {
      loadData();
    });

    return {
      iotData,
      filter,
      sensors,
      colors,
      loadData
    };
  }
};
</script>

<style scoped>
.container {
  display: flex;
  margin-left: 110px;
  margin-right: 110px;
  margin-top: 10%;
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
</style>