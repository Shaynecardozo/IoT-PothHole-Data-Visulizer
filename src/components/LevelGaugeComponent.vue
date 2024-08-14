<template>
  <div @click="emitClick">
    <!-- Existing gauge display code -->
    <div ref="gauge" class="gauge-container"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  props: ['levelAvg'],
  mounted() {
    this.createGauge();
  },
  watch: {
    levelAvg() {
      this.updateGauge();
    }
  },
  methods: {
    createGauge() {
      const width = 300; // Adjusted width for smaller gauge
      const height = 200; // Adjusted height for smaller gauge
      const margin = 10;  // Adjusted margin
      const radius = Math.min(width, height) / 2 - margin;

      // Clear any existing gauge
      d3.select(this.$refs.gauge).selectAll("*").remove();

      // Append the SVG element
      const svg = d3.select(this.$refs.gauge)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height - margin})`);

      // Define the scale
      this.scale = d3.scaleLinear()
        .domain([0, 15])
        .range([-Math.PI / 2, Math.PI / 2]);

      // Define color ranges for the level gauge
      const colorRanges = [
        { start: 0, end: 5, color: "green" },
        { start: 5, end: 10, color: "yellow" },
        { start: 10, end: 15, color: "red" }
      ];

      // Draw each color segment
      colorRanges.forEach(range => {
        const segmentArc = d3.arc()
          .innerRadius(radius * 0.7)
          .outerRadius(radius * 0.9)
          .startAngle(this.scale(range.start))
          .endAngle(this.scale(range.end));

        svg.append("path")
          .attr("d", segmentArc)
          .style("fill", range.color);
      });

      // Foreground arc
      this.foregroundArc = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius * 0.9)
        .startAngle(-Math.PI / 2);

      this.foreground = svg.append("path")
        .datum({ endAngle: -Math.PI / 2 })
        .attr("d", this.foregroundArc)
        .style("fill", "none")
        .style("stroke", "black")
        .style("stroke-width", 2);

      // Arrow
      const pointerWidth = 8; // Adjusted width for smaller gauge
      const pointerHeadLengthPercent = 0.9;
      const pointerTailLength = 4; // Adjusted tail length for smaller gauge
      const pointerHeadLength = Math.round(radius * pointerHeadLengthPercent);

      const lineData = [
        [pointerWidth / 2, 0],
        [0, -pointerHeadLength],
        [-(pointerWidth / 2), 0],
        [0, pointerTailLength],
        [pointerWidth / 2, 0]
      ];

      const pointerLine = d3.line().curve(d3.curveLinear);
      this.pointer = svg.append("g").data([lineData])
        .attr("class", "pointer")
        .attr("transform", `translate(0,0)`)
        .append("path")
        .attr("d", pointerLine)
        .attr("transform", `rotate(-90)`);

      // Text label (initially set to 0)
      this.label = svg.append("text")
        .attr("x", 0)
        .attr("y", -radius - 20) // Adjusted position for smaller gauge
        .attr("text-anchor", "middle")
        .attr("font-size", "18px") // Adjusted font size
        .text(`Level Avg: ${this.levelAvg ? this.levelAvg.toFixed(2) : '0.00'} m`);

      // Reading labels every 2.5 units
      const readings = [0, 2.5, 5, 7.5, 10, 12.5, 15];
      readings.forEach(reading => {
        // Add tick marks
        svg.append("line")
          .attr("x1", (radius - 5) * Math.sin(this.scale(reading))) // Adjusted tick mark length
          .attr("y1", -(radius - 5) * Math.cos(this.scale(reading)))
          .attr("x2", radius * Math.sin(this.scale(reading)))
          .attr("y2", -radius * Math.cos(this.scale(reading)))
          .attr("stroke", "black")
          .attr("stroke-width", 1); // Adjusted stroke width

        // Add reading labels
        svg.append("text")
          .attr("x", (radius + 10) * Math.sin(this.scale(reading))) // Adjusted label position
          .attr("y", -(radius + 10) * Math.cos(this.scale(reading)))
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("font-size", "12px") // Adjusted font size
          .text(reading);
      });

      this.updateGauge();
    },
    emitClick() {
      this.$emit('gauge-clicked');
    },
    updateGauge() {
      this.pointer.transition()
        .duration(2000)
        .attrTween("transform", () => {
          const interpolate = d3.interpolate(-90, this.scale(this.levelAvg) * 180 / Math.PI);
          return t => `rotate(${interpolate(t)})`;
        });

      this.foreground.transition()
        .duration(2000)
        .attrTween("d", (d) => {
          const interpolate = d3.interpolate(d.endAngle, this.scale(this.levelAvg));
          return t => {
            d.endAngle = interpolate(t);
            return this.foregroundArc(d);
          };
        });

      // Update the text label with the new value
      this.label.text(`Level Avg: ${this.levelAvg ? this.levelAvg.toFixed(2) : '0.00'} m`);
    }
  }
};
</script>

<style scoped>
.gauge-container {
  display: flex;
  margin-top: -20px;

  justify-content: center;
  align-items: center;
  max-width: 100%; /* Ensure it fits within its container */
  height: auto;    /* Allow height to adjust based on content */
}
</style>
