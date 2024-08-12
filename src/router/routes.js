const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path:"",component:()=>import("src/pages/loginPage.vue")},
      { path: "flowmeter", component: () => import("src/pages/mainpage.vue") },
      { path: "potholes", component: () => import("src/pages/PotholeMainPage.vue") },
      { path: "landing", component: () => import("src/pages/LandingPage.vue") },
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
