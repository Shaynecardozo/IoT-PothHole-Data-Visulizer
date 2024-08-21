<<<<<<< HEAD
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
  data() {
    return {
      displayedValue: 0, // Counter to display the incremented value
    };
  },
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
      .attr("transform", `translate(${width / 2}, ${height - 30})`);

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

   

    // Draw the gradient arc with curvy edges
    const arc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.9)
      .cornerRadius(10)  // Adds rounded corners
      .startAngle(this.scale(0))
      .endAngle(this.scale(this.maxValue));

    svg.append("path")
      .attr("d", arc)
      .style("fill", "url(#gauge-gradient)");
 // Foreground arc for the animated border with curvy edges
 this.foregroundArc = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.9)
      .cornerRadius(10)  // Adds rounded corners
      .startAngle(-Math.PI / 2);

    this.foreground = svg.append("path")
      .datum({ endAngle: -Math.PI / 2 })
      .attr("d", this.foregroundArc)
      .style("fill", "none")
      .style("stroke", "url(#gauge-gradient)")
      .style("stroke-width", 2);
      // Place "Flow Avg" label above the gauge
      svg.append("text")
        .attr("x", 0)
        .attr("y", -radius - 40) // Positioned above the gauge
        .attr("text-anchor", "middle")
        .attr("font-size", "30px")
        .attr("fill",'green')
        .text("Flow Avg");

      // Place the value of flowAvg below the gauge
      this.valueLabel = svg.append("text")
        .attr("x", 0)
        .attr("y", 26) // Positioned below the gauge
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight",'800')
        .attr("fill","green")
        .text(`${this.displayedValue.toFixed(2)} m³/h`);

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
          .attr("font-size", "12px")
          .attr("fill","green")
          .attr("font-weight",'600') // Adjusted font size
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
          const interpolate = d3.interpolate(-90, this.scale(this.flowAvg) * 180 / Math.PI);
          return t => `rotate(${interpolate(t)})`;
        });

      // Animate the foreground arc
      this.foreground.transition()
        .duration(duration)
        .attrTween("d", (d) => {
          const interpolate = d3.interpolate(d.endAngle, this.scale(this.flowAvg));
          return t => {
            d.endAngle = interpolate(t);
            return this.foregroundArc(d);
          };
        });

      // Animate the value label below the gauge
      const valueInterpolator = d3.interpolate(this.displayedValue, this.flowAvg);
      d3.select(this)
        .transition()
        .duration(duration)
        .tween("text", () => {
          return t => {
            this.displayedValue = valueInterpolator(t);
            this.valueLabel.text(`${this.displayedValue.toFixed(2)} m³/h`);
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
=======
<template>
  <div @click="emitClick">
    <!-- Existing gauge display code -->
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
        .attr("transform", `translate(${width / 2}, ${height - margin})`);

      // Define the scale
      this.scale = d3.scaleLinear()
        .domain([0, this.maxValue])
        .range([-Math.PI / 2, Math.PI / 2]);

      // Define color ranges
      const colorRanges = [
        { start: 0, end: this.maxValue / 3, color: "green" },
        { start: this.maxValue / 3, end: (this.maxValue / 3) * 2, color: "yellow" },
        { start: (this.maxValue / 3) * 2, end: this.maxValue, color: "red" }
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

      // Text label (initially set to 0)
      this.label = svg.append("text")
        .attr("x", 0)
        .attr("y", -radius - 20) // Adjusted position
        .attr("text-anchor", "middle")
        .attr("font-size", "18px") // Adjusted font size
        .text(`Flow Avg: ${this.flowAvg ? this.flowAvg.toFixed(2) : '0.00'} m³/h`);

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

      // Update the text label with the new value
      this.label.text(`Flow Avg: ${this.flowAvg ? this.flowAvg.toFixed(2) : '0.00'} m³/h`);
    }
  }
};
</script>

<style scoped>
.gauge-container {
  display: flex;
  margin-top: 0px;
  justify-content: center;
  align-items: center;
  max-width: 100%; /* Ensure it fits within its container */
  height: auto;    /* Allow height to adjust based on content */
}
</style>
>>>>>>> 705830440d4df675cf602c678e3d184c68ab2c17
