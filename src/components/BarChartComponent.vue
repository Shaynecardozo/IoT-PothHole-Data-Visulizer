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

        switch (this.filter) {
          case 'day':
            // Group by day
            groupedData = d3.groups(parsedData, d => d3.timeDay(d.date))
              .map(([key, values]) => ({
                date: key,
                value: d3.mean(values, d => d.value)
              }));
            break;

          case 'month':
            // Group by month
            groupedData = d3.groups(parsedData, d => d3.timeMonth(d.date))
              .map(([key, values]) => ({
                date: key,
                value: d3.mean(values, d => d.value)
              }));
            break;

          case 'year':
            // Group by year
            groupedData = d3.groups(parsedData, d => d3.timeYear(d.date))
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
















<!-- <template>
  <div ref="chart" @mousemove="handleMouseMove" @mouseleave="hideTooltip">
    <BarChartDialog 
      :data="tooltipData" 
      :visible="tooltipVisible" 
      :position="tooltipPosition" 
    />


  </div>
  <div ref="chart"></div>
</template>

<script>
import * as d3 from 'd3';
// import BarChartDialog from './BarChartDialog.vue';

export default {
  props: ['data', 'filter'],
  // components: { BarChartDialog },
  data() {
    // return {
    //   tooltipVisible: false,
    //   tooltipData: null,
    //   tooltipPosition: { top: 0, left: 0 },
    // };
  },
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
      const margin = { top: 20, right: 20, bottom: 30, left: 40 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

      const svg = d3.select(this.$refs.chart)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
        y = d3.scaleLinear().rangeRound([height, 0]);

      x.domain(filteredData.map(d => d.date));
      y.domain([0, d3.max(filteredData, d => d.value)]);

      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x));

      svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y).ticks(10));

      const colorScale = d3.scaleSequential(d3.interpolateBlues)
        .domain([0, d3.max(filteredData, d => d.value)]);

      const bars = svg.selectAll(".bar")
        .data(filteredData)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.date))
        .attr("y", d => y(0)) // Start at the bottom
        .attr("width", x.bandwidth())
        .attr("height", 0) // Start with height 0
        // .on("mouseover", (event, d) => this.showTooltip(d, event))
        // .on("mouseout", () => this.hideTooltip())
        .style("fill", d => colorScale(d.value)) // Initial color based on value
        .transition() // Add transition for animation
        .duration(1000)
        

        .delay((d, i) => i * 100) // Stagger the animation
        .ease(d3.easeBounceOut) // Easing function for smooth animation
        .attr("y", d => y(d.value))
        .attr("height", d => height - y(d.value));

      // Add hover effect
      svg.selectAll(".bar")
        .on("mouseover", function(event, d) {
          d3.select(this)
            .style("fill", "orange")
            .append("title")
            .text(`Value: ${d.value.toFixed(2)}\nDate: ${d.date}`);
        })
        .on("mouseout", function(event, d) {
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
        // Parse dates in the data array
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
        }).filter(d => d !== null);

        switch (this.filter) {
          case 'day':
            // For daily data, we use the parsed data as it is
            groupedData = d3.groups(parsedData, d => d3.timeDay(d.date))
              .map(([key, values]) => ({
                date: d3.timeFormat("%Y-%m-%d")(key),
                value: d3.mean(values, d => d.value) // Average value for the day
              }));
            break;

          case 'month':
            // Group by month
            groupedData = d3.groups(parsedData, d => d3.timeMonth(d.date))
              .map(([key, values]) => ({
                date: d3.timeFormat("%Y-%m")(key),
                value: d3.mean(values, d => d.value) // Average value for the month
              }));
            break;

          case 'year':
            // Group by year
            groupedData = d3.groups(parsedData, d => d3.timeYear(d.date))
              .map(([key, values]) => ({
                date: d3.timeFormat("%Y")(key),
                value: d3.mean(values, d => d.value) // Average value for the year
              }));
            break;
        }

        // Debugging output
        console.log('Filtered Data:', groupedData);
        return groupedData;
      } catch (error) {
        console.error('Error filtering data:', error);
      }

      
    },

    // showTooltip(data, event) {
    //   console.log('Tooltip data:', data);
    //   this.tooltipData = {
    //     date: data.date,
    //     value: data.value
    //   }
    //   console.log("Tooltip data set:", this.tooltipData); // Log set data
    //   this.tooltipVisible = true;
    //   this.moveTooltip(event);
    // },
    // moveTooltip(event) {
    //   const offsetX = 10; // X offset from the cursor
    //   const offsetY = 20; // Y offset from the cursor
    //   const { clientX, clientY } = event;
    //   this.tooltipPosition = {
    //     top: clientY + offsetY,
    //     left: clientX + offsetX
    //   };
    // },
    // hideTooltip() {
    //   this.tooltipVisible = false;
    //   this.tooltipData = null;
    // },
    // handleMouseMove(event) {
    //   if (this.tooltipVisible) {
    //     this.moveTooltip(event);
    //   }
    // }
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
</style>-->
