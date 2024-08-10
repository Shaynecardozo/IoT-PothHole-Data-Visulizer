<template>
    <q-page class="flex flex-center" style="flex-direction: column; padding: 20px;">
      <div class="button-container">
        <q-btn label="Potholes" color="primary" class="landing-btn" @click="onPotholesClick" />
        <q-btn label="IoT" color="secondary" class="landing-btn" @click="onIoTClick" />
      </div>
  
      <div class="card-container">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6">What We Do</div>
            <p>We focus on detecting and addressing potholes using advanced technology to ensure safer roads.</p>
          </q-card-section>
        </q-card>
  
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6">IoT Integration</div>
            <p>Our solutions leverage IoT devices to monitor and manage infrastructure in real-time, providing efficient maintenance and response.</p>
          </q-card-section>
        </q-card>
  
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-h6">Our Vision</div>
            <p>We aim to improve urban living through smart technology, making cities safer and more efficient for everyone.</p>
          </q-card-section>
        </q-card>
      </div>
    </q-page>
  </template>
  
  <script setup>
  const onPotholesClick = () => {
    console.log("Potholes button clicked")
    // Navigate to the potholes-related page or perform an action
  }
  
  const onIoTClick = () => {
    console.log("IoT button clicked")
    // Navigate to the IoT-related page or perform an action
  }
  </script>
  
  <style scoped>
  .button-container {
    display: flex;
    justify-content: space-around;
    width: 100%;
    margin-bottom: 30px;
  }
  
  .landing-btn {
    width: 40%;
  }
  
  .card-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .q-card {
    width: 80%;
    max-width: 600px;
  }
  
  .text-h6 {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 10px;
  }
  
  p {
    font-size: 1rem;
  }
  </style>
  