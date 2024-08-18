<template>
  <div class="card line-chart">
    <!-- Icon with click event to open popup -->
    <span class="q-ml-xl" style="font-size: 20px; font-weight:500;color:green;">
      Number Of PWD verifications
     </span>
    <q-icon name="open_in_full" class="icon" @click="openPopup"></q-icon>
    <div ref="lineChartContainer"></div>

    <!-- Popup Dialog -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="popup-card">
        <q-card-section>
          <!-- Larger version of the line chart -->
          <div
            ref="popupLineChartContainer"
            class="popup-chart-container"
          ></div>
        </q-card-section>
        <q-card-actions class="popup-actions">
          <q-btn flat label="Close" @click="dialog = false"></q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { onMounted, watch, ref } from "vue";
import * as d3 from "d3";
import {
  QDialog,
  QCard,
  QCardSection,
  QCardActions,
  QBtn,
  QIcon,
} from "quasar";

export default {
  components: { QDialog, QCard, QCardSection, QCardActions, QBtn, QIcon },
  props: {
    selectedConstituency: String,
  },
  setup(props) {
    const lineChartContainer = ref(null);
    const popupLineChartContainer = ref(null);
    const dialog = ref(false);

    const fetchGeoJSONData = async () => {
      try {
        const response = await fetch(
          "/path/to/PotholeData for analysis_fileForInterns.geojson"
        );
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
      acc[constituency] = { months: {}, verifications: 0 };
    }

    if (!acc[constituency].months[month]) {
      acc[constituency].months[month] = 0;
    }

    if (properties.PWDVerifiedOn) {
      acc[constituency].months[month] += 1;
      acc[constituency].verifications += 1;
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
      acc[month] = 0;
      return acc;
    }, {});

    Object.entries(data.months).forEach(([month, count]) => {
      monthsMap[month] = count;
    });

    return {
      constituency,
      months: sortedLabelsFormatted.map(month => monthsMap[month]),
      verificationCounts: sortedLabelsFormatted.map(month => monthsMap[month]),
    };
  });

  return { labels: sortedLabelsFormatted, processedData };
};


const createLineChart = (data, container) => {
  const containerSelection = d3.select(container);
  containerSelection.html(''); // Clear any existing charts

  const width = container === lineChartContainer.value ? 400 : window.innerWidth * 0.75;
  const height = container === lineChartContainer.value ? 200 : window.innerHeight * 0.75;
  const margin = { top: 80, right: 20, bottom: 100, left: 50 };

  const svg = containerSelection.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const parseDate = d3.timeParse("%b %Y");
  const sortedLabels = data.labels.map(d => parseDate(d)).sort((a, b) => a - b);
  const xScale = d3.scaleTime()
    .domain(d3.extent(sortedLabels))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data.processedData.flatMap(d => d.verificationCounts))])
    .range([height, 0]);

  const xAxis = d3.axisBottom(xScale)
    .ticks(sortedLabels.length)
    .tickFormat(d3.timeFormat("%b '%y")) // Ensure correct date format

  const yAxis = d3.axisLeft(yScale);

  // Append X-Axis
  svg.append('g')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis)
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end')
    .style('font-size', '10px')
    .attr('dx', '-0.8em')
    .attr('dy', '0.15em')
    .style('text-align', 'center'); // Center align text

  // Append X-Axis Label
  svg.append('text')
    .attr('fill', '#000')
    .attr('transform', `translate(${width / 2}, ${height + margin.bottom - 40})`)
    .attr('text-anchor', 'middle')
    .text('Months'); // X-axis label

  // Append Y-Axis
  svg.append('g')
    .call(yAxis)
    .append('text')
    .attr('fill', '#000')
    .attr('transform', `translate(-40, ${height / 2}) rotate(-90)`)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'middle')
    .text('Number of PWD Verifications'); // Y-axis label

  const color = d3.scaleOrdinal()
    .domain(['PWD Verifications'])
    .range(["#138808"]);

  // Create and position the tooltip
  const tooltip = createTooltip();

  // Create lines for PWD verifications
  data.processedData.forEach(d => {
    const line = d3.line()
      .x((_, i) => xScale(sortedLabels[i]))
      .y(d => yScale(d));

    const path = svg.append('path')
      .datum(d.verificationCounts)
      .attr('class', `line verification ${d.constituency}`)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', color('PWD Verifications'));

    // Animation for drawing the line from left to right
    const totalLength = path.node().getTotalLength();
    path
      .attr('stroke-dasharray', totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(2000)
      .attr('stroke-dashoffset', 0);

    path
      .on('mouseover', (event) => showTooltip(tooltip, `PWD Verifications`, event))
      .on('mouseout', () => hideTooltip(tooltip));

    // Add points to the line
    svg.selectAll(`.dot-${d.constituency}`)
      .data(d.verificationCounts)
      .enter().append('circle')
      .attr('class', `dot ${d.constituency}`)
      .attr('cx', (_, i) => xScale(sortedLabels[i]))
      .attr('cy', d => yScale(d))
      .attr('r', 3)
      .attr('fill', color('PWD Verifications'))
      .on('mouseover', (event, value) => showTooltip(tooltip, `PWD Verifications: ${value}`, event))
      .on('mouseout', () => hideTooltip(tooltip));
  });
};







    const createTooltip = () => {
      return d3
        .select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "150px")
        .style("height", "auto")
        .style("padding", "5px")
        .style("font", "12px sans-serif")
        .style("background", "lightsteelblue")
        .style("border", "0px")
        .style("border-radius", "8px")
        .style("pointer-events", "none")
        .style("opacity", 0);
    };

    const showTooltip = (tooltip, content, event) => {
      tooltip
        .html(content)
        .style("left", `${event.pageX + 5}px`)
        .style("top", `${event.pageY - 28}px`)
        .transition()
        .duration(200)
        .style("opacity", 0.9);
    };

    const hideTooltip = (tooltip) => {
      tooltip.transition().duration(500).style("opacity", 0);
    };


    const updateChart = async () => {
      const geojsonData = await fetchGeoJSONData();
      if (geojsonData) {
        // Define a subset of constituencies to show initially
        const initialConstituencies = [
          "Constituency1",
          "Constituency2",
          "Constituency3",
        ]; // Replace with actual names or IDs

        // Filter data based on the selected constituency or use the initial subset
        const filteredData = props.selectedConstituency
          ? geojsonData.features.filter(
              (feature) =>
                feature.properties.constituency === props.selectedConstituency
            )
          : geojsonData.features.filter((feature) =>
              initialConstituencies.includes(feature.properties.constituency)
            );

        const processedData = processGeoJSONData({ features: filteredData });
        createLineChart(processedData, lineChartContainer.value);
      }
    };

    const openPopup = async () => {
      dialog.value = true;
      // Ensure the popup chart is drawn after the dialog opens
      await updateChart(); // Optional: Fetch and process data again for the popup
      createLineChart(
        await fetchGeoJSONData().then((data) =>
          processGeoJSONData({
            features: props.selectedConstituency
              ? data.features.filter(
                  (feature) =>
                    feature.properties.constituency ===
                    props.selectedConstituency
                )
              : data.features,
          })
        ),
        popupLineChartContainer.value
      );
    };

    onMounted(() => {
      updateChart();
    });

    watch(
      () => props.selectedConstituency,
      () => {
        updateChart();
      }
    );

    return {
      lineChartContainer,
      popupLineChartContainer,
      dialog,
      openPopup,
    };
  },
};
</script>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  margin: 16px;
  width: fit-content;
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
