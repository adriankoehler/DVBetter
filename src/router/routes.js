const Connections = import('pages/ConnectionsPage.vue')
const Stations = import('pages/StationsPage.vue')

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'connections', component: () => Connections },
      { path: 'stations', component: () => Stations },
      { path: 'stations/:stationId', component: () => Stations },
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
