<template>
  <q-page :style-fn="myTweak" padding>
    <div :class="['drawer', { 'drawer-closed': !isDrawerOpen }]" style="z-index: 10;">
      <button @click="toggleDrawer" clickable class="menu-icon">☰</button>
      <ul v-if="isDrawerOpen" class="q-mt-xl">
        <li clickable @click="RoutePage('/potholes')"><q-icon name="query_stats" /> Analytics</li>
        <li clickable @click="RoutePage('/map')"><q-icon name="map" /> Map</li>
        <li clickable @click="RoutePage('/PotholeData')"><q-icon name="edit_road" /> Pothole Dashboard</li>
      </ul>
    </div>
    <div class="row q-my-xl">
      <div class="column flex content-center justify-center col-4">
        <q-knob
          readonly
          :min="min"
          :value="fixedPotholes.length"
          :max="constituencyData.length"
          show-value
          size="90px"
          :thickness="0.22"
          color="green"
          track-color="green-3"
          class="text-green q-ma-md"
        />
        <span class="text-center">Fixed Tasks</span>
      </div>
      <div class="column content-center col-4">
        <q-knob
          readonly
          :min="min"
          :max="constituencyData.length"
          :value="pendingPotholes.length"
          show-value
          size="90px"
          :thickness="0.22"
          color="red"
          track-color="red-3"
          class="text-red q-ma-md"
        />
        <span class="text-center">Pending Tasks</span>
      </div>
      <div class="column content-center flex justify-center col-4">
        <q-knob
          readonly
          :min="min"
          :max="constituencyData.length"
          :value="constituencyData.length"
          show-value
          size="90px"
          :thickness="0.22"
          color="blue"
          track-color="blue-3"
          class="text-blue q-ma-md"
        />
        <span class="text-center">Total Tasks</span>
      </div>
    </div>
    <div class="row">
      <q-select
        v-model="filterconstituency"
        clearable
        @update:model-value="updateconstituency()"
        :options="constituencies"
        class="col-4 q-pl-sm"
        multiple
        use-chips
        style="border: 1px solid black"
        label="Filter By Constituency"
      />
      <q-select
        v-model="filterstatus"
        clearable
        @update:model-value="applyfilter()"
        :options="status"
        class="col-4 q-pl-sm"
        style="border: 1px solid black"
        label="Filter By Status"
      />
      <q-select
        v-model="filterarea"
        clearable
        :options="area"
        class="col-4 q-pl-sm"
        @update:model-value="applyfilter()"
        style="border: 1px solid black"
        label="Filter By Area"
      />
    </div>
    <div class="q-pa-md">
      <q-table
        :rows="filteredData"
        :columns="columns"
        row-key="id"
        flat
        bordered
        separator="vertical"
      >
        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <q-btn
              @click="handleButtonClick(props.row)"
              color="primary"
              icon="visibility"
              style="border-radius: 90%"
            />
          </q-td>
        </template>
      </q-table>
    </div>
    <q-dialog
      v-model="openPothole"
      transition-show="flip-up"
      transition-hide="flip-down"
      persistent
    >
      <q-card class="custom-dialog">
        <q-card-section>
          <div class="text-h6 text-center">Pothole Details</div>
        </q-card-section>

        <q-card-section
          class="q-mx-sm"
          style="border: 2px solid black; border-radius: 10px"
        >
          <div class="column">
            <div class="row">
              <strong class="col-6"><q-icon name="edit_road" /> Id</strong
              ><span class="q-pl-sm"
                >: {{ selectedPothole.id ? selectedPothole.id : "NA" }}</span
              >
            </div>
            <div class="row">
              <strong class="col-6"><q-icon name="area_chart" /> Area</strong
              ><span class="q-pl-sm"
                >:
                {{ selectedPothole.area ? selectedPothole.area : "NA" }}</span
              >
            </div>
            <div class="row">
              <strong class="col-6"><q-icon name="build" /> FIxed On</strong
              ><span class="q-pl-sm"
                >:
                {{
                  selectedPothole.FixedOn ? selectedPothole.FixedOn : "NA"
                }}</span
              >
            </div>
            <div class="row">
              <strong class="col-6"
                ><q-icon name="location_on" /> Constituency</strong
              >
              <span class="q-pl-sm"
                >:
                {{
                  selectedPothole.constituency
                    ? selectedPothole.constituency
                    : "NA"
                }}</span
              >
            </div>
            <div class="row">
              <strong class="col-6">
                <q-icon name="verified" /> PWD verified on</strong
              >
              <span class="q-pl-sm"
                >:
                {{
                  selectedPothole.PWDVerifiedOn
                    ? selectedPothole.PWDVerifiedOn
                    : "NA"
                }}</span
              >
            </div>
            <div class="row">
              <strong class="col-6"
                ><q-icon name="priority_high" /> Complaint Recieved on</strong
              ><span class="q-pl-sm"
                >:
                {{
                  selectedPothole.ComplaintReceived
                    ? selectedPothole.ComplaintReceived
                    : "NA"
                }}</span
              >
            </div>
            <div class="row">
              <strong class="col-6"
                ><q-icon name="assignment_ind" /> Assigned to Contractor</strong
              ><span class="q-pl-sm"
                >:
                {{
                  selectedPothole.AssignedToContractor
                    ? selectedPothole.AssignedToContractor
                    : "NA"
                }}</span
              >
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Close" color="blue" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';

export default {
  setup() {
    const openPothole = ref(false);
    const potholedata = ref([]);
    const constituencyData = ref([]);
    const fixedPotholes = ref([]);
    const pendingPotholes = ref([]);
    const constituencies = ref([]);
    const selectedPothole = ref(null);
    const filteredData = ref([]);
    const min = ref(0);
    const status = ref(["fixed", "pending"]);
    const isDrawerOpen=ref(true)
    const router=useRouter();
    const area = ref([
      "Less than equal to 25",
      "Between 25 and 50",
      "Greater than 50",
    ]);
    const filterarea = ref("");
    const filterconstituency = ref([]);
    const filterstatus = ref("");
    const columns = [
      {
        name: "id",
        required: true,
        label: "ID",
        align: "left",
        field: (row) => (row.properties.id ? row.properties.id : "NA"),
      },
      {
        name: "area",
        label: "Area",
        align: "left",
        field: (row) => (row.properties.area ? row.properties.area : "0"),
      },
      {
        name: "constituency",
        label: "Constituency",
        align: "left",
        field: (row) =>
          row.properties.constituency ? row.properties.constituency : "NA",
      },
      {
        name: "fixedOn",
        label: "Fixed On",
        align: "left",
        field: (row) =>
          row.properties.FixedOn ? row.properties.FixedOn : "NA",
      },
      {
        name: "pwdVerifiedOn",
        label: "PWD Verified On",
        align: "left",
        field: (row) =>
          row.properties.PWDVerifiedOn ? row.properties.PWDVerifiedOn : "NA",
      },
      {
        name: "complaintReceived",
        label: "Complaint Received",
        align: "left",
        field: (row) =>
          row.properties.ComplaintReceived
            ? row.properties.ComplaintReceived
            : "NA",
      },
      { name: "action", label: "Action", align: "center" },
    ];

    const toggleDrawer=()=> {
      isDrawerOpen.value = !isDrawerOpen.value;
    }

    const RoutePage=(value)=>
    {
      router.push(value);
      return;
    }

    const loadJson = () => {
      fetch("data/PotholeData for analysis_fileForInterns.geojson")
        .then((response) => response.json())
        .then((data) => {
          potholedata.value = data.features;
          potholedata.value = [...potholedata.value].reverse();
          constituencyData.value = potholedata.value;
          filteredData.value = constituencyData.value;
          pendingPotholes.value = constituencyData.value.filter(
            (row) => !row.properties.FixedOn
          );
          fixedPotholes.value = constituencyData.value.filter(
            (row) => row.properties.FixedOn
          );
          const uniqueConstituencies = new Set();
          potholedata.value.forEach((feature) => {
            if (feature.properties.constituency) {
              uniqueConstituencies.add(feature.properties.constituency);
            }
          });

          constituencies.value = Array.from(uniqueConstituencies);
        });
    };

    const handleButtonClick = (row) => {
      selectedPothole.value = row.properties;
      openPothole.value = true;
    };
    const applyfilter = () => {
      filteredData.value = constituencyData.value;
      if (filterstatus.value === "pending") {
        filteredData.value = filteredData.value.filter(
          (row) => !row.properties.FixedOn
        );
      }
      if (filterstatus.value === "fixed") {
        filteredData.value = filteredData.value.filter(
          (row) => row.properties.FixedOn
        );
      }
      if (filterarea.value === "Less than equal to 25") {
        filteredData.value = filteredData.value.filter(
          (row) => row.properties.area <= 25
        );
      }
      if (filterarea.value === "Between 25 and 50") {
        filteredData.value = filteredData.value.filter(
          (row) => row.properties.area > 25 && row.properties.area <= 50
        );
      }
      if (filterarea.value === "Greater than 50") {
        filteredData.value = filteredData.value.filter(
          (row) => row.properties.area > 50
        );
      }
    };
    const updateconstituency = () => {
      console.log("function called");
      const filter = filterconstituency.value;
      console.log(filter);
      constituencyData.value = potholedata.value.filter(
        (row) =>
          filter === null ||
          filter.includes(row.properties.constituency) ||
          filter.length === 0
      );
      filteredData.value = constituencyData.value;
      applyfilter();
      pendingPotholes.value = constituencyData.value.filter(
        (row) => !row.properties.FixedOn
      );
      fixedPotholes.value = constituencyData.value.filter(
        (row) => row.properties.FixedOn
      );
    };

    onMounted(() => {
      loadJson();
    });

    return {
      potholedata,
      min,
      constituencyData,
      columns,
      loadJson,
      filteredData,
      handleButtonClick,
      fixedPotholes,
      constituencies,
      pendingPotholes,
      selectedPothole,
      openPothole,
      status,
      area,
      filterarea,
      filterconstituency,
      filterstatus,
      applyfilter,
      updateconstituency,
      toggleDrawer,
      isDrawerOpen,
      RoutePage,
      router,
    };
  },
};
</script>

<style scoped>
.custom-dialog {
  max-width: 28rem;
  width: 100%;
}
.drawer {
  width: 250px;
  height: calc(100vh - 50px); /* Adjust height to be below the navbar */
  position: fixed;
  top: 50px; /* Height of the navbar */
  left: 0;
  background-color: #f4f4f4;
  overflow-x: hidden;
  transition: all 0.3s ease;
}

.drawer-closed {
  width: 60px; /* Narrow width when the drawer is closed */
  height: fit-content;
  border-radius:0 50% 50% 0;
  transition: all 0.3s ease;
}

.drawer ul {
  list-style-type: none;
  padding: 0;
}

.drawer ul li {
  padding: 5px 10px;
  margin:10px 20px;
  width:fit-content;
}
.drawer ul li:hover {
  transition:all 0.5s ease;
  cursor:pointer;
  background-color: blue;
  border-radius: 20px;
  color:white
}

.menu-icon {
  font-size: 24px;
  float:right;
  margin: 10px 10px;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
}


</style>
