<template>
  <div ref="chart"></div>
</template>

<script>
import * as d3 from 'd3';

export default {
  props: ['data', 'filter'],
  watch: {
    data: 'renderChart',
    filter: 'renderChart'
  },
  mounted() {
    this.renderChart();
  },
  methods: {
    renderChart() {
      d3.select(this.$refs.chart).selectAll("*").remove();

      const filteredData = this.filterData();
      if (filteredData.length === 0) return;

      const margin = { top: 20, right: 20, bottom: 50, left: 40 },
        width = 1400 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

      const svg = d3.select(this.$refs.chart)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]);

      x.domain(d3.extent(filteredData, d => d.date));
      y.domain([0, d3.max(filteredData, d => d.value)]);

      const xAxis = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(this.getAxisTicks()).tickFormat(this.getAxisDateFormat()));

      xAxis.selectAll("text")
        .attr("transform", "rotate(-40)")
        .style("text-anchor", "end");

      svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y).ticks(10));

      const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value));

      const path = svg.append("path")
        .datum(filteredData)
        .attr("class", "line")
        .attr("d", line)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2.5);

      // Get the length of the line path for animation
      const length = path.node().getTotalLength();

      // Set initial state for stroke-dasharray and stroke-dashoffset
      path
        .attr("stroke-dasharray", length + " " + length)
        .attr("stroke-dashoffset", length)
        .transition()
        .duration(3000)
        .attr("stroke-dashoffset", 0);

      svg.selectAll(".dot")
        .data(filteredData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", 0)
        .style("fill", "red")
        .transition()
        .duration(2000)
        .attr("r", 4);

      svg.selectAll(".dot")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 6) // Increase size on hover
            .style("fill", "orange"); // Change color on hover
        })
        .on("mouseout", function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 3) // Reset size
            .style("fill", "red"); // Reset color
        })
        .append("title")
        .text(d => {
          const formatDate = this.getTooltipDateFormat();
          return `Value: ${d.value.toFixed(2)}\n${formatDate(d.date)}`;
        });
    },

    filterData() {
      if (!this.data || !this.data.length) return [];

      const parseDate = d3.timeParse("%d-%m-%Y %H:%M");

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

        let groupedData = [];

        switch (this.filter) {
          case 'day':
            groupedData = d3.groups(parsedData, d => d3.timeDay(d.date))
              .map(([key, values]) => ({
                date: key,
                value: d3.mean(values, d => d.value)
              }));
            break;

          case 'month':
            groupedData = d3.groups(parsedData, d => d3.timeMonth(d.date))
              .map(([key, values]) => ({
                date: key,
                value: d3.mean(values, d => d.value)
              }));
            break;

          case 'year':
            groupedData = d3.groups(parsedData, d => d3.timeYear(d.date))
              .map(([key, values]) => ({
                date: key,
                value: d3.mean(values, d => d.value)
              }));
            break;

          default:
            groupedData = parsedData;
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

    getAxisTicks() {
      switch (this.filter) {
        case 'day':
          return d3.timeDay.every(1);
        case 'month':
          return d3.timeMonth.every(1);
        case 'year':
          return d3.timeYear.every(1);
        default:
          return d3.timeDay.every(1);
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
.line {
  fill: none;
  stroke: steelblue;
  stroke-width: 2.5px;
}

.dot {
  stroke: white;
  stroke-width: 1.5px;
}

.axis text {
  font-size: 12px;
}
</style>
