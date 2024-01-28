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
      <q-skeleton v-show="suggestionsLoading" height="53px" />
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
import { getSuggestedIds, STATION_SEARCH_HISTORY_KEY } from 'src/stores/search-history.js'

const bookmarkedStations = ref([])
const suggestedStations = ref([])
const suggestionsLoading = ref(true)

settingsFunctions.getBookmarkedStations().then(response => {
  response.forEach(stationId => {
    const stationData = stationsJson.features.filter(d => d.properties.id == stationId)
    bookmarkedStations.value.push({id: stationId, name: stationData[0].properties.name, abbreviation: stationData[0].properties.abbreviation})
  });
})

getSuggestedIds(STATION_SEARCH_HISTORY_KEY ).then(response => {
  suggestionsLoading.value = false
  response.forEach(stationId => {
    const stationData = stationsJson.features.filter(d => d.properties.id == stationId)
    suggestedStations.value.push({id: stationId, name: stationData[0].properties.name, abbreviation: stationData[0].properties.abbreviation})
  });
})
</script>
