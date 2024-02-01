<template>
  <q-page>
    <div class="content-wrapper">
      <h2>Bookmarks</h2>

      <h3>Stations</h3>
      <list-entry
        v-for="entry in bookmarkedStations"
        :name="entry.name"
        :abbreviation="entry.abbreviation"
        :stationId="entry.id"
        :key="entry.id"
      />

      <h3>Connections</h3>
      <list-entry
        v-for="entry in bookmarkedConnections"
        :name="entry.stations[0].name"
        :name2="entry.stations[1].name"
        :abbreviation="entry.stations[0].abbreviation"
        :abbreviation2="entry.stations[1].abbreviation"
        :stationId="entry.stations[0].id"
        :stationId2="entry.stations[1].id"
        :key="entry.connectionId"
      />

    <!-- TODO: option to delete them (instead of selecting)-->
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import ListEntry from 'components/ListEntry.vue'
import {settingsFunctions} from "stores/helperFunctions";
import stationsJson from "assets/stations_dresden.json";

const bookmarkedStations = ref([])
const bookmarkedConnections = ref([])

settingsFunctions.getBookmarkedStations().then(response => {
  response.forEach(stationId => {
    const stationData = stationsJson.features.filter(d => d.properties.id == stationId)
    bookmarkedStations.value.push({id: stationId, name: stationData[0].properties.name, abbreviation: stationData[0].properties.abbreviation})
  });
})

settingsFunctions.getBookmarkedConnections().then(response => {
  // TODOLATER clean up this mess (+what if no station match)
  response.forEach(connectionId => {
    const stationMatches = connectionId.match(/^(\d{8})-(\d{8})$/)
    const stationData1 = stationsJson.features.filter(d => d.properties.id === stationMatches[1])
    const stationData2 = stationsJson.features.filter(d => d.properties.id === stationMatches[2])
    bookmarkedConnections.value.push({connectionId: connectionId, stations: [
        {id: stationData1[0].properties.id, name: stationData1[0].properties.name, abbreviation: stationData1[0].properties.abbreviation},
        {id: stationData2[0].properties.id, name: stationData2[0].properties.name, abbreviation: stationData2[0].properties.abbreviation}
      ]})
  })
})
</script>
