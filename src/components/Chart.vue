<<<<<<< HEAD
<template>
  <div>
    <h2>Select Chart Type</h2>
    <select v-model="selectedChartType" @change="updateChart">
      <option value="bar">Bar Chart</option>
      <option value="line">Line Chart</option>
      <option value="pie">Pie Chart</option>
    </select>
    <div id="chartContainer"></div>
    <div id="tooltip" class="tooltip" style="display: none;"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';

export default {
  setup() {
    const selectedChartType = ref('bar');

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

    const createTooltip = () => {
      return d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('width', '120px')
        .style('height', 'auto')
        .style('padding', '2px')
        .style('font', '12px sans-serif')
        .style('background', 'lightsteelblue')
        .style('border', '0px')
        .style('border-radius', '8px')
        .style('pointer-events', 'none')
        .style('opacity', 0);
    };

    const showTooltip = (tooltip, content, event) => {
      tooltip.html(content)
        .style('left', `${event.pageX + 5}px`)
        .style('top', `${event.pageY - 28}px`)
        .transition()
        .duration(200)
        .style('opacity', .9);
    };

    const hideTooltip = (tooltip) => {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    };

    const createChart = (data) => {
      const container = d3.select('#chartContainer');
      container.html(''); // Clear any existing charts

      const tooltip = createTooltip();

      const width = 800;
      const height = 400;
      const margin = { top: 20, right: 20, bottom: 50, left: 50 };

      if (selectedChartType.value === 'bar' || selectedChartType.value === 'line') {
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
          .attr('transform', 'rotate(-90)') // Rotate the text
          .attr('x', -10)
          .attr('y', -5)
          .attr('dy', '.35em')
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
          .range(['green', 'red']);

        if (selectedChartType.value === 'bar') {
          svg.selectAll('.bar.fixed')
            .data(data.fixedCounts)
            .enter().append('rect')
            .attr('class', 'bar fixed')
            .attr('x', (d, i) => xScale(data.labels[i]))
            .attr('y', d => yScale(d))
            .attr('width', xScale.bandwidth() / 2)
            .attr('height', d => height - yScale(d))
            .attr('fill', color('Fixed Complaints'))
            .on('mouseover', (event, d) => {
              const i = data.fixedCounts.indexOf(d);
              showTooltip(tooltip, `Fixed in ${data.labels[i]}: ${d}`, event);
            })
            .on('mouseout', () => {
              hideTooltip(tooltip);
            });

          svg.selectAll('.bar.unfixed')
            .data(data.unfixedCounts)
            .enter().append('rect')
            .attr('class', 'bar unfixed')
            .attr('x', (d, i) => xScale(data.labels[i]) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d))
            .attr('width', xScale.bandwidth() / 2)
            .attr('height', d => height - yScale(d))
            .attr('fill', color('Unfixed Complaints'))
            .on('mouseover', (event, d) => {
              const i = data.unfixedCounts.indexOf(d);
              showTooltip(tooltip, `Unfixed in ${data.labels[i]}: ${d}`, event);
            })
            .on('mouseout', () => {
              hideTooltip(tooltip);
            });
        } else if (selectedChartType.value === 'line') {
          const lineFixed = d3.line()
            .x((d, i) => xScale(data.labels[i]) + xScale.bandwidth() / 4)
            .y(d => yScale(d));

          const lineUnfixed = d3.line()
            .x((d, i) => xScale(data.labels[i]) + 3 * xScale.bandwidth() / 4)
            .y(d => yScale(d));

          svg.append('path')
            .datum(data.fixedCounts)
            .attr('fill', 'none')
            .attr('stroke', color('Fixed Complaints'))
            .attr('stroke-width', 2)
            .attr('d', lineFixed);

          svg.selectAll('.dot.fixed')
            .data(data.fixedCounts)
            .enter().append('circle')
            .attr('class', 'dot fixed')
            .attr('cx', (d, i) => xScale(data.labels[i]) + xScale.bandwidth() / 4)
            .attr('cy', d => yScale(d))
            .attr('r', 5)
            .attr('fill', color('Fixed Complaints'))
            .on('mouseover', (event, d) => {
              const i = data.fixedCounts.indexOf(d);
              showTooltip(tooltip, `Fixed in ${data.labels[i]}: ${d}`, event);
            })
            .on('mouseout', () => {
              hideTooltip(tooltip);
            });

          svg.append('path')
            .datum(data.unfixedCounts)
            .attr('fill', 'none')
            .attr('stroke', color('Unfixed Complaints'))
            .attr('stroke-width', 2)
            .attr('d', lineUnfixed);

          svg.selectAll('.dot.unfixed')
            .data(data.unfixedCounts)
            .enter().append('circle')
            .attr('class', 'dot unfixed')
            .attr('cx', (d, i) => xScale(data.labels[i]) + 3 * xScale.bandwidth() / 4)
            .attr('cy', d => yScale(d))
            .attr('r', 5)
            .attr('fill', color('Unfixed Complaints'))
            .on('mouseover', (event, d) => {
              const i = data.unfixedCounts.indexOf(d);
              showTooltip(tooltip, `Unfixed in ${data.labels[i]}: ${d}`, event);
            })
            .on('mouseout', () => {
              hideTooltip(tooltip);
            });
        }
      } else if (selectedChartType.value === 'pie') {
        const pieDataFixed = data.labels.map((label, i) => ({ label, value: data.fixedCounts[i] }));
        const pieDataUnfixed = data.labels.map((label, i) => ({ label, value: data.unfixedCounts[i] }));

        const radius = Math.min(width, height) / 2;

        const arc = d3.arc()
          .outerRadius(radius - 10)
          .innerRadius(0);

        const pie = d3.pie()
          .sort(null)
          .value(d => d.value);

        const color = d3.scaleOrdinal()
          .domain(data.labels)
          .range(d3.schemeCategory10);

        const fixedSvg = container.append('svg')
          .attr('width', width / 2)
          .attr('height', height)
          .append('g')
          .attr('transform', `translate(${width / 4}, ${height / 2})`);

        const unfixedSvg = container.append('svg')
          .attr('width', width / 2)
          .attr('height', height)
          .append('g')
          .attr('transform', `translate(${width / 4}, ${height / 2})`);

        fixedSvg.selectAll('.arc')
          .data(pie(pieDataFixed))
          .enter().append('path')
          .attr('class', 'arc')
          .attr('d', arc)
          .attr('fill', d => color(d.data.label))
          .on('mouseover', (event, d) => {
            showTooltip(tooltip, `Fixed in ${d.data.label}: ${d.data.value}`, event);
          })
          .on('mouseout', () => {
            hideTooltip(tooltip);
          });

        unfixedSvg.selectAll('.arc')
          .data(pie(pieDataUnfixed))
          .enter().append('path')
          .attr('class', 'arc')
          .attr('d', arc)
          .attr('fill', d => color(d.data.label))
          .on('mouseover', (event, d) => {
            showTooltip(tooltip, `Unfixed in ${d.data.label}: ${d.data.value}`, event);
          })
          .on('mouseout', () => {
            hideTooltip(tooltip);
          });
      }
    };

    const updateChart = async () => {
      const geojsonData = await fetchGeoJSONData();
      if (geojsonData) {
        const processedData = processGeoJSONData(geojsonData);
        createChart(processedData);
      }
    };

    onMounted(updateChart);

    return {
      selectedChartType,
      updateChart,
    };
  },
};
</script>

<style>
.tooltip {
  position: absolute;
  text-align: center;
  width: 120px;
  height: auto;
  padding: 2px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 0;
  border-radius: 8px;
  pointer-events: none;
  opacity: 0;
}
</style>
=======
<template>
  <div>
    <h2>Select Chart Type</h2>
    <select v-model="selectedChartType" @change="updateChart">
      <option value="bar">Bar Chart</option>
      <option value="line">Line Chart</option>
      <option value="pie">Pie Chart</option>
    </select>
    <div id="chartContainer"></div>
    <div id="tooltip" class="tooltip" style="display: none;"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';

export default {
  setup() {
    const selectedChartType = ref('bar');

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

    const createTooltip = () => {
      return d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('width', '120px')
        .style('height', 'auto')
        .style('padding', '2px')
        .style('font', '12px sans-serif')
        .style('background', 'lightsteelblue')
        .style('border', '0px')
        .style('border-radius', '8px')
        .style('pointer-events', 'none')
        .style('opacity', 0);
    };

    const showTooltip = (tooltip, content, event) => {
      tooltip.html(content)
        .style('left', `${event.pageX + 5}px`)
        .style('top', `${event.pageY - 28}px`)
        .transition()
        .duration(200)
        .style('opacity', .9);
    };

    const hideTooltip = (tooltip) => {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    };

    const createChart = (data) => {
      const container = d3.select('#chartContainer');
      container.html(''); // Clear any existing charts

      const tooltip = createTooltip();

      const width = 800;
      const height = 400;
      const margin = { top: 20, right: 20, bottom: 50, left: 50 };

      if (selectedChartType.value === 'bar' || selectedChartType.value === 'line') {
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
          .attr('transform', 'rotate(-90)') // Rotate the text
          .attr('x', -10)
          .attr('y', -5)
          .attr('dy', '.35em')
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
          .range(['green', 'red']);

        if (selectedChartType.value === 'bar') {
          svg.selectAll('.bar.fixed')
            .data(data.fixedCounts)
            .enter().append('rect')
            .attr('class', 'bar fixed')
            .attr('x', (d, i) => xScale(data.labels[i]))
            .attr('y', d => yScale(d))
            .attr('width', xScale.bandwidth() / 2)
            .attr('height', d => height - yScale(d))
            .attr('fill', color('Fixed Complaints'))
            .on('mouseover', (event, d) => {
              const i = data.fixedCounts.indexOf(d);
              showTooltip(tooltip, `Fixed in ${data.labels[i]}: ${d}`, event);
            })
            .on('mouseout', () => {
              hideTooltip(tooltip);
            });

          svg.selectAll('.bar.unfixed')
            .data(data.unfixedCounts)
            .enter().append('rect')
            .attr('class', 'bar unfixed')
            .attr('x', (d, i) => xScale(data.labels[i]) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d))
            .attr('width', xScale.bandwidth() / 2)
            .attr('height', d => height - yScale(d))
            .attr('fill', color('Unfixed Complaints'))
            .on('mouseover', (event, d) => {
              const i = data.unfixedCounts.indexOf(d);
              showTooltip(tooltip, `Unfixed in ${data.labels[i]}: ${d}`, event);
            })
            .on('mouseout', () => {
              hideTooltip(tooltip);
            });
        } else if (selectedChartType.value === 'line') {
          const lineFixed = d3.line()
            .x((d, i) => xScale(data.labels[i]) + xScale.bandwidth() / 4)
            .y(d => yScale(d));

          const lineUnfixed = d3.line()
            .x((d, i) => xScale(data.labels[i]) + 3 * xScale.bandwidth() / 4)
            .y(d => yScale(d));

          svg.append('path')
            .datum(data.fixedCounts)
            .attr('fill', 'none')
            .attr('stroke', color('Fixed Complaints'))
            .attr('stroke-width', 2)
            .attr('d', lineFixed);

          svg.selectAll('.dot.fixed')
            .data(data.fixedCounts)
            .enter().append('circle')
            .attr('class', 'dot fixed')
            .attr('cx', (d, i) => xScale(data.labels[i]) + xScale.bandwidth() / 4)
            .attr('cy', d => yScale(d))
            .attr('r', 5)
            .attr('fill', color('Fixed Complaints'))
            .on('mouseover', (event, d) => {
              const i = data.fixedCounts.indexOf(d);
              showTooltip(tooltip, `Fixed in ${data.labels[i]}: ${d}`, event);
            })
            .on('mouseout', () => {
              hideTooltip(tooltip);
            });

          svg.append('path')
            .datum(data.unfixedCounts)
            .attr('fill', 'none')
            .attr('stroke', color('Unfixed Complaints'))
            .attr('stroke-width', 2)
            .attr('d', lineUnfixed);

          svg.selectAll('.dot.unfixed')
            .data(data.unfixedCounts)
            .enter().append('circle')
            .attr('class', 'dot unfixed')
            .attr('cx', (d, i) => xScale(data.labels[i]) + 3 * xScale.bandwidth() / 4)
            .attr('cy', d => yScale(d))
            .attr('r', 5)
            .attr('fill', color('Unfixed Complaints'))
            .on('mouseover', (event, d) => {
              const i = data.unfixedCounts.indexOf(d);
              showTooltip(tooltip, `Unfixed in ${data.labels[i]}: ${d}`, event);
            })
            .on('mouseout', () => {
              hideTooltip(tooltip);
            });
        }
      } else if (selectedChartType.value === 'pie') {
        const pieDataFixed = data.labels.map((label, i) => ({ label, value: data.fixedCounts[i] }));
        const pieDataUnfixed = data.labels.map((label, i) => ({ label, value: data.unfixedCounts[i] }));

        const radius = Math.min(width, height) / 2;

        const arc = d3.arc()
          .outerRadius(radius - 10)
          .innerRadius(0);

        const pie = d3.pie()
          .sort(null)
          .value(d => d.value);

        const color = d3.scaleOrdinal()
          .domain(data.labels)
          .range(d3.schemeCategory10);

        const fixedSvg = container.append('svg')
          .attr('width', width / 2)
          .attr('height', height)
          .append('g')
          .attr('transform', `translate(${width / 4}, ${height / 2})`);

        const unfixedSvg = container.append('svg')
          .attr('width', width / 2)
          .attr('height', height)
          .append('g')
          .attr('transform', `translate(${width / 4}, ${height / 2})`);

        fixedSvg.selectAll('.arc')
          .data(pie(pieDataFixed))
          .enter().append('path')
          .attr('class', 'arc')
          .attr('d', arc)
          .attr('fill', d => color(d.data.label))
          .on('mouseover', (event, d) => {
            showTooltip(tooltip, `Fixed in ${d.data.label}: ${d.data.value}`, event);
          })
          .on('mouseout', () => {
            hideTooltip(tooltip);
          });

        unfixedSvg.selectAll('.arc')
          .data(pie(pieDataUnfixed))
          .enter().append('path')
          .attr('class', 'arc')
          .attr('d', arc)
          .attr('fill', d => color(d.data.label))
          .on('mouseover', (event, d) => {
            showTooltip(tooltip, `Unfixed in ${d.data.label}: ${d.data.value}`, event);
          })
          .on('mouseout', () => {
            hideTooltip(tooltip);
          });
      }
    };

    const updateChart = async () => {
      const geojsonData = await fetchGeoJSONData();
      if (geojsonData) {
        const processedData = processGeoJSONData(geojsonData);
        createChart(processedData);
      }
    };

    onMounted(updateChart);

    return {
      selectedChartType,
      updateChart,
    };
  },
};
</script>

<style>
.tooltip {
  position: absolute;
  text-align: center;
  width: 120px;
  height: auto;
  padding: 2px;
  font: 12px sans-serif;
  background: lightsteelblue;
  border: 0;
  border-radius: 8px;
  pointer-events: none;
  opacity: 0;
}
</style>
>>>>>>> 705830440d4df675cf602c678e3d184c68ab2c17
