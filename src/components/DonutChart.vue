<template>
  <div class="card">
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
  props: {
    fixedComplaints: Number,
    unfixedComplaints: Number
  },
  mounted() {
    this.drawDonutChart();
  },
  watch: {
    fixedComplaints: 'drawDonutChart',
    unfixedComplaints: 'drawDonutChart'
  },
  methods: {
    drawDonutChart() {
      const svg = d3.select(this.$refs.donutChart);
      svg.selectAll("*").remove(); // Clear previous chart

      const width = 200;
      const height = 200;
      const radius = Math.min(width, height) / 2;
      const innerRadius = radius * 0.4; // Inner radius for donut effect

      const color = d3.scaleOrdinal(["#007bff", "#72e5ff"]); // Colors

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
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin: 16px;
  width: 100%; /* Adjust width as needed */
  max-width: 400px; /* Optional: Set max-width for responsiveness */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.donut-chart {
  text-align: center;
}

.legend {
  display: flex;
  justify-content: center;
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
  background-color: #007bff;
}

.unfixed {
  background-color: #72e5ff;
}
</style>
