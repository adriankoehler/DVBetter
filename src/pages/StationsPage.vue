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
      <p v-if="bookmarkedStations.length < 1" class="text-grey-6">(none)</p>

      <template v-if="suggestionsEnabled">
        <h2>Suggestions</h2>
        <q-skeleton v-show="suggestionsLoading" height="53px" />
        <list-entry
          v-for="entry in suggestedStations"
          :name="entry.name"
          :abbreviation="entry.abbreviation"
          :stationId="entry.id"
          :key="entry.id"
        />
        <p v-if="suggestedStations.length < 1 && !suggestionsLoading" class="text-grey-6">(none)</p>
      </template>
    </div>

    <search-area type="departures" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { settingsFunctions } from 'stores/helperFunctions.js'
import { getSuggestedIds, STATION_SEARCH_HISTORY_KEY } from 'src/stores/search-history.js'
import SearchArea from 'components/SearchArea.vue'
import ListEntry from 'components/ListEntry.vue'
import stationsJson from 'assets/stations_dresden.json'
import {Preferences} from "@capacitor/preferences";

const bookmarkedStations = ref([])
const suggestedStations = ref([])
const suggestionsEnabled = ref(false)
const suggestionsLoading = ref(true)

settingsFunctions.getBookmarkedStations().then(response => {
  response.forEach(stationId => {
    const stationData = stationsJson.features.filter(d => d.properties.id == stationId)
    bookmarkedStations.value.push({id: stationId, name: stationData[0].properties.name, abbreviation: stationData[0].properties.abbreviation})
  });
})

Preferences.get({ key: 'suggestions' }).then(startscreenResponse => {
  if(JSON.parse(startscreenResponse.value)){
    getSuggestedIds(STATION_SEARCH_HISTORY_KEY ).then(response => {
      suggestionsLoading.value = false
      response.forEach(stationId => {
        const stationData = stationsJson.features.filter(d => d.properties.id == stationId)
        if (stationData && stationData.length > 0) {
          suggestedStations.value.push({id: stationId, name: stationData[0].properties.name, abbreviation: stationData[0].properties.abbreviation})
        }
      });
    })
  }
})
</script>
