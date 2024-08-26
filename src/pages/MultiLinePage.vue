<template>
  <div class="column">
    <div class="row">
      <div class="filter-container">
        <!-- Filter Controls -->
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
    <MultiLine
      :data="iotData"
      :filter="filter"
      :startDate="startDate"
      :endDate="endDate"
      class="chart"
    />
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
    const colors = d3.scaleOrdinal([
      "#006400", // DarkGreen
      "#32CD32", // LimeGreen
      "#8FBC8F", // DarkSeaGreen
      "#ADFF2F", // GreenYellow
    ]);
    const startDate = ref(new Date(-8640000000000000));
    const endDate = ref(new Date(8640000000000000));

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
      loadData,
      startDate,
      endDate
    };
  }
};
</script>


<style scoped>
.column {
  flex: 1;
  text-align: center;
  padding: 10px;
  box-sizing: border-box;
}

.row {
  display: flex;
  justify-content: center;
}

.filter-container {
  background-color: #e3faea;
  padding: 15px;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;

  display: flex;
  flex-direction: column;
  width: 300px;
  /* max-width: 300px; */
}

select {
  margin-bottom: 10px;
  padding: 5px;
  font-size: 16px;
  border-radius: 8px;
  border-color: #a0eab6;
}

.date-range-controls label {
  display: block;
  text-align: center;
  font-size: 14px;
  margin-bottom: 5px;
}

.date-range-controls {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.date-range-controls input {
  border-radius: 8px;
  border-color: #a0eab6;
}

.legend {
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.legend-color {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border-radius: 2px;
}

.chart {
  flex-grow: 1;
}
</style>
