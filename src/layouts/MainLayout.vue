<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-tabs align="justify" no-caps>
        <q-route-tab :to="{ name: 'stations'}" label="Stations" />
        <q-route-tab to="/connections" label="Departures" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
