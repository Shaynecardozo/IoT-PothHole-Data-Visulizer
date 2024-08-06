<template>
  <div class="card bar-chart">
    <div ref="barChartContainer"></div>
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
    const barChartContainer = ref(null);

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
        const constituency = properties.constituency;
        const date = new Date(properties.ComplaintReceived);
        const month = date.toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear(); // Format: "Jan 2023"

        if (!acc[constituency]) {
          acc[constituency] = { months: {}, fixed: 0, unfixed: 0 };
        }

        if (!acc[constituency].months[month]) {
          acc[constituency].months[month] = { fixed: 0, unfixed: 0 };
        }

        if (properties.PWDVerifiedOn) {
          acc[constituency].months[month].fixed += 1;
          acc[constituency].fixed += 1;
        } else {
          acc[constituency].months[month].unfixed += 1;
          acc[constituency].unfixed += 1;
        }

        return acc;
      }, {});

      const labels = [...new Set(Object.values(counts).flatMap(c => Object.keys(c.months)))];
      const processedData = Object.entries(counts).map(([constituency, data]) => ({
        constituency,
        months: labels.map(month => data.months[month] || { fixed: 0, unfixed: 0 }),
        fixedCounts: labels.map(month => (data.months[month] ? data.months[month].fixed : 0)),
        unfixedCounts: labels.map(month => (data.months[month] ? data.months[month].unfixed : 0)),
      }));

      return { labels, processedData };
    };

    const createBarChart = (data) => {
      const container = d3.select(barChartContainer.value);
      container.html(''); // Clear any existing charts

      const width = 400;
      const height = 400;
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
        .domain([0, d3.max(data.processedData.flatMap(d => [...d.fixedCounts, ...d.unfixedCounts]))])
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

      const color = d3.scaleOrdinal()
        .domain(['Fixed Complaints', 'Unfixed Complaints'])
        .range(['#007bff', '#72e5ff']);

      data.processedData.forEach(d => {
        svg.selectAll(`.bar.fixed.${d.constituency}`)
          .data(d.fixedCounts)
          .enter().append('rect')
          .attr('class', `bar fixed ${d.constituency}`)
          .attr('x', (d, i) => xScale(data.labels[i]))
          .attr('y', d => yScale(d))
          .attr('width', xScale.bandwidth() / 2)
          .attr('height', d => height - yScale(d))
          .attr('fill', color('Fixed Complaints'));

        svg.selectAll(`.bar.unfixed.${d.constituency}`)
          .data(d.unfixedCounts)
          .enter().append('rect')
          .attr('class', `bar unfixed ${d.constituency}`)
          .attr('x', (d, i) => xScale(data.labels[i]) + xScale.bandwidth() / 2)
          .attr('y', d => yScale(d))
          .attr('width', xScale.bandwidth() / 2)
          .attr('height', d => height - yScale(d))
          .attr('fill', color('Unfixed Complaints'));
      });
    };

    const updateChart = async () => {
      const geojsonData = await fetchGeoJSONData();
      if (geojsonData) {
        const filteredData = props.selectedConstituency
          ? geojsonData.features.filter(feature => feature.properties.constituency === props.selectedConstituency)
          : geojsonData.features;

        const processedData = processGeoJSONData({ features: filteredData });
        createBarChart(processedData);
      }
    };

    watch(() => props.selectedConstituency, updateChart, { immediate: true });

    onMounted(updateChart);

    return { barChartContainer };
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
  height: 30%;
}
</style>
