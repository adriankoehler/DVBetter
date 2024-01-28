import { pushToSearchHistory } from "src/stores/search_history";

const Connections = import('pages/ConnectionsPage.vue')
const ConnectionDetail = import('pages/ConnectionDetail.vue')
const Stations = import('pages/StationsPage.vue')
const StationDetail = import('pages/StationDetail.vue')

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
      { path: 'connections/:connectionId?',
        children: [
          {
            path: '',
            name: 'connections',
            component: Connections,
          },
          {
            path: ':connectionId',
            name: 'connectionDetail',
            component: ConnectionDetail,
          },
        ],
      },
      { path: 'stations/:stationId?',
        children: [
          {
            path: '',
            name: 'stations',
            component: Stations,
          },
          {
            path: ':stationId',
            name: 'stationDetail',
            component: StationDetail,
            beforeEnter: logSearchHistory,
          },
        ],
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
async function logSearchHistory(to, _from) {
  const stationId = to.params.stationId;
  await pushToSearchHistory(stationId);
}

export default routes

