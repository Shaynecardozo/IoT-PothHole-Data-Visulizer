

<!-- <template>
  <div>
    <div class="dropdown">
      <label for="constituency">Select Constituency:</label>
      <select v-model="selectedConstituency" @change="updateCounts">
        <option v-for="constituency in constituencies" :key="constituency" :value="constituency">
          {{ constituency }}
        </option>
      </select>
    </div><br>
    <div class="dashboard" >
      <div class="card col-4">
        <q-icon name="favorite" class="icon"></q-icon>
        <p class="count">{{ totalComplaints }}</p>
        <h4>Total Complaints</h4>
      </div>
      <div class="card col-4">
        <q-icon name="verified" class="icon"></q-icon>
        <p class="count">{{ fixedComplaints }}</p>
        <h4>Fixed Complaints</h4>
      </div>
      <div class="card col-4">
        <q-icon name="warning" class="icon"></q-icon>
        <p class="count">{{ unfixedComplaints }}</p>
        <h4>Unfixed Complaints</h4>
      </div>
    </div>
    <div class="donut-chart">
      <svg ref="donutChart"></svg>
      <div class="legend">
        <div><span class="color-box fixed"></span> Fixed</div>
        <div><span class="color-box unfixed"></span> Unfixed</div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  data() {
    return {
      totalComplaints: 0,
      fixedComplaints: 0,
      unfixedComplaints: 0,
      data: [],
      constituencies: [],
      selectedConstituency: ''
    };
  },
  mounted() {
    this.loadData();
  },
  watch: {
    fixedComplaints(newVal, oldVal) {
      this.drawDonutChart();
    },
    unfixedComplaints(newVal, oldVal) {
      this.drawDonutChart();
    }
  },
  methods: {
    loadData() {
      d3.json('path/to/PotholeData_for_analysis_fileForInterns.geojson')
        .then(data => {
          console.log('Data loaded:', data); // Debug: Log the loaded data
          this.data = data.features;
          this.constituencies = [...new Set(this.data.map(feature => feature.properties.constituency))];
          this.updateCounts();
        })
        .catch(error => {
          console.error('Error loading data:', error); // Error handling
        });
    },
    updateCounts() {
      const filteredData = this.selectedConstituency 
        ? this.data.filter(feature => feature.properties.constituency === this.selectedConstituency) 
        : this.data;
      
      this.totalComplaints = filteredData.length;
      this.fixedComplaints = filteredData.filter(feature => feature.properties.FixedOn).length;
      this.unfixedComplaints = this.totalComplaints - this.fixedComplaints;
      this.drawDonutChart();
    },
    drawDonutChart() {
      const svg = d3.select(this.$refs.donutChart);
      svg.selectAll("*").remove(); // Clear previous chart

      const width = 200;
      const height = 200;
      const radius = Math.min(width, height) / 2;
      const innerRadius = radius * 0.4; // Inner radius for donut effect

      const color = d3.scaleOrdinal(["#005df9", "#89b5ff"]); // Green for fixed, Red for unfixed

      const pie = d3.pie().value(d => d.value);
      const arc = d3.arc().outerRadius(radius - 10).innerRadius(innerRadius);

      const g = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      const data = [
        { label: "Fixed", value: this.fixedComplaints },
        { label: "Unfixed", value: this.unfixedComplaints }
      ];

      const arcs = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

      arcs.append("path")
        .attr("d", arc)
        .style("fill", d => color(d.data.label));

      arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#fff")
        .text(d => d.data.value);
    }
  }
};
</script>

<style scoped>
.dashboard {
  display: flex;
  justify-content: space-around;
  
}
.card {
  background-color: #007bff;
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  display: flex; 
  max-width:20rem;
  width: 100%;
  flex-direction: column;
  align-items: center;
}
.card .icon {
  font-size: 3em; /* Increase icon size */
  margin-bottom: 10px; /* Add spacing between icon and count */
  
}
.card .count {
  font-size: 4em;
  margin: 10px 0;
 

}
.card h4 {
  margin: 0;
  font-size: 1.2em;
}
.dropdown {
  margin-top: 20px;
  text-align: center;
}
.dropdown label {
  margin-right: 10px;
  font-size: 1.2em;
}
.dropdown select {
  padding: 5px;
  font-size: 1em;
}
.donut-chart {
  margin-top: 20px;
  text-align: left;
}
.legend {
  display: flex;
  justify-content: left;
  margin-top: 10px;
}
.legend .color-box {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border-radius: 50%;
}
.fixed {
  background-color: #005df9;
}
.unfixed {
  background-color: #89b5ff;
}
</style>


 -->
 <template>
  <div>
    <div class="dropdown">
      <label for="constituency">Select Constituency:</label>
      <select v-model="selectedConstituency" @change="updateCounts">
        <option v-for="constituency in constituencies" :key="constituency" :value="constituency">
          {{ constituency }}
        </option>
      </select>
    </div><br>
    <div class="dashboard">
      <div class="card col-4">
        <q-icon name="favorite" class="icon"></q-icon>
        <p class="count">{{ totalComplaints }}</p>
        <h4>Total Complaints</h4>
      </div>
      <div class="card col-4">
        <q-icon name="verified" class="icon"></q-icon>
        <p class="count">{{ fixedComplaints }}</p>
        <h4>Fixed Complaints</h4>
      </div>
      <div class="card col-4">
        <q-icon name="warning" class="icon"></q-icon>
        <p class="count">{{ unfixedComplaints }}</p>
        <h4>Unfixed Complaints</h4>
      </div>
    </div>
    <div class="donut-chart">
      <svg ref="donutChart"></svg>
      <div class="legend">
        <!-- <div><span class="color-box fixed"></span> Fixed</div>
        <div><span class="color-box unfixed"></span> Unfixed</div> -->
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  data() {
    return {
      totalComplaints: 0,
      fixedComplaints: 0,
      unfixedComplaints: 0,
      data: [],
      constituencies: [],
      selectedConstituency: ''
    };
  },
  mounted() {
    this.loadData();
  },
  watch: {
    fixedComplaints(newVal, oldVal) {
      this.drawDonutChart();
    },
    unfixedComplaints(newVal, oldVal) {
      this.drawDonutChart();
    }
  },
  methods: {
    loadData() {
      d3.json('path/to/PotholeData_for_analysis_fileForInterns.geojson')
        .then(data => {
          console.log('Data loaded:', data); // Debug: Log the loaded data
          this.data = data.features;
          this.constituencies = [...new Set(this.data.map(feature => feature.properties.constituency))];
          this.updateCounts();
        })
        .catch(error => {
          console.error('Error loading data:', error); // Error handling
        });
    },
    updateCounts() {
      const filteredData = this.selectedConstituency 
        ? this.data.filter(feature => feature.properties.constituency === this.selectedConstituency) 
        : this.data;
      
      this.totalComplaints = filteredData.length;
      this.fixedComplaints = filteredData.filter(feature => feature.properties.FixedOn).length;
      this.unfixedComplaints = this.totalComplaints - this.fixedComplaints;
      this.drawDonutChart();
    },
    drawDonutChart() {
      const svg = d3.select(this.$refs.donutChart);
      svg.selectAll("*").remove(); // Clear previous chart

      const width = 200;
      const height = 200;
      const radius = Math.min(width, height) / 2;
      const innerRadius = radius * 0.4; // Inner radius for donut effect

      const color = d3.scaleOrdinal(["#005df9", "#89b5ff"]); // Green for fixed, Red for unfixed

      const pie = d3.pie().value(d => d.value);
      const arc = d3.arc().outerRadius(radius - 10).innerRadius(innerRadius);

      const g = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      const data = [
        { label: "Fixed", value: this.fixedComplaints },
        { label: "Unfixed", value: this.unfixedComplaints }
      ];

      const arcs = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

      arcs.append("path")
        .attr("d", arc)
        .style("fill", d => color(d.data.label));

      arcs.append("text")
        .attr("transform", d => `translate(${arc.centroid(d)})`)
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#fff")
        .text(d => d.data.value);
    }
  }
};
</script>

<style scoped>
.dashboard {
  display: flex;
  justify-content: space-around;
}
.card {
  background: linear-gradient(to right, #007bff, #0056b3); /* Gradient background */
  color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: left; /* Align text to the left */
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Align items to the left */
  max-width: 20rem;
  width: 100%;
}
.card .icon {
  font-size: 3em; /* Increase icon size */
  margin-bottom: 10px; /* Add spacing between icon and count */
}
.card .count {
  font-size: 4em;
  margin: 10px 0;
}
.card h4 {
  margin: 0;
  font-size: 1.2em;
}
.dropdown {
  margin-top: 20px;
  text-align: center;
}
.dropdown label {
  margin-right: 10px;
  font-size: 1.2em;
}
.dropdown select {
  padding: 5px;
  font-size: 1em;
}
.donut-chart {
  margin-top: 20px;
  text-align: left;
}
.legend {
  display: flex;
  justify-content: left;
  margin-top: 10px;
}
.legend .color-box {
  display: inline-block;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  border-radius: 50%;
}
.fixed {
  background-color: #005df9;
}
.unfixed {
  background-color: #89b5ff;
}
</style>
