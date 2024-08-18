<template>
  <div class="card line-chart">
    <!-- Icon with click event to open popup -->
    <q-icon name="open_in_full" class="icon" @click="openPopup"></q-icon>
    <h4>Verified Complaints over the year</h4>
    <div ref="lineChartContainer"></div>

    <!-- Popup Dialog -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="popup-card">
        <q-card-section>
          <!-- Larger version of the line chart -->
          <div ref="popupLineChartContainer" class="popup-chart-container"></div>
        </q-card-section>
        <q-card-actions class="popup-actions">
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

    const getAllMonthYearLabels = (geojsonData) => {
      const dates = geojsonData.features.map(feature => new Date(feature.properties.ComplaintReceived));
      const firstDate = d3.min(dates);
      const lastDate = d3.max(dates);
      const allMonthYearLabels = [];

      let currentDate = new Date(firstDate);
      while (currentDate <= lastDate) {
        allMonthYearLabels.push(d3.timeFormat("%b %Y")(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      return allMonthYearLabels;
    };

    const processGeoJSONData = (geojsonData, constituency) => {
      const allMonthYearLabels = getAllMonthYearLabels(geojsonData);

      const counts = geojsonData.features.reduce((acc, feature) => {
        const properties = feature.properties;
        const featureConstituency = properties.constituency;
        const month = d3.timeFormat("%b %Y")(new Date(properties.ComplaintReceived));

        if (constituency && featureConstituency !== constituency) return acc;

        if (!acc[featureConstituency]) {
          acc[featureConstituency] = { months: {}, fixed: 0, unfixed: 0 };
        }

        if (!acc[featureConstituency].months[month]) {
          acc[featureConstituency].months[month] = { fixed: 0, unfixed: 0, daysToVerify: 0 };
        }

        if (properties.PWDVerifiedOn) {
          acc[featureConstituency].months[month].fixed += 1;
          acc[featureConstituency].fixed += 1;

          // Calculate days to verify
          const complaintDate = new Date(properties.ComplaintReceived);
          const fixedDate = new Date(properties.FixedOn);
          const daysToVerify = Math.ceil((fixedDate - complaintDate) / (1000 * 60 * 60 * 24));
          acc[featureConstituency].months[month].daysToVerify += daysToVerify;
        } else {
          acc[featureConstituency].months[month].unfixed += 1;
          acc[featureConstituency].unfixed += 1;
        }

        return acc;
      }, {});

      // Create processed data with zero values for missing months
      const processedData = Object.entries(counts).map(([constituency, data]) => {
        const monthsMap = allMonthYearLabels.reduce((acc, month) => {
          acc[month] = { fixed: 0, unfixed: 0, daysToVerify: 0 };
          return acc;
        }, {});

        Object.entries(data.months).forEach(([month, values]) => {
          monthsMap[month] = values;
        });

        return {
          constituency,
          months: allMonthYearLabels.map(month => monthsMap[month]),
          fixedCounts: allMonthYearLabels.map(month => monthsMap[month].fixed),
          unfixedCounts: allMonthYearLabels.map(month => monthsMap[month].unfixed),
          daysToVerify: allMonthYearLabels.map(month => monthsMap[month].daysToVerify),
        };
      });

      return { labels: allMonthYearLabels, processedData };
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
      const margin = { top: 60, right: 20, bottom: 100, left: 50 }; // Adjusted top margin for legend

      const svg = containerSelection.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Parse the dates from labels and sort them
      const parseDate = d3.timeParse("%b %Y");
      const sortedLabels = data.labels.map(d => parseDate(d)).sort((a, b) => a - b);
      const xScale = d3.scaleTime()
        .domain(d3.extent(sortedLabels))
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data.processedData.flatMap(d => d.fixedCounts))])
        .range([height, 0]);

      const xAxis = d3.axisBottom(xScale).ticks(sortedLabels.length).tickFormat(d3.timeFormat("%b '%y"));
      const yAxis = d3.axisLeft(yScale);

      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
        .selectAll('text')
        .attr('transform', 'rotate(-45)') // Slant labels by -45 degrees
        .style('text-anchor', 'end') // Align text to the end
        .style('font-size', '10px') // Adjust font size if necessary
        .attr('dx', '-0.8em') // Adjust horizontal position
        .attr('dy', '0.15em'); // Adjust vertical position

      svg.append('g')
        .call(yAxis)
        .append('text')
        .attr('fill', '#000')
        .attr('transform', 'rotate(-90)')
        .attr('y', -40)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text('Number of Verified Complaints');

      const color = d3.scaleOrdinal()
        .domain(['Verified Complaints'])
        .range(["#4caf50"]);

      // Create and position the tooltip
      const tooltip = createTooltip();

      // Add legend
      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(0, ${-margin.top / 2})`);

      legend.selectAll('rect')
        .data(['Verified Complaints'])
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', (d, i) => i * 20)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', color);

      legend.selectAll('text')
        .data(['Verified Complaints'])
        .enter()
        .append('text')
        .attr('x', 30)
        .attr('y', (d, i) => i * 20 + 15)
        .text(d => d);

      // Define line generator
      const line = d3.line()
        .x((d, i) => xScale(sortedLabels[i]))
        .y(d => yScale(d));

      // Draw lines
      svg.selectAll('.line')
        .data(data.processedData)
        .enter()
        .append('path')
        .attr('class', 'line')
        .attr('d', d => line(d.fixedCounts))
        .style('fill', 'none')
        .style('stroke', color('Verified Complaints'))
        .style('stroke-width', '2px');

      // Add points
      svg.selectAll('.dot')
        .data(data.processedData.flatMap(d => d.fixedCounts.map((count, i) => ({ count, index: i, constituency: d.constituency }))))
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(sortedLabels[d.index]))
        .attr('cy', d => yScale(d.count))
        .attr('r', 5)
        .style('fill', color('Verified Complaints'))
        .style('stroke', '#fff')
        .style('stroke-width', '1.5px')
        .on('mouseover', (event, d) => showTooltip(tooltip, `Month: ${data.labels[d.index]}<br>Verified Complaints: ${d.count}`, event))
        .on('mouseout', () => hideTooltip(tooltip));
    };

    const openPopup = () => {
      dialog.value = true;
      fetchGeoJSONData().then(data => {
        const processedData = processGeoJSONData(data, props.selectedConstituency);
        createLineChart(processedData, popupLineChartContainer.value);
      });
    };

  onMounted(() => {
      // Initially render an empty chart or placeholder
      createLineChart({ processedData: [], labels: [] }, lineChartContainer.value);
    });

    watch(() => props.selectedConstituency, async () => {
      const geojsonData = await fetchGeoJSONData();
      if (geojsonData) {
        const { processedData, labels } = processGeoJSONData(geojsonData, props.selectedConstituency);
        createLineChart({ processedData, labels }, lineChartContainer.value);
        if (dialog.value) {
          createLineChart({ processedData, labels }, popupLineChartContainer.value);
        }
      }
    });

    return { dialog, lineChartContainer, popupLineChartContainer, openPopup };
  }
};
</script>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  margin: 16px;
  width: 50%; /* Adjust width to fit side by side */
  height: 50%;
  position: relative;
}

.icon {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}

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

/* Style for the popup card */
.popup-card {
  width: 100vw; /* Full viewport width */
  height: 90vh; /* 90% of viewport height */
  position: relative;
}

.popup-chart-container {
  width: 100%;
  height: 100%;
}

/* Ensure the q-dialog takes full width and height */
.q-dialog__inner {
  width: 100vw;
  height: 90vh;
}

.legend {
  font-size: 12px;
}

.legend rect {
  stroke-width: 0.2px;
  stroke: #000;
}

.legend text {
  font-size: 12px;
  alignment-baseline: middle;
}


</style>