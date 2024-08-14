<template>
  <div class="card donut-chart-card">
    <!-- Icon with click event to open popup -->
    <span class="q-ml-sm" style="font-size: 20px; font-weight:500;color:green;">
      Number Of Fixed And Unfixed Complaints
     </span>
    <q-icon name="open_in_full" class="icon" @click="openPopup"></q-icon>
    <div class="legend q-mb-md">
      <div><span class="color-box fixed"></span> Fixed</div>
      <div><span class="color-box unfixed"></span> Unfixed</div>
    </div>
    <svg ref="donutChart"></svg>

    <!-- Popup Dialog -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="popup-card">
        <q-card-actions>
          <q-btn flat  @click="dialog = false">
            <q-icon name="close"></q-icon>
          </q-btn>
        </q-card-actions>
        <q-card-section>
          <!-- Larger version of the donut chart -->
          <div class="legend q-mb-md">
            <div><span class="color-box fixed"></span> Fixed</div>
            <div><span class="color-box unfixed"></span> Unfixed</div>
          </div>
          <svg ref="popupDonutChart" class="popup-donut-chart"></svg>
        </q-card-section>
        
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from "vue";
import * as d3 from "d3";
import {
  QDialog,
  QCard,
  QCardSection,
  QCardActions,
  QBtn,
  QIcon,
} from "quasar";

export default {
  components: { QDialog, QCard, QCardSection, QCardActions, QBtn, QIcon },
  props: {
    fixedComplaints: Number,
    unfixedComplaints: Number,
  },
  setup(props) {
    const donutChart = ref(null);
    const popupDonutChart = ref(null);
    const dialog = ref(false);

    const drawDonutChart = (container, fixedComplaints, unfixedComplaints) => {
      const svg = d3.select(container);
      svg.selectAll("*").remove(); // Clear previous chart

      const width = container === popupDonutChart.value ? 450 : 335; // Larger size for popup
      const height = container === popupDonutChart.value ? 350 : 335; // Larger size for popup
      const radius = Math.min(width, height) / 2;
      const innerRadius = radius * 0.4; // Inner radius for donut effect

      const color = d3.scaleOrdinal(["#4caf50","#2f4550"]); // Colors

      const pie = d3.pie().value((d) => d.value);
      const arc = d3
        .arc()
        .outerRadius(radius - 10)
        .innerRadius(innerRadius);

      const g = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      const data = [
        { label: "Fixed", value: fixedComplaints },
        { label: "Unfixed", value: unfixedComplaints },
      ];

      const arcs = g
        .selectAll(".arc")
        .data(pie(data))
        .enter()
        .append("g")
        .attr("class", "arc");

      arcs
        .append("path")
        .attr("d", arc)
        .style("fill", (d) => color(d.data.label))
        .transition() // Apply transition
        .duration(1000) // Duration of the animation
        .attrTween("d", function (d) {
          const i = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return function (t) {
            return arc(i(t));
          };
        });

      arcs
        .append("text")
        .attr("transform", (d) => `translate(${arc.centroid(d)})`)
        .attr("dy", ".35em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#fff")
        .text((d) => d.data.value);
    };

    const openPopup = async () => {
      dialog.value = true;
      await nextTick(); // Ensure DOM is updated before drawing
      // Draw the larger donut chart in the popup
      drawDonutChart(
        popupDonutChart.value,
        props.fixedComplaints,
        props.unfixedComplaints
      );
    };

    onMounted(() => {
      drawDonutChart(
        donutChart.value,
        props.fixedComplaints,
        props.unfixedComplaints
      );
    });

    watch(
      () => props.fixedComplaints,
      () => {
        drawDonutChart(
          donutChart.value,
          props.fixedComplaints,
          props.unfixedComplaints
        );
      }
    );

    watch(
      () => props.unfixedComplaints,
      () => {
        drawDonutChart(
          donutChart.value,
          props.fixedComplaints,
          props.unfixedComplaints
        );
      }
    );

    return {
      donutChart,
      popupDonutChart,
      dialog,
      openPopup,
    };
  },
};
</script>

<style scoped>
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin: 16px;
  width: fit-content; /* Adjust width as needed */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
}
.icon {
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
}
.donut-chart {
  text-align: center;
}
.popup-card {
  width:fit-content;
  height:fit-content;
}
.popup-donut-chart {
  width: 100%;
  height: 100%;
}
.legend {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}
.legend div {
  display: flex;
  align-items: center;
  margin-right: 15px; /* Adjust spacing between legend items */
}
.color-box {
  width: 20px;
  height: 20px;
  border: solid black 0.2px;
  margin-right: 10px;
}
.fixed {
  background-color: #4caf50; /* Fixed color */
  position: relative;
}
.unfixed {
  background-color:#2f4550; /* Unfixed color */
}
</style>
