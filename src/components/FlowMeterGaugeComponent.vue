<template>
  <div @click="emitClick">
    <!-- Gauge display container -->
    <div ref="gauge" class="gauge-container"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  props: ['flowAvg', 'maxValue'],
  mounted() {
    this.createGauge();
  },
  watch: {
    flowAvg() {
      this.updateGauge();
    }
  },
  methods: {
    createGauge() {
      const width = 300;  // Adjusted width
      const height = 200; // Adjusted height
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
        .attr("transform", `translate(${width / 2}, ${height -30})`);

      // Define the scale
      this.scale = d3.scaleLinear()
        .domain([0, this.maxValue])
        .range([-Math.PI / 2, Math.PI / 2]);

      // Define gradient
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "gauge-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#a0eab6"); 
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#0a6a27"); 

      // Foreground arc for the animated border
      this.foregroundArc = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius * 0.9)
        .startAngle(-Math.PI / 2);

      this.foreground = svg.append("path")
        .datum({ endAngle: -Math.PI / 2 })
        .attr("d", this.foregroundArc)
        .style("fill", "none")
        .style("stroke", "url(#gauge-gradient)")
        .style("stroke-width", 4);

      // Draw the gradient arc
      const arc = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius * 0.9)
        .startAngle(this.scale(0))
        .endAngle(this.scale(this.maxValue));

      svg.append("path")
        .attr("d", arc)
        .style("fill", "url(#gauge-gradient)");

      // Place "Flow Avg" label above the gauge
      svg.append("text")
        .attr("x", 0)
        .attr("y", -radius - 40) // Positioned above the gauge
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .text("Flow Avg");

      // Place the value of flowAvg below the gauge
      this.valueLabel = svg.append("text")
        .attr("x", 0)
        .attr("y", 25) // Positioned below the gauge
        .attr("text-anchor", "middle")
        .attr("font-size", "15px")
        .text(`${this.flowAvg ? this.flowAvg.toFixed(2) : '0.00'} m³/h`);

      // Arrow
      const pointerWidth = 8; // Adjusted width
      const pointerHeadLengthPercent = 0.9;
      const pointerTailLength = 4; // Adjusted tail length
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

      // Reading labels based on maxValue
      const step = this.maxValue <= 600 ? 100 : 250;
      const readings = Array.from({ length: Math.ceil(this.maxValue / step) + 1 }, (_, i) => i * step);

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
          const interpolate = d3.interpolate(-90, this.scale(this.flowAvg) * 180 / Math.PI);
          return t => `rotate(${interpolate(t)})`;
        });

      this.foreground.transition()
        .duration(2000)
        .attrTween("d", (d) => {
          const interpolate = d3.interpolate(d.endAngle, this.scale(this.flowAvg));
          return t => {
            d.endAngle = interpolate(t);
            return this.foregroundArc(d);
          };
        });

      // Update the value label below the gauge
      this.valueLabel.text(`${this.flowAvg ? this.flowAvg.toFixed(2) : '0.00'} m³/h`);
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
