<template>
    <div v-if="visible" class="tooltip" :style="{ top: position.top + 'px', left: position.left + 'px' }">
      <p><strong>Date:</strong> {{ formattedDate }}</p>
      <p><strong>Value:</strong> {{ formattedValue }}</p>
    </div>
  </template>
  
  <script>
  export default {
    props: ['data', 'visible', 'position'],
    computed: {
    formattedDate() {
      console.log("Date in tooltip:", this.data?.date);
      return this.data?.date || 'N/A';
    },
    formattedValue() {
      console.log("Value in tooltip:", this.data?.value);
      return this.data?.value ? this.data.value.toFixed(2) : 'N/A';
    }
  },
    watch: {
    data: {
      handler(newData) {
        console.log('Tooltip data in dialog:', newData);
      },
      deep: true
    }
  }
  }
  </script>
  
  <style scoped>
  .tooltip {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 10px;
    border-radius: 5px;
    font-size: 14px;
    pointer-events: none;
  }
  </style>