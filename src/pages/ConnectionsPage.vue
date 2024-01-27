<template>
  <q-page>
    <div class="content-wrapper list hide-scrollbar">
      <h2>Bookmarks</h2>
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

      <h2>Suggestions</h2>
      <p class="text-grey-6">(none)</p>
    </div>

    <search-area type="connections" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import SearchArea from 'components/SearchArea.vue'
import ListEntry from 'components/ListEntry.vue'

import { settingsFunctions } from 'stores/helperFunctions.js'
import stationsJson from 'assets/stations_dresden.json'

let bookmarkedConnections = ref([])

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
