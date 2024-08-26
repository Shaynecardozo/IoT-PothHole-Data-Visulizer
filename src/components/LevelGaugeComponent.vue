<template>
  <div @click="emitClick">
    <div ref="gauge" class="gauge-container"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  props: ['levelAvg'],
  data() {
    return {
      displayedValue: 0, // Counter to display the incremented value
    };
  },
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
    .attr("transform", `translate(${width / 2}, ${height - 30})`);

  // Define the scale
  this.scale = d3.scaleLinear()
    .domain([0, 15])
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

  // Draw the gradient arc with rounded corners
  const arc = d3.arc()
    .innerRadius(radius * 0.7)
    .outerRadius(radius * 0.9)
    .cornerRadius(10) // Adds rounded corners
    .startAngle(this.scale(0))
    .endAngle(this.scale(15));

  svg.append("path")
    .attr("d", arc)
    .style("fill", "url(#gauge-gradient)");

  // Foreground arc with rounded corners
  this.foregroundArc = d3.arc()
    .innerRadius(radius * 0.7)
    .outerRadius(radius * 0.9)
    .cornerRadius(10) // Adds rounded corners
    .startAngle(-Math.PI / 2);

  this.foreground = svg.append("path")
    .datum({ endAngle: -Math.PI / 2 })
    .attr("d", this.foregroundArc)
    .style("fill", "none")
    .style("stroke", "url(#gauge-gradient)")
    .style("stroke-width", 2)
    .style("stroke-linecap", "round"); // Make stroke ends rounded


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
  svg.append("text")
    .attr("x", 0)
    .attr("y", -radius - 40) // Positioned above the gauge
    .attr("text-anchor", "middle")
    .attr("font-size", "30px")
    .attr("fill","green")
    .text("Level Avg");

  // Place the value of levelAvg below the gauge
  this.valueLabel = svg.append("text")
    .attr("x", 0)
    .attr("y", 26) // Positioned below the gauge
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .attr("font-weight",'800')
    .attr("fill","green")
    .text(`${this.displayedValue.toFixed(2)} m`);

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
      const duration = 2000; // Animation duration

      // Animate the pointer
      this.pointer.transition()
        .duration(duration)
        .attrTween("transform", () => {
          const interpolate = d3.interpolate(-90, this.scale(this.levelAvg) * 180 / Math.PI);
          return t => `rotate(${interpolate(t)})`;
        });

      // Animate the foreground arc
      this.foreground.transition()
        .duration(duration)
        .attrTween("d", (d) => {
          const interpolate = d3.interpolate(d.endAngle, this.scale(this.levelAvg));
          return t => {
            d.endAngle = interpolate(t);
            return this.foregroundArc(d);
          };
        });

      // Animate the value label
      const valueInterpolator = d3.interpolate(this.displayedValue, this.levelAvg);
      d3.select(this)
        .transition()
        .duration(duration)
        .tween("text", () => {
          return t => {
            this.displayedValue = valueInterpolator(t);
            this.valueLabel.text(`${this.displayedValue.toFixed(2)} m`);
          };
        });
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
