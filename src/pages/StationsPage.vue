<template>
  <q-page>
    <div class="content-wrapper hide-scrollbar">
      <h2>Bookmarks</h2>
      <list-entry
        v-for="entry in bookmarkedStations"
        :name="entry.name"
        :abbreviation="entry.abbreviation"
        :stationId="entry.id"
        :key="entry.id"
      />

      <h2>Suggestions</h2>
      <list-entry
        v-for="entry in suggestedStations"
        :name="entry.name"
        :abbreviation="entry.abbreviation"
        :stationId="entry.id"
        :key="entry.id"
      />
    </div>

    <search-area type="departures" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import SearchArea from 'components/SearchArea.vue'
import ListEntry from 'components/ListEntry.vue'
import { settingsFunctions } from 'stores/helperFunctions.js'
import stationsJson from 'assets/stations_dresden.json'
import { getSuggestedStations } from 'src/stores/search-history.js'

let bookmarkedStations = ref([])
let suggestedStations = ref([])

settingsFunctions.getBookmarkedStations().then(response => {
  response.forEach(stationId => {
    const stationData = stationsJson.features.filter(d => d.properties.id == stationId)
    bookmarkedStations.value.push({id: stationId, name: stationData[0].properties.name, abbreviation: stationData[0].properties.abbreviation})
  });
})
getSuggestedStations().then(response => {
  response.forEach(stationId => {
    const stationData = stationsJson.features.filter(d => d.properties.id == stationId)
    suggestedStations.value.push({id: stationId, name: stationData[0].properties.name, abbreviation: stationData[0].properties.abbreviation})
  });
})
</script>
