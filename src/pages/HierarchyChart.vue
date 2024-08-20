<template>
  <q-page>
    <main
      style="border: 1px solid gainsboro; border-radius: 5px"
      class="q-ma-lg q-pa-md"
    >
      <h3 class="q-ma-none q-mb-lg row items-center" style="color: green">
        <q-icon name="water_drop" class="q-mr-md" /> <span> Flowmeters</span>
      </h3>
      <div id="chart-container" class="chart-container"></div>

      <!-- Popup Dialog -->
      <q-dialog v-model="showPopup">
        <q-card class="custom-dialog">
          <q-card-section>
            <div
              style="font-weight: bold; font-size: 25px; color: green"
              class="text-center"
            >
              Flowmeter Details
            </div>
          </q-card-section>
          <q-card-section
            class="q-mx-sm"
            style="border: 2px solid black; border-radius: 10px"
          >
            <div class="column">
              <div class="row">
                <strong class="col-6"><q-icon name="task" /> Id</strong>
                <span class="q-pl-sm"
                  >: {{ popupNode.id ? popupNode.id : "NA" }}</span
                >
              </div>
              <div class="row">
                <strong class="col-6"><q-icon name="badge" /> Name</strong>
                <span class="q-pl-sm"
                  >: {{ popupNode.name ? popupNode.name : "NA" }}</span
                >
              </div>
              <div class="row">
                <strong class="col-6"
                  ><q-icon name="location_on" /> Location</strong
                >
                <span class="q-pl-sm"
                  >: {{ popupNode.location ? popupNode.location : "NA" }}</span
                >
              </div>
              <div class="row">
                <strong class="col-6"
                  ><q-icon name="account_tree" /> Position</strong
                >
                <span class="q-pl-sm"
                  >: {{ popupNode.position ? popupNode.position : "NA" }}</span
                >
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn label="Close" color="blue" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </main>
  </q-page>
</template>

<script>
import * as d3 from "d3";
import axios from "axios";

export default {
  name: "HierarchyChart",
  data() {
    return {
      sensorsData: null,
      showPopup: false, // State for controlling the popup
      popupNode: {}, // Data for the clicked node
    };
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get("src/assets/SensorsDataInterns.json");
        this.sensorsData = response.data;
        this.drawChart();
      } catch (error) {
        console.error("Error fetching the data:", error);
      }
    },
    drawChart() {
      const processedData = this.processData(this.sensorsData);
      const flowmeterCount = Object.keys(processedData).length;
      const heightPerFlowmeter = 600; // Adjust as needed
      const chartHeight = Math.max(flowmeterCount * heightPerFlowmeter, 600); // Minimum height is 600px
      const width = 1280;

      const svg = d3
        .select("#chart-container")
        .append("svg")
        .attr("width", width)
        .attr("height", chartHeight)
        .append("g")
        .attr("transform", "translate(50,50)");

      // Main Flowmeter Node
      const mainNode = {
        name: "Flowmeters", // Principal root node label
        children: Object.values(processedData),
      };

      const root = d3.hierarchy(mainNode);
      const treeLayout = d3
        .tree()
        .size([chartHeight - 100, width - 200]) // Swapping width and height for horizontal layout
        .separation((a, b) => (a.parent === b.parent ? 2 : 3));

      treeLayout(root);

      // Add links with animation
      const links = svg
        .selectAll("path.link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr(
          "d",
          d3
            .linkHorizontal()
            .x((d) => d.y)
            .y((d) => d.x)
        )
        .attr("stroke", "darkgreen")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .style("opacity", 0);

      // Add nodes with animation
      const nodes = svg
        .selectAll("rect.node")
        .data(root.descendants())
        .enter()
        .append("rect")
        .attr("class", "node")
        .attr("x", (d) => d.y - 37)
        .attr("y", (d) => d.x - 20)
        .attr("width", 75)
        .attr("height", 40)
        .attr("fill", (d) => (d.depth === 0 ? "blue" : "green")) // Color the main root node differently
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("rx", "15")
        .attr("ry", "15")
        .style("cursor", "pointer")
        .style("opacity", 0)
        .on("click", (event, d) => {
          if (d.depth > 0) {
            // Only show popup for non-main nodes
            this.popupNode = d.data;
            this.showPopup = true;
          }
        });

      // Add labels to the nodes with animation
      const labels = svg
        .selectAll("text.label")
        .data(root.descendants())
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d) => d.y)
        .attr("y", (d) => d.x + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "azure")
        .style("cursor", "pointer")
        .style("opacity", 0)
        .text((d) => {
          if (d.depth === 0) {
            return d.data.name; // Principal root node (Flowmeter)
          } else if (d.depth === 1) {
            return d.data.name; // Root nodes of each flowmeter
          } else {
            return d.data.position.split(".").pop(); // Other nodes show their level
          }
        })
        .on("click", (event, d) => {
          if (d.depth > 0) {
            // Only show popup for non-main nodes
            this.popupNode = d.data;
            this.showPopup = true;
          }
        });

      // Animation
      nodes.transition().duration(1000).style("opacity", 1);

      labels.transition().duration(1000).style("opacity", 1);

      links.transition().duration(1000).delay(500).style("opacity", 1);
    },

    processData(data) {
      const trees = {};

      data.forEach((item) => {
        const parts = item.position.split(".");
        const firstPart = parts[0];

        // Initialize the tree for each flowmeter if it doesn't exist
        if (!trees[firstPart]) {
          trees[firstPart] = { name: `Flowmeter ${firstPart}`, children: [] };
        }

        let currentNode = trees[firstPart];

        // Traverse through the position parts to create the hierarchy
        parts.forEach((part, index) => {
          const positionPath = parts.slice(0, index + 1).join(".");

          let childNode = currentNode.children.find(
            (child) => child.position === positionPath
          );

          if (!childNode) {
            childNode = {
              name: `Node ${positionPath}`,
              position: positionPath,
              children: [],
            };
            currentNode.children.push(childNode);
          }

          // At the final part of the position, add the full item data
          if (index === parts.length - 1) {
            childNode.id = item.id;
            childNode.name = item.name;
            childNode.location = item.location;
          }

          currentNode = childNode;
        });
      });

      return trees;
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: fit-content; /* Adjust height as needed */
  overflow: hidden; /* Prevents overflow issues */
  display: flex;
  justify-content: center;
}

svg {
  background-color: #f9f9f9;
}

.custom-dialog {
  max-width: 22rem;
  font-size: 20px;
  width: 100%;
}

.custom-icon {
  font-size: 2rem; /* Adjust the size as needed */
  color: primary;
}
</style>
