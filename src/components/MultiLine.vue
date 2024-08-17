<template>
  <div>
    <!-- Threshold Input and Button -->
    <div class="threshold column">
      <div class="threshold-label">
        <p>Set threshold:</p>
      </div>
      <div class="q-mb-xl q-ml-xl">
        <input v-model.number="userThreshold" type="number" class="threshold-input" placeholder="Set Threshold Value" />
        <button @click="toggleThreshold" class="threshold-button">
          {{ thresholdEnabled ? 'Enabled' : 'Disabled' }}
        </button>
      </div>
    </div>


    <div>
      <!-- Multi Line Chart -->
      <div ref="chartRef" class="chart"></div>
    </div>

  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from 'vue';
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
      default: 0 // Default threshold value
    }
  },
  setup(props) {
    const chartRef = ref(null);
    const sensors = ref(['flowmeter1', 'flowmeter2', 'flowmeter3', 'flowmeter4']);
    const colors = d3.scaleOrdinal([
      "#006400", // DarkGreen
      "#32CD32", // LimeGreen
      "#8FBC8F", // DarkSeaGreen
      "#ADFF2F", // GreenYellow
    ]);

    const thresholdEnabled = ref(false); // State to control threshold visibility
    const userThreshold = ref(props.initialThreshold || 0); // State for user-defined threshold

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

        // Apply date range filter
        const startDate = props.startDate ? new Date(props.startDate) : new Date(-8640000000000000); // min date
        const endDate = props.endDate ? new Date(props.endDate) : new Date(8640000000000000); // max date

        const dateFilteredData = parsedData.filter(d => d.date >= startDate && d.date <= endDate);

        let groupedData = [];

        switch (props.filter) {
          case 'day':
            groupedData = d3.groups(dateFilteredData, d => d3.timeDay(d.date))
              .map(([key, values]) => ({
                date: key,
                flowmeter1: d3.mean(values, d => d.flowmeter1),
                flowmeter2: d3.mean(values, d => d.flowmeter2),
                flowmeter3: d3.mean(values, d => d.flowmeter3),
                flowmeter4: d3.mean(values, d => d.flowmeter4)
              }));
            break;

          case 'month':
            groupedData = d3.groups(dateFilteredData, d => d3.timeMonth(d.date))
              .map(([key, values]) => ({
                date: key,
                flowmeter1: d3.mean(values, d => d.flowmeter1),
                flowmeter2: d3.mean(values, d => d.flowmeter2),
                flowmeter3: d3.mean(values, d => d.flowmeter3),
                flowmeter4: d3.mean(values, d => d.flowmeter4),
              }));
            break;

          case 'year':
            groupedData = d3.groups(dateFilteredData, d => d3.timeYear(d.date))
              .map(([key, values]) => ({
                date: key,
                flowmeter1: d3.mean(values, d => d.flowmeter1),
                flowmeter2: d3.mean(values, d => d.flowmeter2),
                flowmeter3: d3.mean(values, d => d.flowmeter3),
                flowmeter4: d3.mean(values, d => d.flowmeter4)
              }));
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

    const toggleThreshold = () => {
      thresholdEnabled.value = !thresholdEnabled.value;
      renderChart();
    };

    const renderChart = () => {
  d3.select(chartRef.value).selectAll("*").remove();

  if (filteredData.value.length === 0) return;

  const margin = { top: 20, right: 20, bottom: 50, left: 40 },
    width = 1300 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  const svg = d3.select(chartRef.value)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);

    // Set the y-axis domain based on whether threshold is enabled
  const maxValue = thresholdEnabled.value
    ? Math.max(d3.max(filteredData.value, d => Math.max(d.flowmeter1, d.flowmeter2, d.flowmeter3, d.flowmeter4)), userThreshold.value)
    : d3.max(filteredData.value, d => Math.max(d.flowmeter1, d.flowmeter2, d.flowmeter3, d.flowmeter4));


  x.domain(d3.extent(filteredData.value, d => d.date));
  y.domain([0, Math.max(d3.max(filteredData.value, d => Math.max(d.flowmeter1, d.flowmeter2, d.flowmeter3, d.flowmeter4)), userThreshold.value)]);

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

  // Add X axis label
  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom)
    .text("Date");

  // Add Y axis label
  svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 9.5)
    .attr("x", -height / 2)
    .text("Flow Rate (m³/hr)");

  // Handling the Threshold and Data Rendering
  if (thresholdEnabled.value) {
    // Add threshold line
    svg.append("line")
      .attr("class", "threshold-line")
      .attr("x1", 0)
      .attr("y1", y(userThreshold.value))
      .attr("x2", width)
      .attr("y2", y(userThreshold.value))
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4");

    sensors.value.forEach((sensor, index) => {
      const sensorLine = d3.line()
        .x(d => x(d.date))
        .y(d => thresholdEnabled.value ? y(Math.min(d[sensor], userThreshold.value)) : y(d[sensor]));

      const path = svg.append("path")
        .datum(filteredData.value)
        .attr("class", "line")
        .attr("d", sensorLine)
        .attr('fill', 'none')
        .attr('stroke', colors(index))
        .attr('stroke-width', 2.5)
        .style("opacity", d => thresholdEnabled.value && Math.max(...filteredData.value.map(d => d[sensor])) > userThreshold.value ? 0.2 : 1);

        const length = path.node().getTotalLength();

      path
        .attr("stroke-dasharray", length + " " + length)
        .attr("stroke-dashoffset", length)
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
        .attr("cy", d => thresholdEnabled.value ? y(Math.min(d[sensor], userThreshold.value)) : y(d[sensor]))
        .attr("r", 0)
        .style("fill", colors(index))
        .style("opacity", d => thresholdEnabled.value && d[sensor] > userThreshold.value ? 0.2 : 1)
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
          const sensorValue = d[sensor];
    // Check if the sensor value is defined and not null before applying toFixed
    return sensorValue !== undefined && sensorValue !== null
      ? `Value: ${sensorValue.toFixed(2)}\n${formatDate(d.date)}`
      : `Value: N/A\n${formatDate(d.date)}`;
        });
    });
  }
  else {
    // Draw the lines and dots without threshold filtering (default)
    sensors.value.forEach((sensor, index) => {
      const sensorLine = d3.line()
        .x(d => x(d.date))
        .y(d => y(d[sensor]));

      const path = svg.append("path")
        .datum(filteredData.value)
        .attr("class", "line")
        .attr("d", sensorLine)
        .attr('fill', 'none')
        .attr('stroke', colors(index))
        .attr('stroke-width', 2.5);

      const length = path.node().getTotalLength();

      path
        .attr("stroke-dasharray", length + " " + length)
        .attr("stroke-dashoffset", length)
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
          const sensorValue = d[sensor];
          return `Value: ${sensorValue !== undefined && sensorValue !== null ? sensorValue.toFixed(2) : 'N/A'}\n${formatDate(d.date)}`;
        });
    });
  }
};


    watch(() => props.data, renderChart);
    watch(() => props.filter, renderChart);
    watch(() => [props.startDate, props.endDate], renderChart);
    watch(thresholdEnabled, renderChart);
    watch(userThreshold, renderChart);

    onMounted(renderChart);

    return {
      chartRef,
      sensors,
      colors,
      renderChart,
      toggleThreshold,
      thresholdEnabled,
      userThreshold,
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

p{
  font-weight: 500;
  font-size: 18px;
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
  background-color: #1d6e34;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
}

.threshold-button:hover {
  background-color: #0d4221;
}

.threshold-line {
  stroke: red;
  stroke-width: 2;
  stroke-dasharray: 4,4;
}

.threshold {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-end; /* Align the content to the right */
  margin-bottom: 20px; /* Add some space below */
  width: 100%;
}

.threshold-label {
  margin-top: 10px;
  margin-bottom: 5px;
  font-weight: bold;
  text-align: right;
}
</style>
