const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path:"",component:()=>import("src/pages/loginPage.vue")},
      { path: "Gauges", component: () => import("src/pages/SensorPage.vue") },
      { path: "Multiline", component: () => import("src/pages/MultiLinePage.vue") },
      { path: "Comparisonbar", component: () => import("src/pages/ComparisonBarPage.vue") },
      { path: "potholes", component: () => import("src/pages/PotholeMainPage.vue") },
      { path: "landing", component: () => import("src/pages/LandingPage.vue") },
      { path: "Hierarchy", component: () => import("src/pages/HierarchyChart.vue") },
      {
        path: "/barchart",
        name: "barchart",
        component: () => import("components/BarChart.vue"),
      },
      { path: "map", component: () => import("src/components/Map.vue") },
      {
        path: "PotholeData",
        component: () => import("src/components/potholeData.vue"),
      },
      {
        path: "chloropeth",
        component: () => import("src/components/chloropeth.vue"),
      },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
