<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="row justify-between items-center">
      <q-toolbar>
        <q-toolbar-title> Pothole Map </q-toolbar-title>
        <div class="row">
          <div
            class="q-mx-sm tabs q-px-md q-py-xs"
            v-if="checklogin()"
            clickable
            @click="handleroute('home')"
          >
            Home
          </div>
          <div
            class="q-mx-sm tabs q-px-md q-py-xs"
            v-if="checklogin()"
            clickable
            @click="handleroute('potholes')"
          >
            Potholes
          </div>
          <div
            class="q-mx-sm tabs q-px-md q-py-xs"
            v-if="checklogin()"
            clickable
            @click="handleroute('flowmeter')"
          >
            Flow Meter
          </div>
          <div
            class="q-mx-sm tabs q-px-md q-py-xs"
            v-if="checklogin()"
            clickable

            @click="handleroute('logout')"
          >
            Logout
          </div>
        </div>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { useLoginStore } from "src/stores/loginStore";
import { useRouter } from "vue-router";

export default {
  name: "layout",
  setup() {
    const store = useLoginStore();
    const router = useRouter();
    const checklogin = () => {
      return store.checklogin();
    };
    const handleroute = (value) => {
      console.log('funtion called')
      console.log(value)
      console.log(value==='home')
      if (value ==='home') {
        router.push("/landing")
      }
      else if (value ==="potholes") {
        router.push("/potholes")
      }
      else if (value === "flowmeter") {
        router.push("/flowmeter")
      }
      else
      {
        router.push('/')
      }
    };
    return {
      store,
      router,
      checklogin,
      handleroute,
    };
  },
};
</script>

<style>
.tabs:hover {
  transition: all;
  transition-duration: 0.3s;
  background-color: black;
  text-decoration: underline;
  cursor: pointer;
}
.tabs {
  border-radius: 20px;
}
</style>
