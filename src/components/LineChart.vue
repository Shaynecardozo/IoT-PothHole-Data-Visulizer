<template>
  <div class="card">
    <h3>Line Chart</h3>
    <div id="lineChartContainer"></div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import * as d3 from 'd3';

export default {
  setup() {
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

        if (!acc[constituency]) {
          acc[constituency] = { fixed: 0, unfixed: 0 };
        }

        if (properties.PWDVerifiedOn) {
          acc[constituency].fixed += 1;
        } else {
          acc[constituency].unfixed += 1;
        }

        return acc;
      }, {});

      const labels = Object.keys(counts);
      const fixedCounts = labels.map(label => counts[label].fixed);
      const unfixedCounts = labels.map(label => counts[label].unfixed);

      return { labels, fixedCounts, unfixedCounts };
    };

    const createLineChart = (data) => {
      const container = d3.select('#lineChartContainer');
      container.html(''); // Clear any existing charts

      const width = 800;
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

      const lineFixed = d3.line()
        .x((d, i) => xScale(data.labels[i]) + xScale.bandwidth() / 2)
        .y(d => yScale(d));

      const lineUnfixed = d3.line()
        .x((d, i) => xScale(data.labels[i]) + xScale.bandwidth() / 2)
        .y(d => yScale(d));

      const color = d3.scaleOrdinal()
        .domain(['Fixed Complaints', 'Unfixed Complaints'])
        .range(['green', 'red']);

      svg.append('path')
        .datum(data.fixedCounts)
        .attr('fill', 'none')
        .attr('stroke', color('Fixed Complaints'))
        .attr('stroke-width', 2)
        .attr('d', lineFixed);

      svg.append('path')
        .datum(data.unfixedCounts)
        .attr('fill', 'none')
        .attr('stroke', color('Unfixed Complaints'))
        .attr('stroke-width', 2)
        .attr('d', lineUnfixed);

      svg.selectAll('.dot.fixed')
        .data(data.fixedCounts)
        .enter().append('circle')
        .attr('class', 'dot fixed')
        .attr('cx', (d, i) => xScale(data.labels[i]) + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(d))
        .attr('r', 5)
        .attr('fill', color('Fixed Complaints'));

      svg.selectAll('.dot.unfixed')
        .data(data.unfixedCounts)
        .enter().append('circle')
        .attr('class', 'dot unfixed')
        .attr('cx', (d, i) => xScale(data.labels[i]) + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(d))
        .attr('r', 5)
        .attr('fill', color('Unfixed Complaints'));
    };

    const updateChart = async () => {
      const geojsonData = await fetchGeoJSONData();
      if (geojsonData) {
        const processedData = processGeoJSONData(geojsonData);
        createLineChart(processedData);
      }
    };

    onMounted(updateChart);

    return {};
  }
};
</script>

<style>
.card {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  margin: 16px;
}
</style>
