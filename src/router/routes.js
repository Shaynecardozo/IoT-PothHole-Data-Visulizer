const routes = [
  {
    path: '/',
    component: () => import('pages/mainpage.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path:'/barchart',
        name:'barchart',
        component:()=>import('components/BarChart.vue')
      }
      
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
