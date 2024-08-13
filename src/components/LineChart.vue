<template>
  <div class="card line-chart">
    <div ref="lineChartContainer"></div>
  </div>
</template>

<script>
import { onMounted, watch, ref } from 'vue';
import * as d3 from 'd3';

export default {
  props: {
    selectedConstituency: String
  },
  setup(props) {
    const lineChartContainer = ref(null);

    const fetchGeoJSONData = async () => {
      try {
        const response = await fetch('/path/to/PotholeData for analysis_fileForInterns.geojson');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const geojsonData = await response.json();
        return geojsonData;
      } catch (error) {
        console.error("Error fetching GeoJSON data:", error);
        return null;
      }
    };

    const processGeoJSONData = (geojsonData) => {
      const counts = geojsonData.features.reduce((acc, feature) => {
        const properties = feature.properties;
        const date = new Date(properties.ComplaintReceived);
        const month = d3.timeFormat('%B')(date);

        if (!acc[month]) {
          acc[month] = { fixed: 0, unfixed: 0 };
        }

        if (properties.PWDVerifiedOn) {
          acc[month].fixed += 1;
        } else {
          acc[month].unfixed += 1;
        }

        return acc;
      }, {});

      const labels = Object.keys(counts).sort(d3.ascending);
      const fixedCounts = labels.map(label => counts[label].fixed);
      const unfixedCounts = labels.map(label => counts[label].unfixed);

      return { labels, fixedCounts, unfixedCounts };
    };

    const createLineChart = (data) => {
      const container = d3.select(lineChartContainer.value);
      container.html(''); // Clear any existing charts

      const width = 400;
      const height = 200;
      const margin = { top: 20, right: 20, bottom: 100, left: 50 };

      const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const xScale = d3.scaleBand()
        .domain(data.labels)
        .range([0, width])
        .padding(0.1);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max([...data.fixedCounts, ...data.unfixedCounts])])
        .range([height, 0]);

      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .selectAll('text')
        .attr('transform', 'rotate(-90)')
        .style('text-anchor', 'end');

      svg.append('g')
        .call(yAxis)
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text('Number of Complaints');

      const line = d3.line()
        .x((d, i) => xScale(data.labels[i]) + xScale.bandwidth() / 2)
        .y(d => yScale(d));

      svg.append('path')
        .datum(data.fixedCounts)
        .attr('fill', 'none')
        .attr('stroke', '#b56727')
        .attr('stroke-width', 2)
        .attr('d', line);

      svg.append('path')
        .datum(data.unfixedCounts)
        .attr('fill', 'none')
        .attr('stroke', '#ed7117')
        .attr('stroke-width', 2)
        .attr('d', line);
    };

    const updateChart = async () => {
      const geojsonData = await fetchGeoJSONData();
      if (geojsonData) {
        const filteredData = props.selectedConstituency
          ? geojsonData.features.filter(feature => feature.properties.constituency === props.selectedConstituency)
          : geojsonData.features;

        const processedData = processGeoJSONData({ features: filteredData });
        createLineChart(processedData);
      }
    };

    watch(() => props.selectedConstituency, updateChart, { immediate: true });

    onMounted(updateChart);

    return { lineChartContainer };
  }
};
</script>

<style>
.card {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  margin: 16px;
  width: 50%; /* Adjust width to fit side by side */
  height: 50%;
}
</style>
