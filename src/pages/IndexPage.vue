<template>
  <q-page class="flex flex-center">
    <div class="q-pa-md form-container">
      <q-form @submit.prevent="onSubmit" class="q-gutter-md">
        <q-input
          filled
          v-model="name"
          label="Name *"
          hint="Enter your name"
          lazy-rules
          :rules="[ 
            val => !!val || 'Please enter your name',
          ]"
          class="custom-input"
        />
        <q-input
          filled
          type="password"
          v-model="password"
          label="Password *"
          lazy-rules
          :rules="[
            val => !!val || 'Please enter your password',
          ]"
          class="custom-input"
        />
        <div class="q-mt-md">
          <button type="submit" class="submit">Submit</button>
        </div>
      </q-form>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router' // Import useRouter

const router = useRouter() // Initialize the router
const name = ref('')
const password = ref('')

const onSubmit = () => {
  console.log(`Name: ${name.value}, Password: ${password.value}`)
  router.push({ name: 'LandingPage' }) // Navigate to LandingPage
}
</script>

<style scoped>
.q-pa-md {
  max-width: 100%;
  background-color: #ffffffea;
  border-radius: 25px;
  box-shadow: 0 0px 22px rgba(195, 0, 195, 0.9);
  border: 4px solid #000000;
}

.form-container {
  padding: 20px;
}

.q-mt-md {
  margin-top: 20px;
}

.submit {
  background-color: rgb(33, 149, 238);
  margin-right: 25px;
  margin-left: 65px;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 50px;
  font-size: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.submit:hover {
  opacity: 0.8;
}

.custom-input {
  border-radius: 100px;
  padding: 15px;
  font-size: 1rem;
}
</style>
