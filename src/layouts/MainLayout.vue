<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-tabs align="justify" no-caps>
        <q-route-tab :to="{ name: 'stations'}" label="Stations" class="col-grow"/>
        <q-route-tab :to="{ name: 'connections'}" label="Connections" class="col-grow"/>
<!--        <q-route-tab :to="{ name: 'settings'}" icon="settings" style="max-width: 50px"/>--> <!--icon="more_vert"-->
        <q-btn-dropdown
          color="primary"
          dropdown-icon="more_vert"
          unelevated
          no-icon-animation
          square
          :ripple="false"
          style="height: 100%"
        >
          <q-list>
            <q-item clickable v-close-popup @click="$router.push('/bookmarks')">
              <q-item-section>
                <q-item-label>Manage bookmarks</q-item-label>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="$router.push('/settings')">
              <q-item-section>
                <q-item-label>Settings</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-tabs>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
