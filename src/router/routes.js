import {
  CONNECTION_SEARCH_HISTORY_KEY,
  STATION_SEARCH_HISTORY_KEY,
  pushToSearchHistory,
} from 'src/stores/search-history.js';

const Connections = import('pages/ConnectionsPage.vue');
const ConnectionDetail = import('pages/ConnectionDetail.vue');
const Stations = import('pages/StationsPage.vue');
const StationDetail = import('pages/StationDetail.vue');

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'settings', component: () => import('pages/SettingsPage.vue') },
      {
        path: 'connections/:connectionId?',
        children: [
          {
            path: '',
            name: 'connections',
            component: () => Connections,
          },
          {
            path: ':connectionId',
            name: 'connectionDetail',
            component: () => ConnectionDetail,
            beforeEnter: logConnectionSearchHistory,
          },
        ],
      },
      {
        path: 'stations/:stationId?',
        children: [
          {
            path: '',
            name: 'stations',
            component: () => Stations,
          },
          {
            path: ':stationId',
            name: 'stationDetail',
            component: () => StationDetail,
            beforeEnter: logStationSearchHistory,
          },
        ],
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

function logStationSearchHistory(to, _from) {
  const stationId = to.params.stationId;
  pushToSearchHistory(STATION_SEARCH_HISTORY_KEY, stationId);
}

function logConnectionSearchHistory(to, _from) {
  const connectionId = to.params.connectionId;
  pushToSearchHistory(CONNECTION_SEARCH_HISTORY_KEY, connectionId);
}

export default routes;
