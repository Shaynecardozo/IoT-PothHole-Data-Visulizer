<template>
  <q-layout  view="hHh lpR fFf">
    <!-- Header with Three-Dot Button -->
    <q-header style="height: 50px; padding-right: 16px;" class="bg-drawer text-white row items-center">
      <q-btn v-if="checklogin" flat dense round icon="menu" @click="drawer = !drawer" class="text-white" />
      <q-space></q-space>
      <div class="q-ml-xl text-h6 ">FlowTrack Analytics</div>
    </q-header>

    <!-- Drawer/Sidebar -->
    <q-drawer v-if="checklogin" v-model="drawer" :width="220" side="left" bordered  content-class="bg-drawer" class="q-mt-md">
      <q-list>
        <!-- Landing Section with Dropdown -->

          <q-list>
            <q-item
              clickable
              style="gap:32px; font-weight: bold"
              class="rounded-item row justify-start items-center"
              @click="navigateTo('/landing')"
              :class="{ 'bg-active text-active': isActiveRoute('/landing') }"
            >
              <q-icon name="home" size="sm" :color="isActiveRoute('/landing') ? 'white' : 'black'" />
              <q-item-section >Home</q-item-section>
            </q-item>
          </q-list>

        <!-- Flowmeter Section with Dropdown -->
        <q-expansion-item
          label="IOT"
          icon="water"
          :default-opened="false"
          class="text-bold"
        >
          <q-list >
            <q-item
              clickable
              @click="navigateTo('/Gauges')"
              :class="{ 'bg-active text-active': isActiveRoute('/Gauges') }"
                  style="gap:10px"
              class="rounded-item q-ml-md row justify-start items-center"
            >
              <q-icon name="speed" size="xs" :color="isActiveRoute('/Gauges') ? 'white' : 'black'" />
              <q-item-section>Sensors</q-item-section>
            </q-item>
          </q-list>
          <q-list>
            <q-item
              clickable
              @click="navigateTo('/Comparisonbar')"
              :class="{ 'bg-active text-active': isActiveRoute('/Comparisonbar') }"
                  style="gap:10px"
              class="rounded-item row q-ml-md row justify-start items-center"
            >
              <q-icon name="stacked_bar_chart" size="xs" :color="isActiveRoute('/Comparisonbar') ? 'white' : 'black'" />
              <q-item-section>Comparison Bar Chart</q-item-section>
            </q-item>
          </q-list>
          <q-list>
            <q-item
              clickable
              @click="navigateTo('/Multiline')"
              :class="{ 'bg-active text-active': isActiveRoute('/Multiline') }"
                  style="gap:10px"
              class="rounded-item row q-ml-md row justify-start items-center"
            >
              <q-icon name="stacked_line_chart" size="xs" :color="isActiveRoute('/Multiline') ? 'white' : 'black'" />
              <q-item-section>MultiLine Graph</q-item-section>
            </q-item>
          </q-list>
          <q-list>
            <q-item
              clickable
              @click="navigateTo('/Hierarchy')"
              :class="{ 'bg-active text-active': isActiveRoute('/Hierarchy') }"
                  style="gap:10px"
              class="rounded-item row q-ml-md row justify-start items-center"
            >
              <q-icon name="account_tree" size="xs" :color="isActiveRoute('/Hierarchy') ? 'white' : 'black'" />
              <q-item-section>Hierarchy Chart</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
        <q-expansion-item
          label="Potholes"
          icon="edit_road"
          class="text-bold"
          :default-opened="false"
        >
          <q-list>
            <q-item
              clickable
              @click="navigateTo('/potholes')"
              :class="{ 'bg-active text-active': isActiveRoute('/potholes') }"
                   style="gap:10px"
              class="rounded-item q-ml-md row row justify-start items-center"
            >
              <q-icon name="query_stats" :color="isActiveRoute('/potholes') ? 'white' : 'black'" />
              <q-item-section>Analytics</q-item-section>
            </q-item>
            <q-item
              clickable
              @click="navigateTo('/map')"
              :class="{ 'bg-active text-active': isActiveRoute('/map') }"
                   style="gap:10px"
              class="rounded-item q-ml-md row row justify-start items-center"
            >
              <q-icon name="map" :color="isActiveRoute('/map') ? 'white' : 'black'" />
              <q-item-section>Map</q-item-section>
            </q-item>
            <q-item
              clickable
              @click="navigateTo('/PotholeData')"
              :class="{ 'bg-active text-active': isActiveRoute('/PotholeData') }"
                   style="gap:10px"
              class="rounded-item q-ml-md row row justify-start items-center"
            >
              <q-icon name="edit_road" :color="isActiveRoute('/PotholeData') ? 'white' : 'black'" />
              <q-item-section>Pothole Dashboard</q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-list>
      <q-list>
            <q-item
              clickable
              style="gap:32px; font-weight: bold"
              class="rounded-item row justify-start items-center"
              @click="navigateTo('/')"
            >
              <q-icon name="logout" size="sm"  />
              <q-item-section >Logout</q-item-section>
            </q-item>
          </q-list>
    </q-drawer>

    <!-- Page Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useLoginStore } from 'src/stores/loginStore';

export default {
  name: 'MainLayout',
  setup() {
    const drawer = ref(true);
    const router = useRouter();
    const route = useRoute();
    const store = useLoginStore();

    const checklogin = computed(() => {
      const loggedIn = store.checklogin();
      if (!loggedIn) {
        router.push('/'); // Redirect to login page if not logged in
      }
      return loggedIn;
    });

    const isActiveRoute = (path) => {
      return route.path === path;
    };

    const navigateTo = (path) => {
      if(path==='/'){
        store.updateLogin;
      }
      router.push(path);
    };

    return {
      drawer,
      isActiveRoute,
      navigateTo,
      checklogin,
    };
  },
};
</script>

<style scoped>
/* Styles for the q-drawer and its contents */
.q-drawer {
  transition: all 0.3s ease; /* Smooth transition for opening and closing drawer */
}

.q-item-section {
  font-weight: bold;
  color: white; /* Makes the text inside the drawer white */
}

.bg-drawer {

  background-color: #1d6e34 !important; /* Green background */
}

.text-active {
  color: white!important; /* Text color for selected items */
}

.rounded-item {
  border-top-left-radius: 50px; /* Customize the radius for rounded corners */
  border-bottom-left-radius: 50px;
}

.bg-active {
  background-color: rgb(57, 168, 83) !important; /* Background for active items */
}

.q-item {
  color: black; /* Text color for items */
  background-color: transparent; /* Transparent background by default */
  font-weight: normal;
}

.q-item:hover {
  background-color: rgb(114, 171, 140) !important; /* Highlight background on hover */
}

</style>
