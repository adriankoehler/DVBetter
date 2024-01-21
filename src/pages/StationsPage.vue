<template>
  <q-page>
    <div class="content-wrapper hide-scrollbar">
      <h2>Bookmarks</h2>
      <list-entry
        v-for="entry in bookmarkedStations"
        :name="entry.name + ' (' + entry.abbreviation + ')'"
        :stationId="entry.id"
        :key="entry.id"
      />

      <h2>Suggestions</h2>
      <list-entry
        v-for="entry in ['Hauptbahnhof', 'Spenerstraße', 'Burgkstraße', 'Pennricher Straße', 'Carolaplatz']"
        :name="entry"
        stationId="33000028"
        :key="entry"
      />
    </div>

    <search-field type="departures" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import SearchField from 'components/SearchField.vue'
import ListEntry from 'components/ListEntry.vue'
import { settingsFunctions } from 'stores/helperFunctions.js'
import stationsJson from 'assets/stations_dresden.json'

let bookmarkedStations = ref([])

settingsFunctions.getBookmarkedStations().then(response => {
  response.forEach(stationId => {
    const stationData = stationsJson.features.filter(d => d.properties.id == stationId)
    bookmarkedStations.value.push({id: stationId, name: stationData[0].properties.name, abbreviation: stationData[0].properties.abbreviation})
  });
})
</script>
