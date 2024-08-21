<template>
  <div class="bar-chart-card">
    <!-- Icon with click event to open popup -->
    <span class="q-ml-xl" style="font-size: 20px; font-weight:500;color:green;">
      Number Of Fixed And Unfixed Complaints in Each Constituency
     </span>
    <q-icon name="open_in_full" class="popup-icon" @click="openPopup"></q-icon>
    <div ref="barChartContainer" class="bar-chart-container"></div>

    <!-- Popup Dialog -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="popup-card">
        <q-card-actions>
          <q-btn flat  @click="dialog = false">
            <q-icon name="close"></q-icon>
          </q-btn>
        </q-card-actions>
        <q-card-section>
          <!-- Larger version of the bar chart -->
          <div ref="popupBarChartContainer" class="popup-chart-container"></div>
        </q-card-section>
       
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
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
  setup() {
    const barChartContainer = ref(null);
    const popupBarChartContainer = ref(null);
    const dialog = ref(false);

    // Tooltip div
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "bar-chart-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "#fff")
      .style("padding", "5px")
      .style("border-radius", "4px")
      .style("box-shadow", "0px 0px 5px rgba(0,0,0,0.3)")
      .style("font-size", "12px")
      .style("color", "#000");

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

        if (!acc[constituency]) {
          acc[constituency] = { fixed: 0, unfixed: 0 };
        }

        if (properties.FixedOn) {
          acc[constituency].fixed += 1;
        } else {
          acc[constituency].unfixed += 1;
        }

        return acc;
      }, {});

      const processedData = Object.entries(counts).map(
        ([constituency, data]) => ({
          constituency,
          fixed: data.fixed,
          unfixed: data.unfixed,
        })
      );

      return processedData;
    };

    const createBarChart = (data, container) => {
      const containerSelection = d3.select(container);
      containerSelection.html(""); // Clear any existing charts

      const width =
        container === barChartContainer.value ? 600 : window.innerWidth * 0.85;
      const height =
        container === barChartContainer.value ? 200 : window.innerHeight * 0.60;
      const margin = { top: 80, right: 20, bottom: 80, left: 50 };

      const svg = containerSelection
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const xScale = d3
        .scaleBand()
        .domain(data.map((d) => d.constituency))
        .range([0, width])
        .padding(0.2);

      const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, (d) => d3.max([d.fixed, d.unfixed]))])
        .nice()
        .range([height, 0]);

      const color = d3
        .scaleOrdinal()
        .domain(["Fixed Complaints", "Unfixed Complaints"])
        .range(["#4caf50","#2f4550"]);

      svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      svg
        .append("text")
        .attr("fill", "#000")
        .attr("x", width / 2) // Position in the middle of the x-axis
        .attr("y", height + margin.bottom-10) // Adjust position below the axis
        .attr("text-anchor", "middle")
        .text("Constituencies");

      // svg
      //   .append("g")
      //   .call(d3.axisLeft(yScale))
      //   .append("text")
      //   .attr("fill", "#000")
      //   .attr("transform", "rotate(-90)")
      //   .attr("y", -40)
      //   .attr("dy", "0.71em")
      //   .attr("text-anchor", "end")
      //   .text("Number of Complaints");

        svg.append('g')
    .call(d3.axisLeft(yScale))
    .append('text')
    .attr('fill', '#000')
    .attr('transform', `translate(-${margin.left - 10}, ${height / 2}) rotate(-90)`)
    .attr('dy', '0.71em')
    .attr('text-anchor', 'middle')
    .text('Number of Complaints');

      const bars = svg.selectAll(".bar").data(data).enter().append("g");

      // Fixed Complaints Bars
      bars
        .append("rect")
        .attr("class", "bar fixed")
        .attr("x", (d) => xScale(d.constituency))
        .attr("y", height) // Start at the bottom for the animation
        .attr("width", xScale.bandwidth() / 2)
        .attr("height", 0) // Initial height for the animation
        .attr("fill", color("Fixed Complaints"))
        .on("mouseover", function (event, d) {
          tooltip
            .style("visibility", "visible")
            .text(`Fixed: ${d.fixed}`)
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        })
        .transition()
        .duration(1000)
        .attr("y", (d) => yScale(d.fixed))
        .attr("height", (d) => height - yScale(d.fixed));

      // Unfixed Complaints Bars
      bars
        .append("rect")
        .attr("class", "bar unfixed")
        .attr("x", (d) => xScale(d.constituency) + xScale.bandwidth() / 2)
        .attr("y", height) // Start at the bottom for the animation
        .attr("width", xScale.bandwidth() / 2)
        .attr("height", 0) // Initial height for the animation
        .attr("fill", color("Unfixed Complaints"))
        .on("mouseover", function (event, d) {
          tooltip
            .style("visibility", "visible")
            .text(`Unfixed: ${d.unfixed}`)
            .style("top", `${event.pageY - 10}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", function () {
          tooltip.style("visibility", "hidden");
        })
        .transition()
        .duration(1000)
        .attr("y", (d) => yScale(d.unfixed))
        .attr("height", (d) => height - yScale(d.unfixed));

      // Add legend
      const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(0, ${-margin.top / 2})`);

      const legendItems = color.domain().map((d, i) => ({
        label: d,
        color: color(d),
        x: i * 150, // Adjust spacing between legend items
      }));

      legendItems.forEach((item) => {
        // Add color box
        legend
          .append("rect")
          .attr("x", item.x)
          .attr("y", 0)
          .attr("width", 20)
          .attr("height", 20)
          .style("fill", item.color);

        // Add text
        legend
          .append("text")
          .attr("x", item.x + 30) // Space between color box and text
          .attr("y", 15)
          .text(item.label);
      });
    };

    const updateChart = async () => {
      const geojsonData = await fetchGeoJSONData();
      if (geojsonData) {
        const processedData = processGeoJSONData(geojsonData);
        createBarChart(processedData, barChartContainer.value);
      }
    };

    const openPopup = async () => {
      dialog.value = true;
      const geojsonData = await fetchGeoJSONData();
      if (geojsonData) {
        const processedData = processGeoJSONData(geojsonData);
        createBarChart(processedData, popupBarChartContainer.value);
      }
    };

    onMounted(updateChart);

    return { barChartContainer, popupBarChartContainer, dialog, openPopup };
  },
};
</script>

<!-- <style scoped>
.bar-chart-card {
  border-radius: 4px;
  margin: 16px;
  width: fit-content;
  height: fit-content;
  position: relative;
}

.popup-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}

.bar-chart-container .bar {
  transition: fill 0.3s;
}

.bar-chart-container .bar.fixed:hover {
  fill: orange;
}

.bar-chart-container .bar.unfixed:hover {
  fill: yellow;
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
}

.bar-chart-tooltip {
  position: absolute;
  visibility: hidden;
  background-color: #fff;
  padding: 5px;
  border-radius: 4px;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
  font-size: 12px;
  color: #000;
}
</style> -->
<style scoped>
.bar-chart-card {
  border-radius: 4px;
  margin: 16px;
  width: fit-content;
  height: fit-content;
  position: relative;
}

.icon {
  position: absolute;
  top: 0px;
  right: 0px;
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
.q-dialog__inner {
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  max-height: none !important;
  padding: 0 !important;
}

.popup-card {
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  display: flex;
  flex-direction: column;
}

/* Adjust the container for the chart within the popup */
.popup-chart-container {
  flex-grow: 1;
  width: 100%;
  height: 100%;
}
@media (min-width: 600px) {
  .q-dialog__inner--minimized > div {
    width: 100vw !important;
    height: 100vh !important;
  }
}

</style>