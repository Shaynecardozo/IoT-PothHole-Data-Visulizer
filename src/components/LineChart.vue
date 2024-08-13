<template>
  <div class="card line-chart">
    <!-- Icon with click event to open popup -->
    <q-icon name="open_in_full" class="icon" @click="openPopup"></q-icon>
    <div ref="lineChartContainer"></div>

    <!-- Popup Dialog -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="popup-card">
        <q-card-section>
          <!-- Larger version of the line chart -->
          <div ref="popupLineChartContainer" class="popup-chart-container"></div>
        </q-card-section>
        <q-card-actions>
          <q-btn flat label="Close" @click="dialog = false"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { onMounted, watch, ref } from 'vue';
import * as d3 from 'd3';
import { QDialog, QCard, QCardSection, QCardActions, QBtn, QIcon } from 'quasar';

export default {
  components: { QDialog, QCard, QCardSection, QCardActions, QBtn, QIcon },
  props: {
    selectedConstituency: String
  },
  setup(props) {
    const lineChartContainer = ref(null);
    const popupLineChartContainer = ref(null);
    const dialog = ref(false);

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
        const month = new Date(properties.ComplaintReceived).toLocaleString('default', { month: 'short' }) + ' ' + date.getFullYear(); // Format: "Jan 2023"

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

    const createTooltip = () => {
      return d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('width', '150px')
        .style('height', 'auto')
        .style('padding', '5px')
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

    const createLineChart = (data, container) => {
      const containerSelection = d3.select(container);
      containerSelection.html(''); // Clear any existing charts

      const width = container === lineChartContainer.value ? 400 : window.innerWidth * 0.75;
      const height = container === lineChartContainer.value ? 200 : window.innerHeight * 0.75;
      const margin = { top: 20, right: 20, bottom: 100, left: 50 };

      const svg = containerSelection.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const xScale = d3.scaleTime()
        .domain(d3.extent(data.labels, d => new Date(d)))
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data.processedData.flatMap(d => [...d.fixedCounts, ...d.unfixedCounts]))])
        .range([height, 0]);

      const xAxis = d3.axisBottom(xScale).ticks(data.labels.length).tickFormat(d3.timeFormat("%b '%y"));
      const yAxis = d3.axisLeft(yScale);

      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

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

      // Create and position the tooltip
      const tooltip = createTooltip();

      data.processedData.forEach(d => {
        const line = d3.line()
          .x((d, i) => xScale(new Date(data.labels[i])))
          .y(d => yScale(d));

        svg.append('path')
          .datum(d.fixedCounts)
          .attr('class', `line fixed ${d.constituency}`)
          .attr('d', line)
          .attr('fill', 'none')
          .attr('stroke', color('Fixed Complaints'))
          .on('mouseover', (event) => showTooltip(tooltip, `Fixed Complaints`, event))
          .on('mouseout', () => hideTooltip(tooltip));

        svg.append('path')
          .datum(d.unfixedCounts)
          .attr('class', `line unfixed ${d.constituency}`)
          .attr('d', line)
          .attr('fill', 'none')
          .attr('stroke', color('Unfixed Complaints'))
          .on('mouseover', (event) => showTooltip(tooltip, `Unfixed Complaints`, event))
          .on('mouseout', () => hideTooltip(tooltip));

        // Add points to the lines
        svg.selectAll(`.dot-${d.constituency}-fixed`)
          .data(d.fixedCounts)
          .enter().append('circle')
          .attr('class', `dot fixed ${d.constituency}`)
          .attr('cx', (d, i) => xScale(new Date(data.labels[i])))
          .attr('cy', d => yScale(d))
          .attr('r', 3)
          .attr('fill', color('Fixed Complaints'))
          .on('mouseover', (event, value) => showTooltip(tooltip, `Fixed Complaints: ${value}`, event))
          .on('mouseout', () => hideTooltip(tooltip));

        svg.selectAll(`.dot-${d.constituency}-unfixed`)
          .data(d.unfixedCounts)
          .enter().append('circle')
          .attr('class', `dot unfixed ${d.constituency}`)
          .attr('cx', (d, i) => xScale(new Date(data.labels[i])))
          .attr('cy', d => yScale(d))
          .attr('r', 3)
          .attr('fill', color('Unfixed Complaints'))
          .on('mouseover', (event, value) => showTooltip(tooltip, `Unfixed Complaints: ${value}`, event))
          .on('mouseout', () => hideTooltip(tooltip));
      });
    };

    const updateChart = async () => {
      const geojsonData = await fetchGeoJSONData();
      if (geojsonData) {
        const filteredData = props.selectedConstituency
          ? geojsonData.features.filter(feature => feature.properties.constituency === props.selectedConstituency)
          : geojsonData.features;

        const processedData = processGeoJSONData({ features: filteredData });
        createLineChart(processedData, lineChartContainer.value);
      }
    };

    const openPopup = async () => {
      dialog.value = true;
      // Ensure the popup chart is drawn after the dialog opens
      await updateChart(); // Optional: Fetch and process data again for the popup
      createLineChart(await fetchGeoJSONData().then(data => processGeoJSONData({ features: props.selectedConstituency ? data.features.filter(feature => feature.properties.constituency === props.selectedConstituency) : data.features })), popupLineChartContainer.value);
    };

    onMounted(() => {
      updateChart();
    });

    watch(() => props.selectedConstituency, () => {
      updateChart();
    });

    return {
      lineChartContainer,
      popupLineChartContainer,
      dialog,
      openPopup
    };
  }
};
</script>

<style scoped>
.card {
  /* Add styles for card layout */
}

.line-chart {
  /* Add styles for line chart */
}

.icon {
  /* Add styles for icon */
}

.popup-chart-container {
  width: 100%;
  height: 400px; /* Adjust as needed */
}

.tooltip {
  /* Add styles for tooltip */
}
</style>
