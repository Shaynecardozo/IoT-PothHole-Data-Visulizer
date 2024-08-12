<template>
  <q-page style="height: 90vh">
    <q-select
      class="q-px-sm"
      v-model="selectedConstituency"
      :options="constituencies"
      label="Filter by Constituency"
      clearable
      @update:model-value="updateMap"
      multiple
      use-chips
    />
    <div class="row">
      <q-checkbox
        class="col-4"
        style="border: 1px solid black"
        v-model="showMarkers"
        label="Markers"
        @update:model-value="updateMap"
      />
      <q-checkbox
        style="border: 1px solid black"
        class="col-4"
        v-model="showHeatMap"
        label="Heatmap"
        @update:model-value="updateMap"
      />
      <q-checkbox
        class="col-4"
        style="border: 1px solid black"
        v-model="showPending"
        label="Unfixed Potholes"
        @update:model-value="updateMap"
      />
    </div>
    <div id="map" style="height: 85%"></div>
    <q-dialog v-model="dialog" persistent>
      <q-card class="custom-dialog">
        <q-card-section>
          <div class="text-h6 text-center">Pothole Details</div>
        </q-card-section>

        <q-card-section
          class="q-mx-sm"
          style="border: 2px solid black; border-radius: 10px"
        >
          <div class="row">
            <strong class="col-6"><q-icon name="edit_road" /> Id</strong
            ><span class="q-pl-sm">: {{ selectedPothole.id ? selectedPothole.id : "NA" }}</span>
            <strong class="col-6"><q-icon name="area_chart" /> Area</strong
            ><span class="q-pl-sm">: {{ selectedPothole.area ? selectedPothole.area : "NA" }}</span>
            <strong class="col-6"><q-icon name="build" /> FIxed On</strong
            ><span class=" q-pl-sm">: {{ selectedPothole.FixedOn ? selectedPothole.FixedOn : "NA" }}</span>
            <strong class="col-6"><q-icon name="location_on" /> Constituency</strong
            ><span class=" q-pl-sm">: {{ selectedPothole.constituency ? selectedPothole.constituency : "NA" }}</span>
            <strong class="col-6"><q-icon name="verified" /> PWD verified on</strong
            ><span class="q-pl-sm">: {{ selectedPothole.PWDVerifiedOn? selectedPothole.PWDVerifiedOn : "NA" }}</span>
            <strong class="col-6"><q-icon name="priority_high" /> Complaint Recieved on</strong
            ><span class="q-pl-sm">: {{ selectedPothole.ComplaintReceived ? selectedPothole.ComplaintReceived : "NA" }}</span>
            <strong class="col-6"><q-icon name="assignment_ind" /> Assigned to Contractor</strong
            ><span class="q-pl-sm">: {{ selectedPothole.AssignedToContractor ? selectedPothole.AssignedToContractor : "NA" }}</span>
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
import { onMounted, ref, watch } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

export default {
  setup() {
    const map = ref(null);
    const heatLayer = ref(null);
    const markerLayer = ref(L.layerGroup()); // Layer group for markers
    const selectedConstituency = ref([]);
    const geoJSONData = ref(null);
    const constituencies = ref([]);
    const showMarkers = ref(true);
    const showHeatMap = ref(true);
    const showPending = ref(false);
    const filteredData = ref(null);
    const dialog = ref(false);
    const selectedPothole = ref({});

    const createCustomIcon = (isFixed) => {
      return L.divIcon({
        className: "custom-icon",
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" ${
          isFixed ? 'fill="lime"' : 'fill="red"'
        } stroke="black" stroke-width="1"><path  d="M12 2C8.13 2 5 5.13 5 9c0 3.87 7 13 7 13s7-9.13 7-13c0-3.87-3.13-7-7-7zm0 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
        iconSize: [10, 10],
        iconAnchor: [12, 24],
      });
    };

    const updateMap = () => {
      if (!geoJSONData.value) return;
      markerLayer.value.clearLayers();
      heatLayer.value.setLatLngs([]);
      console.log("function called");
      if (showPending.value === false) {
        filteredData.value = {
          type: "FeatureCollection",
          features: geoJSONData.value.features.filter(
            (feature) =>
              selectedConstituency.value === null ||
              selectedConstituency.value.includes(feature.properties.constituency)||
              selectedConstituency.value.length===0
          ),
        };
      } else {
        filteredData.value = {
          type: "FeatureCollection",
          features: geoJSONData.value.features.filter(
            (feature) =>
            ((selectedConstituency.value === null && !feature.properties.FixedOn) ||
              (selectedConstituency.value.includes(feature.properties.constituency) && !feature.properties.FixedOn) ||
              (selectedConstituency.value.length===0) && !feature.properties.FixedOn)
             // (selectedConstituency.value === null &&
               // !feature.properties.FixedOn) ||
              //(feature.properties.constituency === selectedConstituency.value &&
                //!feature.properties.FixedOn)
          ),
        };
      }
      if (showHeatMap.value === true) {
        const heatmapData = filteredData.value.features
          .map((feature) =>
            feature.geometry.type === "Point"
              ? [
                  feature.geometry.coordinates[1],
                  feature.geometry.coordinates[0],
                ]
              : null
          )
          .filter((coord) => coord !== null);
        if (heatLayer.value) {
          heatLayer.value.setLatLngs([]);
        }
        heatLayer.value.setLatLngs(heatmapData);
      }
      if (showMarkers.value === true) {
        updateMarkers();
      }
    };

    const updateMarkers = () => {
      if (markerLayer.value) {
        markerLayer.value.clearLayers();
      }
      if (showMarkers.value === true) {
        L.geoJson(filteredData.value, {
          pointToLayer: (feature, latlng) => {
            const isFixed = feature.properties.FixedOn;
            return L.marker(latlng, {
              icon: createCustomIcon(isFixed),
            })
              .bindTooltip(
                `<strong>Constituency:</strong> ${
                  feature.properties.constituency
                }<br>${
                  isFixed
                    ? "<strong>Fixed On:</strong>" + isFixed
                    : "<strong>status</strong>: not fixed"
                }`
              )
              .on("click", () => {
                selectedPothole.value = feature.properties;
                dialog.value = true;
              });
          },
        }).addTo(markerLayer.value);
      }

      markerLayer.value.addTo(map.value);
    };

    const fetchGeoJSON = () => {
      return fetch("data/PotholeData for analysis_fileForInterns.geojson") // Replace with your GeoJSON file path
        .then((response) => response.json())
        .then((data) => {
          geoJSONData.value = data;

          // Extract unique constituencies
          const uniqueConstituencies = new Set();
          data.features.forEach((feature) => {
            if (feature.properties.constituency) {
              uniqueConstituencies.add(feature.properties.constituency);
            }
          });

          constituencies.value = Array.from(uniqueConstituencies);
          updateMap();
        });
    };

    onMounted(() => {
      map.value = L.map("map").setView([15.5, 73.9], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map.value);

      heatLayer.value = L.heatLayer([], { radius: 30 }).addTo(map.value);
      markerLayer.value.addTo(map.value);

      map.value.on("zoomend", () => {
        if (showPending.value === false) {
          filteredData.value = {
            type: "FeatureCollection",
            features: geoJSONData.value.features.filter(
              (feature) =>
              selectedConstituency.value === null ||
              selectedConstituency.value.includes(feature.properties.constituency)||
              selectedConstituency.value.length===0
            ),
          };
        } else {
          filteredData.value = {
            type: "FeatureCollection",
            features: geoJSONData.value.features.filter(
              (feature) =>
              ((selectedConstituency.value === null && !feature.properties.FixedOn) ||
              (selectedConstituency.value.includes(feature.properties.constituency) && !feature.properties.FixedOn) ||
              (selectedConstituency.value.length===0) && !feature.properties.FixedOn)
            ),
          };
        }
        updateMarkers();
      });

      fetchGeoJSON();
    });

    watch(selectedConstituency, () => {
      updateMap();
    });

    return {
      selectedConstituency,
      constituencies,
      updateMap,
      filteredData,
      showPending,
      showHeatMap,
      showMarkers,
      selectedPothole,
      dialog,
    };
  },
};
</script>

<style scoped>
#map {
  width: 100%;
}
.custom-icon {
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.custom-dialog {
  position: absolute;
  top: 10%;
  right: 0;
  max-width: 28rem;
  width:100%;
  font-size: 15px;
}
</style>
