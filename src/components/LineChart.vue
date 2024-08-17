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

    if (properties.FixedOn) {
      acc[constituency].months[month].fixed += 1;
      acc[constituency].fixed += 1;
    } else {
      acc[constituency].months[month].unfixed += 1;
      acc[constituency].unfixed += 1;
    }

    return acc;
  }, {});

  // Collect all unique months
  const labels = [...new Set(Object.values(counts).flatMap(c => Object.keys(c.months)))];
  const parseDate = d3.timeParse("%b %Y");
  const sortedLabels = labels.map(d => parseDate(d)).sort((a, b) => a - b);
  const sortedLabelsFormatted = sortedLabels.map(d => d3.timeFormat("%b %Y")(d));

  // Create processed data with zero values for missing months
  const processedData = Object.entries(counts).map(([constituency, data]) => {
    const monthsMap = sortedLabelsFormatted.reduce((acc, month) => {
      acc[month] = { fixed: 0, unfixed: 0 };
      return acc;
    }, {});

    Object.entries(data.months).forEach(([month, values]) => {
      monthsMap[month] = values;
    });

    return {
      constituency,
      months: sortedLabelsFormatted.map(month => monthsMap[month]),
      fixedCounts: sortedLabelsFormatted.map(month => monthsMap[month].fixed),
      unfixedCounts: sortedLabelsFormatted.map(month => monthsMap[month].unfixed),
    };
  });

  return { labels: sortedLabelsFormatted, processedData };
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
    .domain([0, d3.max(data.processedData.flatMap(d => [...d.fixedCounts, ...d.unfixedCounts]))])
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
    .text('Number of Complaints');

  const color = d3.scaleOrdinal()
    .domain(['Fixed Complaints', 'Unfixed Complaints'])
    .range(["#90EE90", "#138808"]);

  // Create and position the tooltip
  const tooltip = createTooltip();

  // Add legend
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(0, ${-margin.top / 2})`); // Adjust vertical position

  const legendItems = color.domain().map((d, i) => ({
    label: d,
    color: color(d),
    x: i * 150 // Adjust spacing between legend items
  }));

  legendItems.forEach((item) => {
    // Add color box
    legend.append('rect')
      .attr('x', item.x)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 20)
      .style('fill', item.color);

    // Add text
    legend.append('text')
      .attr('x', item.x + 30) // Space between color box and text
      .attr('y', 15)
      .text(item.label);
  });

  data.processedData.forEach(d => {
    const line = d3.line()
      .x((_, i) => xScale(sortedLabels[i]))
      .y(d => yScale(d));

    // Create lines for fixed and unfixed complaints
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
      .attr('cx', (_, i) => xScale(sortedLabels[i]))
      .attr('cy', d => yScale(d))
      .attr('r', 3)
      .attr('fill', color('Fixed Complaints'))
      .on('mouseover', (event, value) => showTooltip(tooltip, `Fixed Complaints: ${value}`, event))
      .on('mouseout', () => hideTooltip(tooltip));

    svg.selectAll(`.dot-${d.constituency}-unfixed`)
      .data(d.unfixedCounts)
      .enter().append('circle')
      .attr('class', `dot unfixed ${d.constituency}`)
      .attr('cx', (_, i) => xScale(sortedLabels[i]))
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
      // Define a subset of constituencies to show initially
      const initialConstituencies = ['Constituency1', 'Constituency2', 'Constituency3']; // Replace with actual names or IDs

      // Filter data based on the selected constituency or use the initial subset
      const filteredData = props.selectedConstituency
        ? geojsonData.features.filter(feature => feature.properties.constituency === props.selectedConstituency)
        : geojsonData.features.filter(feature => initialConstituencies.includes(feature.properties.constituency));

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
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  margin: 16px;
  width:fit-content;
  height: fit-content;
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
  /* alignment-baseline: middle; */
}


</style>
