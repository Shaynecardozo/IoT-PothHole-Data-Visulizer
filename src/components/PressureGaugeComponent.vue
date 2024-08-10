<template>
  <div @click="emitClick">
    <!-- Back Button -->
 <!-- <button @click="goBack" class="back-button">Back to Main Page</button> -->
    <!-- Existing gauge display code -->
     <div ref="gauge"></div>
  </div>
  
</template>


<script>
import * as d3 from 'd3';

export default {
  props: ['pressureAvg'],
  mounted() {
    this.createGauge();
  },
  watch: {
    pressureAvg() {
      this.updateGauge();
    }
  },
  methods: {
    // New goBack method to navigate to the main page
// goBack() {
//       this.$router.push('/'); // Adjust this route based on your actual main page path
//     },
    
    createGauge() {
      const width = 500;
      const height = 300;
      const margin = 20;
      const radius = Math.min(width, height) / 2 - margin;

      // Clear any existing gauge
      d3.select(this.$refs.gauge).selectAll("*").remove();

      // Append the SVG element
      const svg = d3.select(this.$refs.gauge)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height - 119})`);

      // Define the scale
      this.scale = d3.scaleLinear()
        .domain([0, 45])
        .range([-Math.PI / 2, Math.PI / 2]);

      // Define color ranges
      const colorRanges = [
        { start: 0, end: 15, color: "green" },
        { start: 15, end: 30, color: "yellow" },
        { start: 30, end: 45, color: "red" }
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

      // Foreground arc for the animated border
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
      const pointerWidth = 10;
      const pointerHeadLengthPercent = 0.9;
      const pointerTailLength = 5;
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
        .attr("y", -radius - 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .text(`Pressure Avg: ${this.pressureAvg ? this.pressureAvg.toFixed(2) : '0.00'} Kg/cm²`);

      // Reading labels every 5 units
      const readings = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45];
      readings.forEach(reading => {
        // Add tick marks
        svg.append("line")
          .attr("x1", (radius - 10) * Math.sin(this.scale(reading)))
          .attr("y1", -(radius - 10) * Math.cos(this.scale(reading)))
          .attr("x2", radius * Math.sin(this.scale(reading)))
          .attr("y2", -radius * Math.cos(this.scale(reading)))
          .attr("stroke", "black")
          .attr("stroke-width", 2);

        // Add reading labels
        svg.append("text")
          .attr("x", (radius + 15) * Math.sin(this.scale(reading)))
          .attr("y", -(radius + 15) * Math.cos(this.scale(reading)))
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
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
          const interpolate = d3.interpolate(-90, this.scale(this.pressureAvg) * 180 / Math.PI);
          return t => `rotate(${interpolate(t)})`;
        });

      this.foreground.transition()
        .duration(2000)
        .attrTween("d", (d) => {
          const interpolate = d3.interpolate(d.endAngle, this.scale(this.pressureAvg));
          return t => {
            d.endAngle = interpolate(t);
            return this.foregroundArc(d);
          };
        });

      // Update the text label with the new value
      this.label.text(`Pressure Avg: ${this.pressureAvg ? this.pressureAvg.toFixed(2) : '0.00'} Kg/cm²`);
    }
  }
};
</script>

<style scoped>
#gauge {
  display: flex;
  justify-content: center;
  align-items: center;
  
}
</style>
