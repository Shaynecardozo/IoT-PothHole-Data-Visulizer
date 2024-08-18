<template>
  <div class="card bar-chart">
    <!-- Icon with click event to open popup -->
     <span class="q-ml-xl" style="font-size: 20px; font-weight:500;color:green;">
      Number Of Fixed And Unfixed Complaints
     </span>
    <q-icon name="open_in_full" class="icon" @click="openPopup"></q-icon>
    <div ref="barChartContainer"></div>

    <!-- Popup Dialog -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="popup-card">
        <q-card-section>
          <!-- Larger version of the bar chart -->
          <div ref="popupBarChartContainer" class="popup-chart-container"></div>
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
    const barChartContainer = ref(null);
    const popupBarChartContainer = ref(null);
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

    const formatMonthYear = (date) => {
    // Create a D3 time format function for the short month and year
    const formatMonth = d3.timeFormat('%b'); // e.g., Jan, Feb
    const formatYear = d3.timeFormat('%y');  // e.g., 21

    // Extract short month and last two digits of the year
    const month = formatMonth(date); // Jan
    const year = formatYear(date);   // 21

    // Combine them in "Jan-21" format
    return `${month}-${year}`;
    };

    const processGeoJSONData = (geojsonData) => {
    const counts = geojsonData.features.reduce((acc, feature) => {
    const properties = feature.properties;
    const constituency = properties.constituency;
    const date = new Date(properties.ComplaintReceived);
    const monthYear = formatMonthYear(date); // Use the new format function

    if (!acc[constituency]) {
      acc[constituency] = { months: {}, fixed: 0, unfixed: 0 };
    }

    if (!acc[constituency].months[monthYear]) {
      acc[constituency].months[monthYear] = { fixed: 0, unfixed: 0 };
    }

    if (properties.FixedOn) {
      acc[constituency].months[monthYear].fixed += 1;
      acc[constituency].fixed += 1;
    }
    else {
      acc[constituency].months[monthYear].unfixed += 1;
      acc[constituency].unfixed += 1;
    }

    return acc;
  }, {});

  // Get the sorted list of months
  const labels = [...new Set(Object.values(counts).flatMap(c => Object.keys(c.months)))];
  labels.sort((a, b) => d3.ascending(d3.timeParse('%b-%y')(a), d3.timeParse('%b-%y')(b))); // Sort months chronologically

  const processedData = Object.entries(counts).map(([constituency, data]) => ({
    constituency,
    months: labels.map(monthYear => data.months[monthYear] || { fixed: 0, unfixed: 0 }),
    fixedCounts: labels.map(monthYear => (data.months[monthYear] ? data.months[monthYear].fixed : 0)),
    unfixedCounts: labels.map(monthYear => (data.months[monthYear] ? data.months[monthYear].unfixed : 0)),
  }));

  return { labels, processedData };
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

    const createBarChart = (data, container) => {
  const containerSelection = d3.select(container);
  containerSelection.html(''); // Clear any existing charts

  const width = container === barChartContainer.value ? 400 : window.innerWidth * 0.75;
  const height = container === barChartContainer.value ? 200 : window.innerHeight * 0.75;
  const margin = { top: 80, right: 20, bottom: 100, left: 50 }; // Increase top margin for legend

  const svg = containerSelection.append('svg')
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
  .attr('transform', 'rotate(-45)')
  .attr('dy', '0.35em')  // Adjust this value to move the text closer to the axis
  .attr('dx', '-0.7em')  // Adjust horizontal position to better align with the ticks
  .style('text-anchor', 'end');

// Add "Months" label to the x-axis
svg.append('text')
  .attr('fill', '#000')
  .attr('x', width / 2)  // Position in the middle of the x-axis
  .attr('y', height + margin.bottom - 30)  // Adjust position below the axis
  .attr('text-anchor', 'middle')
  .text('Months');

  // Y-axis with centered label
  svg.append('g')
    .call(yAxis)
    .append('text')
    .attr('fill', '#000')
    .attr('transform', `translate(-${margin.left - 10}, ${height / 2}) rotate(-90)`)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'middle')
    .text('Number of Complaints'); // Adjust this as needed

  const color = d3.scaleOrdinal()
    .domain(['Fixed Complaints', 'Unfixed Complaints'])
    .range(["#90EE90", "#138808"]);

  // Create and position the tooltip
  const tooltip = createTooltip();

  // Add legend
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(0, ${-margin.top / 2})`);

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
    const barsFixed = svg.selectAll(`.bar.fixed.${d.constituency}`)
      .data(d.fixedCounts)
      .enter().append('rect')
      .attr('class', `bar fixed ${d.constituency}`)
      .attr('x', (d, i) => xScale(data.labels[i]))
      .attr('y', height) // Start from the bottom
      .attr('width', xScale.bandwidth() / 2)
      .attr('height', 0) // Start with zero height
      .attr('fill', color('Fixed Complaints'))
      .on('mouseover', (event, d) => {
        d3.select(event.target)
          .attr('fill', 'orange'); // Change color on hover
        showTooltip(tooltip, `Fixed: ${d}`, event);
      })
      .on('mouseout', (event, d) => {
        d3.select(event.target)
          .attr('fill', color('Fixed Complaints')); // Reset color on mouse out
        hideTooltip(tooltip);
      });

    // Animate bars from top to bottom
    barsFixed.transition()
      .duration(1000) // Duration of the animation
      .attr('y', d => yScale(d))
      .attr('height', d => height - yScale(d));

    const barsUnfixed = svg.selectAll(`.bar.unfixed.${d.constituency}`)
      .data(d.unfixedCounts)
      .enter().append('rect')
      .attr('class', `bar unfixed ${d.constituency}`)
      .attr('x', (d, i) => xScale(data.labels[i]) + xScale.bandwidth() / 2)
      .attr('y', height) // Start from the bottom
      .attr('width', xScale.bandwidth() / 2)
      .attr('height', 0) // Start with zero height
      .attr('fill', color('Unfixed Complaints'))
      .on('mouseover', (event, d) => {
        d3.select(event.target)
          .attr('fill', 'yellow'); // Change color on hover
        showTooltip(tooltip, `Unfixed: ${d}`, event);
      })
      .on('mouseout', (event, d) => {
        d3.select(event.target)
          .attr('fill', color('Unfixed Complaints')); // Reset color on mouse out
        hideTooltip(tooltip);
      });

    // Animate bars from top to bottom
    barsUnfixed.transition()
      .duration(1000) // Duration of the animation
      .attr('y', d => yScale(d))
      .attr('height', d => height - yScale(d));
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
        createBarChart(processedData, barChartContainer.value);
      }
    };

    const openPopup = async () => {
      dialog.value = true;
      // Ensure the popup chart is drawn after the dialog opens
      await updateChart(); // Optional: Fetch and process data again for the popup
      createBarChart(await fetchGeoJSONData().then(data => processGeoJSONData({ features: props.selectedConstituency ? data.features.filter(feature => feature.properties.constituency === props.selectedConstituency) : data.features })), popupBarChartContainer.value);
    };

    watch(() => props.selectedConstituency, updateChart, { immediate: true });

    onMounted(updateChart);

    return { barChartContainer, popupBarChartContainer, dialog, openPopup };
  }
};
</script>

<style>
.card {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 16px;
  margin: 16px;
  width: fit-content;/* Adjust width to fit side by side */
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

.legend rect {
  stroke-width: 0.2px;
  stroke: #000;
}

.legend text {
  font-size: 12px;
  /* alignment-baseline: middle; */
}

</style>
