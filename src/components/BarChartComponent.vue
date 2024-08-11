<template>
  <div ref="chart"></div>
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
      default: () => new Date(-8640000000000000) // Very early date if not specified
    },
    endDate: {
      type: Date,
      default: () => new Date(8640000000000000) // Very late date if not specified
    }
  },
  watch: {
    data: 'renderChart',
    filter: 'renderChart',
    startDate: 'renderChart',
    endDate: 'renderChart'
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      d3.select(this.$refs.chart).selectAll("*").remove();

      const filteredData = this.filterData();
      const margin = { top: 20, right: 20, bottom: 50, left: 40 },
        width = 1400 - margin.left - margin.right,
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
      y.domain([0, d3.max(filteredData, d => d.value)]);

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

      const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([-20, d3.max(filteredData, d => d.value)]);

      const bars = svg.selectAll(".bar")
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

      // Add hover effect
      svg.selectAll(".bar")
        .on("mouseover", (event, d) => {
          const formatDate = this.getTooltipDateFormat();
          d3.select(event.currentTarget)
            .style("fill", "orange")
            .append("title")
            .text(`Value: ${d.value.toFixed(2)}\n${formatDate(d.date)}`);
        })
        .on("mouseout", function () {
          d3.select(this)
            .style("fill", d => colorScale(d.value))
            .select("title").remove();
        });
    },

    filterData() {
      if (!this.data || !this.data.length) return [];

      const parseDate = d3.timeParse("%d-%m-%Y %H:%M"); // Date format in the ODS file

      let groupedData = [];

      try {
        const parsedData = this.data.map(d => {
          const parsedDate = parseDate(d.date);
          if (!parsedDate) {
            console.warn(`Invalid date format for value: ${d.date}`);
            return null; // Filter out invalid dates
          }
          return {
            ...d,
            date: parsedDate
          };
        }).filter(d => d !== null); // Remove any null entries

        // Filter data within the custom range
        const start = new Date(this.startDate);
        const end = new Date(this.endDate);
        const filteredData = parsedData.filter(d => d.date >= start && d.date <= end);

        switch (this.filter) {
          case 'day':
            // Group by day
            groupedData = d3.groups(filteredData, d => d3.timeDay(d.date))
              .map(([key, values]) => ({
                date: key,
                value: d3.mean(values, d => d.value)
              }));
            break;

          case 'month':
            // Group by month
            groupedData = d3.groups(filteredData, d => d3.timeMonth(d.date))
              .map(([key, values]) => ({
                date: key,
                value: d3.mean(values, d => d.value)
              }));
            break;

          case 'year':
            // Group by year
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
          return d3.timeFormat("%B %Y"); // May 2023
        case 'year':
          return d3.timeFormat("%Y"); // 2023
        default:
          return d3.timeFormat("%d-%m-%Y"); // Default format
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
</style>
