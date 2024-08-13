<template>
  <div>
    <!-- Threshold Input and Button -->
    <input v-model.number="userThreshold" type="number" class="threshold-input" placeholder="Set Threshold Value" />
    <button @click="toggleThreshold" class="threshold-button">
      Threshold Value is {{ thresholdEnabled ? 'Enabled' : 'Disabled' }} ({{ userThreshold }})
    </button>

    <!-- Bar Chart -->
    <div class="chart" ref="chartRef"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import * as d3 from 'd3';

const props = defineProps(['data', 'filter', 'startDate', 'endDate', 'initialThreshold']);
const chartRef = ref(null);

const sensors = ref(['flowmeter1', 'flowmeter2', 'flowmeter3', 'flowmeter4']);
const colors = d3.scaleOrdinal(d3.schemeCategory10);

const thresholdEnabled = ref(false); // State to control threshold visibility
const userThreshold = ref(props.initialThreshold || 0); // State for user-defined threshold

// Compute filtered data
const filteredData = computed(() => {
  if (!props.data || !props.data.length) return [];

  const parseDate = d3.timeParse("%d-%m-%Y %H:%M");

  const parsedData = props.data.map(d => {
    const parsedDate = parseDate(d.date);
    if (!parsedDate) return null;

    return {
      date: parsedDate,
      flowmeter1: +d['Flowmeter 1'],
      flowmeter2: +d['Flowmeter 2'],
      flowmeter3: +d['Flowmeter 3'],
      flowmeter4: +d['Flowmeter 4'],
    };
  }).filter(d => d !== null);

  // Apply date range filter
  const startDate = props.startDate ? new Date(props.startDate) : new Date(-8640000000000000); // min date
  const endDate = props.endDate ? new Date(props.endDate) : new Date(8640000000000000); // max date

  const dateFilteredData = parsedData.filter(d => d.date >= startDate && d.date <= endDate);

  let groupedData = [];

  switch (props.filter) {
    case 'day':
      groupedData = d3.groups(dateFilteredData, d => d3.timeDay(d.date))
        .map(([key, values]) => aggregateSensorData(key, values));
      break;
    case 'month':
      groupedData = d3.groups(dateFilteredData, d => d3.timeMonth(d.date))
        .map(([key, values]) => aggregateSensorData(key, values));
      break;
    case 'year':
      groupedData = d3.groups(dateFilteredData, d => d3.timeYear(d.date))
        .map(([key, values]) => aggregateSensorData(key, values));
      break;
    default:
      groupedData = dateFilteredData;
      break;
  }

  return groupedData.map(d => ({
    date: new Date(d.date),
    flowmeter1: d.flowmeter1,
    flowmeter2: d.flowmeter2,
    flowmeter3: d.flowmeter3,
    flowmeter4: d.flowmeter4
  }));
});

const aggregateSensorData = (date, values) => {
  const average = (arr) => d3.mean(arr, v => v || 0);
  return {
    date: date,
    flowmeter1: average(values.map(v => v.flowmeter1)),
    flowmeter2: average(values.map(v => v.flowmeter2)),
    flowmeter3: average(values.map(v => v.flowmeter3)),
    flowmeter4: average(values.map(v => v.flowmeter4)),
  };
};

// Get axis ticks
const getAxisTicks = () => {
  switch (props.filter) {
    case 'day':
      return d3.timeDay.every(1);
    case 'month':
      return d3.timeMonth.every(1);
    case 'year':
      return d3.timeYear.every(1);
    default:
      return d3.timeDay.every(1);
  }
};

// Get axis date format
const getAxisDateFormat = () => {
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  switch (props.filter) {
    case 'day':
      return (date) => {
        const day = date.getDate();
        const suffix = getOrdinalSuffix(day);
        return d3.timeFormat(`%d${suffix} %B`)(date);
      };
    case 'month':
      return d3.timeFormat("%B %Y");
    case 'year':
      return d3.timeFormat("%Y");
    default:
      return d3.timeFormat("%d-%m-%Y");
  }
};

// Get tooltip date format
const getTooltipDateFormat = () => {
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  switch (props.filter) {
    case 'day':
      return (date) => {
        const day = date.getDate();
        const suffix = getOrdinalSuffix(day);
        return d3.timeFormat(`%d${suffix} %B %Y`)(date);
      };
    case 'month':
      return d3.timeFormat("%B %Y");
    case 'year':
      return d3.timeFormat("%Y");
    default:
      return d3.timeFormat("%d-%m-%Y");
  }
};

const toggleThreshold = () => {
  thresholdEnabled.value = !thresholdEnabled.value;
  renderChart();
};

// Render chart
const renderChart = () => {
  d3.select(chartRef.value).selectAll('*').remove();

  if (!filteredData.value.length) return;

  const margin = { top: 20, right: 20, bottom: 50, left: 60 },
    width = 1400 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3.select(chartRef.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x0 = d3.scaleBand().range([0, width]).padding(0.2);
  const x1 = d3.scaleBand().padding(0.05);
  const y = d3.scaleLinear().range([height, 0]);

  x0.domain(filteredData.value.map(d => d.date));
  x1.domain(sensors.value).range([0, x0.bandwidth()]);

  // Set the y-axis domain based on the maximum value, considering the threshold
  y.domain([0, Math.max(d3.max(filteredData.value, d => d3.max(sensors.value, key => +d[key] || 0)), userThreshold.value)]);

  const xAxis = svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x0).tickFormat(getAxisDateFormat()));

  xAxis.selectAll('text')
    .attr('transform', 'rotate(-40)')
    .style('text-anchor', 'end');

  svg.append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(y).ticks(10));

  const bars = svg.selectAll('.bar-group')
    .data(filteredData.value)
    .enter().append('g')
    .attr('transform', d => `translate(${x0(d.date)},0)`);

  bars.selectAll('rect')
    .data(d => sensors.value.map(sensor => {
      const value = +d[sensor];
      // Only include bars with values less than or equal to the threshold
      return thresholdEnabled.value && value > userThreshold.value ? null : { key: sensor, value, date: d.date };
    }).filter(d => d !== null))  // Filter out null values
    .enter().append('rect')
    .attr('x', d => x1(d.key))
    .attr('y', d => y(0))
    .attr('width', x1.bandwidth())
    .attr('height', 0)
    .attr('fill', d => colors(d.key))
    .transition()
    .duration(1000)
    .attr('y', d => y(d.value))
    .attr('height', d => height - y(d.value));

  bars.selectAll('rect')
    .on('mouseover', function(event, d) {
      d3.select(this).attr('fill', 'orange');
      const formatDate = getTooltipDateFormat();
      d3.select(this)
        .append('title')
        .text(`Value: ${d.value.toFixed(2)}\n${formatDate(d.date)}`);
    })
    .on('mouseout', function(event, d) {
      d3.select(this).attr('fill', colors(d.key));
      d3.select(this).select('title').remove();
    });

  if (thresholdEnabled.value) {
    // Add threshold line
    svg.append("line")
      .attr("class", "threshold-line")
      .attr("x1", 0)
      .attr("y1", y(userThreshold.value))
      .attr("x2", width)
      .attr("y2", y(userThreshold.value))
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4");
  }
};



onMounted(renderChart);
watch([() => props.data, () => props.filter, () => props.startDate, () => props.endDate, userThreshold, thresholdEnabled], renderChart);

</script>

<style scoped>
.chart {
  width: 100%;
  height: 500px;
}

.axis text {
  font-size: 12px;
}

.threshold-input {
  margin-right: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  width: 150px;
}

.threshold-button {
  padding: 10px 20px;
  background-color: #000000;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.threshold-button:hover {
  background-color: #333333;
}

.threshold-line {
  stroke: red;
  stroke-width: 2;
  stroke-dasharray: 4,4;
}
</style>
