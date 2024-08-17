<template>
  <div>
    <!-- Threshold Input and Button -->
    <input v-model.number="userThreshold" type="number" class="threshold-input" placeholder="Set Threshold Value" />
    <button @click="toggleThreshold" class="threshold-button">
      Threshold Value is {{ thresholdEnabled ? 'Enabled' : 'Disabled' }} ({{ userThreshold }})
    </button>

    <!-- Bar Chart -->
    <div ref="chart"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  props: {
    data: {
      type: Array,
      required: true
    },
    filter: {
      type: String,
      default: 'day'
    },
    startDate: {
      type: Date,
      default: () => new Date(-8640000000000000) // Minimum possible date
    },
    endDate: {
      type: Date,
      default: () => new Date(8640000000000000) // Maximum possible date
    },
    initialThreshold: {
      type: Number,
      default: 6 // Default threshold value
    }
  },
  data() {
    return {
      thresholdEnabled: false, // State to control threshold visibility
      userThreshold: this.initialThreshold // State for user-defined threshold
    };
  },
  watch: {
    data: 'renderChart',
    filter: 'renderChart',
    startDate: 'renderChart',
    endDate: 'renderChart',
    thresholdEnabled: 'renderChart', // Re-render chart when threshold is toggled
    userThreshold: 'renderChart' // Re-render chart when user changes the threshold value
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    toggleThreshold() {
      this.thresholdEnabled = !this.thresholdEnabled;
    },
    renderChart() {
      d3.select(this.$refs.chart).selectAll("*").remove();

      const filteredData = this.filterData();
      const margin = { top: 20, right: 20, bottom: 50, left: 40 },
        width = 1300 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

      const svg = d3.select(this.$refs.chart)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand().rangeRound([0, width]).padding(0.2),
        y = d3.scaleLinear().rangeRound([height, 0]);

      x.domain(filteredData.map(d => d.date));
      y.domain([0, Math.max(d3.max(filteredData, d => d.value), this.userThreshold)]);

      const xAxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(this.getAxisDateFormat()));

      xAxis.selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

      svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y).ticks(10));

        const colorScale = d3.scaleSequential(d3.interpolateGreens)
        .domain([-20, d3.max(filteredData, d => d.value)]);

      if (this.thresholdEnabled) {
        // Add threshold line
        svg.append("line")
          .attr("class", "threshold-line")
          .attr("x1", 0)
          .attr("y1", y(this.userThreshold))
          .attr("x2", width)
          .attr("y2", y(this.userThreshold))
          .attr("stroke", "red")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4,4");

        // Add bars with conditional color and transparency for above-threshold bars
        svg.selectAll(".bar")
        .data(filteredData)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.date))
    .attr("y", height) // Start the bars from the bottom of the chart
    .attr("width", x.bandwidth())
    .style("fill", d => d.value > this.userThreshold ? "transparent" : colorScale(d.value))
    .style("opacity", d => d.value > this.userThreshold ? 0.2 : 1)
    .transition()
    .duration(2000)
    .attr("y", d => y(Math.min(d.value, this.userThreshold))) // Animate to the final position
    .attr("height", d => height - y(Math.min(d.value, this.userThreshold)));




      } else {
        // Display all bars as normal
        svg.selectAll(".bar")
        .data(filteredData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.date))
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .style("fill", d => colorScale(d.value)) // Initial color based on value
        .transition()
        .duration(2000)
        .attr("y", d => y(d.value))
        .attr("height", d => height - y(d.value));

      }

      svg.selectAll(".bar")
        .on("mouseover", (event, d) => {
          if (!this.thresholdEnabled || d.value <= this.userThreshold) {
            const formatDate = this.getTooltipDateFormat();
            d3.select(event.currentTarget)
              .style("fill", "orange")
              .append("title")
              .text(`Value: ${d.value.toFixed(2)}\n${formatDate(d.date)}`);
          }
        })
        .on("mouseout", (event, d) => {
          if (!this.thresholdEnabled || d.value <= this.userThreshold) {
            d3.select(event.currentTarget)
              .style("fill",  d => colorScale(d.value))
              .select("title").remove();
          }
        });
    },

    filterData() {
      if (!this.data || !this.data.length) return [];

      const parseDate = d3.timeParse("%d-%m-%Y %H:%M");

      let groupedData = [];

      try {
        const parsedData = this.data.map(d => {
          const parsedDate = parseDate(d.date);
          if (!parsedDate) {
            console.warn(`Invalid date format for value: ${d.date}`);
            return null;
          }
          return {
            ...d,
            date: parsedDate
          };
        }).filter(d => d !== null);

        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const filteredData = parsedData.filter(d => d.date >= start && d.date <= end);

        switch (this.filter) {
          case 'day':
            groupedData = d3.groups(filteredData, d => d3.timeDay(d.date))
              .map(([key, values]) => ({
                date: key,
                value: d3.mean(values, d => d.value)
              }));
            break;

          case 'month':
            groupedData = d3.groups(filteredData, d => d3.timeMonth(d.date))
              .map(([key, values]) => ({
                date: key,
                value: d3.mean(values, d => d.value)
              }));
            break;

          case 'year':
            groupedData = d3.groups(filteredData, d => d3.timeYear(d.date))
              .map(([key, values]) => ({
                date: key,
                value: d3.mean(values, d => d.value)
              }));
            break;
        }

        return groupedData.map(d => ({
          date: new Date(d.date),
          value: d.value
        }));
      } catch (error) {
        console.error('Error filtering data:', error);
        return [];
      }
    },

    getAxisDateFormat() {
      const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };

      switch (this.filter) {
        case 'day':
          return (date) => {
            const day = date.getDate();
            const suffix = getOrdinalSuffix(day);
            return d3.timeFormat(`%d${suffix} %B`)(date);
          };
        case 'month':
          return d3.timeFormat("%B %Y");
        case 'year':
          return d3.timeFormat("%Y");
        default:
          return d3.timeFormat("%d-%m-%Y");
      }
    },

    getTooltipDateFormat() {
      const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };

      switch (this.filter) {
        case 'day':
          return (date) => {
            const day = date.getDate();
            const suffix = getOrdinalSuffix(day);
            return d3.timeFormat(`%d${suffix} %B %Y`)(date);
          };
        case 'month':
          return d3.timeFormat("%B %Y");
        case 'year':
          return d3.timeFormat("%Y");
        default:
          return d3.timeFormat("%d-%m-%Y");
      }
    }
  }
};
</script>

<style scoped>
.bar {
  fill: steelblue;
}

.bar:hover {
  fill: orange;
}

.axis--x path {
  display: none;
}

.threshold-line {
  stroke: red;
  stroke-width: 2;
  stroke-dasharray: 4,4;
}

.threshold-input {
  margin-right: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
  width: 150px;
}

.threshold-button {
  padding: 10px 20px;
  background-color: #000000;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.threshold-button:hover {
  background-color: #333333;
}
</style>
