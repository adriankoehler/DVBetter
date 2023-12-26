<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title align="center">
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          DVBetter
        </q-toolbar-title>
      </q-toolbar>

      <q-tabs align="justify">
        <q-route-tab to="/stations" label="Stations" />
        <q-route-tab to="/connections" label="Departures" />
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
