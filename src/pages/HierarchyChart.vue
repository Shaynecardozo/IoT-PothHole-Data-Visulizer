<template>
  <q-page padding>
    <q-card v-for="(tree, index) in trees" :key="index" class="tree-card">
      <q-card-section>
        <!-- Card title showing the root node's name -->
        <q-card-title class="q-ml-xl rootname ">
          <q-icon name="gas_meter" />
          {{
          tree.data.name
        }}</q-card-title>
      </q-card-section>

      <q-card-section>
        <div :id="'tree-' + index" class="chart-container"></div>
      </q-card-section>
    </q-card>

    <!-- Popup Dialog -->
    <q-dialog v-model="showPopup">
      <q-card class="custom-dialog">
        <q-card-section>
          <div style="font-weight: bold; font-size: 25px; color:green" class="text-center">Flowmeter Details</div>
        </q-card-section>

        <q-card-section
          class="q-mx-sm"
          style="border: 2px solid black; border-radius: 10px"
        >
          <div class="column">
            <div class="row">
              <strong class="col-6"><q-icon name="task" /> Id</strong
              ><span class="q-pl-sm"
                >: {{ popupNode.id ? popupNode.id : "NA" }}</span
              >
            </div>
            <div class="row">
              <strong class="col-6"><q-icon name="badge" /> Name</strong
              ><span class="q-pl-sm"
                >: {{ popupNode.name ? popupNode.name : "NA" }}</span
              >
            </div>
            <div class="row">
              <strong class="col-6 "><q-icon name="location_on" /> Location</strong
              ><span class="q-pl-sm"
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
      trees: [], // Array to store tree data for each card
      showPopup: false, // State for controlling the popup
      popupNode: {}, // Data for the clicked node
    };
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get("src/assets/SensorsDataInterns.json");
        this.sensorsData = response.data;
        this.drawCharts();
      } catch (error) {
        console.error("Error fetching the data:", error);
      }
    },
    drawCharts() {
      const processedData = this.processData(this.sensorsData);
      this.trees = Object.keys(processedData).map((key, index) => {
        const treeData = processedData[key];
        return {
          key,
          svgId: `tree-${index}`,
          data: treeData,
        };
      });

      this.$nextTick(() => {
        this.trees.forEach((tree) => {
          this.drawTree(tree);
        });
      });
    },
    drawTree(tree) {
      const width = 1280;
      const height = 600;

      const svg = d3
        .select(`#${tree.svgId}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(50,50)");

      const root = d3.hierarchy(tree.data);
      const treeLayout = d3
        .tree()
        .size([width - 100, height - 100])
        .separation((a, b) => (a.parent === b.parent ? 1.55 : 2));

      treeLayout(root);

      // Draw the links
      svg
        .selectAll("path.link")
        .data(root.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr(
          "d",
          d3
            .linkHorizontal()
            .x((d) => d.x)
            .y((d) => d.y)
        )
        .attr("stroke", "darkgreen")
        .attr("stroke-width", 1)
        .attr("fill", "none");

      // Draw the nodes as rectangles
      svg
        .selectAll("rect.node")
        .data(root.descendants())
        .enter()
        .append("rect")
        .attr("class", "node")
        .attr("x", (d) => d.x - 37)
        .attr("y", (d) => d.y - 20)
        .attr("width", 75)
        .attr("height", 40)
        .attr("fill", "green")
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .style('cursor','pointer')
        .on("click", (event, d) => {
          this.popupNode = d.data; // Set the node data for the popup
          this.showPopup = true; // Show the popup dialog
        });

      // Add labels to the nodes
      svg
        .selectAll("text.label")
        .data(root.descendants())
        .enter()
        .append("text")
        .attr("class", "label")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y + 10)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "azure")
        .style('cursor','pointer')
        .text((d) => (d.parent === null ? d.data.name : d.data.id))
        .on("click", (event, d) => {
          this.popupNode = d.data; // Set the node data for the popup
          this.showPopup = true; // Show the popup dialog
        });;
         // Display name if root node, otherwise display id
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
.tree-card {
  margin-bottom: 20px;
  box-shadow: 2px 2px 8px rgba(57, 179, 71, 0.837);
}

.rootname
{
  font-weight: bold;
  font-size: 3rem;
  display: flex;
  margin:10px 10px;
  gap:10px;
  align-items: center;
  color: green;
}

.chart-container {
  width: 100%;
  height: 600px; /* Adjust height as needed */
  overflow: hidden; /* Prevents overflow issues */
  display: flex;
  justify-content: center;
}

svg {
  background-color: #f9f9f9;
}


.popup-details h4 {
  color: #146c2de7;
  font-weight: bold;
}

.custom-dialog {
  max-width: 22rem;
  font-size: 20px;
  width: 100%;
}
</style>
