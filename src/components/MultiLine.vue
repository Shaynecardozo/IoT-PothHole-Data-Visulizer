<template>
  <div class="chart" ref="chartRef"></div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
import * as d3 from 'd3';

export default {
  props: ['data', 'filter'],
  setup(props) {
    const chartRef = ref(null);
    const sensors = ref(['flowmeter1', 'flowmeter2', 'flowmeter3', 'flowmeter4']);
    const colors = d3.scaleOrdinal(d3.schemeCategory10);

    const filteredData = computed(() => {
      if (!props.data || !props.data.length) return [];

      const parseDate = d3.timeParse("%d-%m-%Y %H:%M");

      try {
        const parsedData = props.data.map(d => {
          const parsedDate = parseDate(d.date);
          if (!parsedDate) {
            console.warn(`Invalid date format for value: ${d.date}`);
            return null;
          }
          return {
            ...d,
            date: parsedDate,
            flowmeter1: +d['Flowmeter 1'],
            flowmeter2: +d['Flowmeter 2'],
            flowmeter3: +d['Flowmeter 3'],
            flowmeter4: +d['Flowmeter 4'],
          };
        }).filter(d => d !== null);

        let groupedData = [];

        switch (props.filter) {
          case 'day':
            groupedData = d3.groups(parsedData, d => d3.timeDay(d.date))
              .map(([key, values]) => ({
                date: key,
                flowmeter1: d3.mean(values, d => d.flowmeter1),
                flowmeter2: d3.mean(values, d => d.flowmeter2),
                flowmeter3: d3.mean(values, d => d.flowmeter3),
                flowmeter4: d3.mean(values, d => d.flowmeter4)
              }));
            break;

          case 'month':
            groupedData = d3.groups(parsedData, d => d3.timeMonth(d.date))
              .map(([key, values]) => ({
                date: key,
                flowmeter1: d3.mean(values, d => d.flowmeter1),
                flowmeter2: d3.mean(values, d => d.flowmeter2),
                flowmeter3: d3.mean(values, d => d.flowmeter3),
                flowmeter4: d3.mean(values, d => d.flowmeter4),
              }));
            break;

          case 'year':
            groupedData = d3.groups(parsedData, d => d3.timeYear(d.date))
              .map(([key, values]) => ({
                date: key,
                flowmeter1: d3.mean(values, d => d.flowmeter1),
                flowmeter2: d3.mean(values, d => d.flowmeter2),
                flowmeter3: d3.mean(values, d => d.flowmeter3),
                flowmeter4: d3.mean(values, d => d.flowmeter4)
              }));
            break;

          default:
            groupedData = parsedData;
            break;
        }

        return groupedData.map(d => ({
          date: new Date(d.date),
          flowmeter1: d.flowmeter1,
          flowmeter2: d.flowmeter2,
          flowmeter3: d.flowmeter3,
          flowmeter4: d.flowmeter4
        }));
      } catch (error) {
        console.error('Error filtering data:', error);
        return [];
      }
    });

    const getAxisTicks = () => {
      switch (props.filter) {
        case 'day':
          return d3.timeDay.every(1);
        case 'month':
          return d3.timeMonth.every(1);
        case 'year':
          return d3.timeYear.every(1);
        default:
          return d3.timeDay.every(1);
      }
    };

    const getAxisDateFormat = () => {
      const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };

      switch (props.filter) {
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
    };

    const getTooltipDateFormat = () => {
      const getOrdinalSuffix = (day) => {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
          case 1: return 'st';
          case 2: return 'nd';
          case 3: return 'rd';
          default: return 'th';
        }
      };

      switch (props.filter) {
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
    };

    const renderChart = () => {
  console.log('Render chart called');
  d3.select(chartRef.value).selectAll("*").remove();

  if (filteredData.value.length === 0) return;

  const margin = { top: 20, right: 20, bottom: 50, left: 40 },
    width = 1400 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3.select(chartRef.value)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);

  x.domain(d3.extent(filteredData.value, d => d.date));
  y.domain([0, d3.max(filteredData.value, d => Math.max(d.flowmeter1, d.flowmeter2, d.flowmeter3, d.flowmeter4))]);

  const xAxis = svg.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(getAxisTicks()).tickFormat(getAxisDateFormat()));

  xAxis.selectAll("text")
    .attr("transform", "rotate(-40)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y).ticks(10));

  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .text("Date");

  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 9.5)
    .attr("x", -height / 2)
    .text("Flow Rate (m³/hr)");

  sensors.value.forEach((sensor, index) => {
    const sensorLine = d3.line()
      .x(d => {
        const xValue = x(d.date);
        return isNaN(xValue) ? null : xValue;
      })
      .y(d => {
        const yValue = y(d[sensor]);
        return isNaN(yValue) ? null : yValue;
      });

    svg.append("path")
      .datum(filteredData.value.filter(d => !isNaN(x(d.date)) && !isNaN(y(d[sensor]))))
      .attr("class", "line")
      .attr("d", sensorLine)
      .attr('fill', 'none')
      .attr('stroke', colors(index))
      .attr('stroke-width', 2.5)
      .attr("stroke-dasharray", function() {
        const length = this.getTotalLength();
        return `${length} ${length}`;
      })
      .attr("stroke-dashoffset", function() {
        return this.getTotalLength();
      })
      .transition()
      .duration(3000)
      .attr("stroke-dashoffset", 0);
  });

  sensors.value.forEach((sensor, index) => {
    svg.selectAll(`.dot-${sensor}`)
      .data(filteredData.value)
      .enter().append("circle")
      .attr("class", `dot-${sensor}`)
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d[sensor]))
      .attr("r", 0)
      .style("fill", colors(index))
      .transition()
      .duration(2000)
      .attr("r", 4);

    svg.selectAll(`.dot-${sensor}`)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 6)
          .style("fill", "orange");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 3)
          .style("fill", colors(index));
      })
      .append("title")
      .text(d => {
        const formatDate = getTooltipDateFormat();
        const value = d[sensor];
        return value !== undefined && !isNaN(value)
          ? `Value: ${value.toFixed(2)}\n${formatDate(d.date)}`
          : `Value: N/A\n${formatDate(d.date)}`;
      });
  });
};


    watch(() => props.data, renderChart);
    watch(() => props.filter, renderChart);

    onMounted(renderChart);

    return {
      chartRef,
      sensors,
      colors,
      renderChart
    };
  }
};
</script>

<style scoped>
.chart {
  width: 100%;
  height: 500px;
}

.line {
  fill: none;
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
