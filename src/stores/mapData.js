import { defineStore } from 'pinia';

export const useMapDataStore = defineStore('mapData', {
  state: () => ({
    geojsonData: null,
    constituencies: []
  }),
  getters: {
    filteredData: (state) => (selectedConstituency) => {
      if (!state.geojsonData) return { type: 'FeatureCollection', features: [] };
      return {
        type: 'FeatureCollection',
        features: state.geojsonData.features.filter(
          feature => !selectedConstituency || feature.properties.constituency === selectedConstituency
        )
      };
    }
  },
  actions: {
    async fetchGeoJSON() {
      const response = await fetch('data/PotholeData for analysis_fileForInterns.geojson');
      const data = await response.json();
      this.geojsonData = data;

      // Extract unique constituencies
      const constituenciesSet = new Set();
      data.features.forEach(feature => {
        if (feature.properties.constituency) {
          constituenciesSet.add(feature.properties.constituency);
        }
      });
      this.constituencies.value = Array.from(constituenciesSet);
    }
  }
});
