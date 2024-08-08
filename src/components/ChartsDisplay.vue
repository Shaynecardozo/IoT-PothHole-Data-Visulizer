<!-- 

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
      <div class="card">
        <h3>Total Complaints</h3>
        <p>{{ totalComplaints }}</p>
      </div>
      <div class="card">
        <h3>Fixed Complaints</h3>
        <p>{{ fixedComplaints }}</p>
      </div>
      <div class="card">
        <h3>Unfixed Complaints</h3>
        <p>{{ unfixedComplaints }}</p>
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
}
.card h3 {
  margin: 0;
  
}
.card p {
  font-size: 2em;
  margin: 0;
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
      <div class="card">
        <h3>Total Complaints</h3>
        <p>{{ totalComplaints }}</p>
      </div>
      <div class="card">
        <h3>Fixed Complaints</h3>
        <p>{{ fixedComplaints }}</p>
      </div>
      <div class="card">
        <h3>Unfixed Complaints</h3>
        <p>{{ unfixedComplaints }}</p>
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
}
.card h3 {
  margin: 0;
}
.card p {
  font-size: 2em;
  margin: 0;
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
  margin:auto
}
.unfixed {
  background-color: #89b5ff; /* Red */
}
</style> 

