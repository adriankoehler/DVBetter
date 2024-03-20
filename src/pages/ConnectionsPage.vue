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
      <p v-if="bookmarkedConnections.length < 1" class="text-grey-6">(none)</p>

      <template v-if="suggestionsEnabled">
        <h2>Suggestions</h2>
        <q-skeleton v-show="suggestionsLoading" height="53px" />
        <list-entry
          v-for="entry in suggestedConnections"
          :name="entry.stations[0].name"
          :name2="entry.stations[1].name"
          :abbreviation="entry.stations[0].abbreviation"
          :abbreviation2="entry.stations[1].abbreviation"
          :stationId="entry.stations[0].id"
          :stationId2="entry.stations[1].id"
          :key="entry.connectionId"
        />
        <p v-if="suggestedConnections.length < 1 && !suggestionsLoading" class="text-grey-6">(none)</p>
      </template>
    </div>

    <search-area type="connections" />
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import SearchArea from 'components/SearchArea.vue'
import ListEntry from 'components/ListEntry.vue'

import {miscFunctions, settingsFunctions} from 'stores/helperFunctions.js'
import stationsJson from 'assets/stations_dresden.json'
import { getSuggestedIds, CONNECTION_SEARCH_HISTORY_KEY } from 'src/stores/search-history.js'
import {Preferences} from "@capacitor/preferences";

const bookmarkedConnections = ref([])
const suggestedConnections = ref([])
const suggestionsEnabled = ref(false)
const suggestionsLoading = ref(true)

settingsFunctions.getBookmarkedConnections().then(async response => {
  // TODOLATER clean up this mess (+what if no station match)
  for (const connectionId of response) {
    const regex = /(\d{8}|(?:streetID:.*)|(?:poiID:.*)|(?:coord:.*))-(\d{8}|(?:streetID:.*)|(?:poiID:.*)|(?:coord:.*))/
    const stationMatches = connectionId.match(regex)

    const stationData1 = await miscFunctions.getPointInfo(stationMatches[1])
    const stationData2 = await miscFunctions.getPointInfo(stationMatches[2])
    bookmarkedConnections.value.push({
      connectionId: connectionId, stations: [
        {id: stationData1[0], name: stationData1[1], abbreviation: stationData1[2]},
        {id: stationData2[0], name: stationData2[1], abbreviation: stationData2[2]}
      ]
    })
  }
})

Preferences.get({ key: 'suggestions' }).then(startscreenResponse => {
  if(JSON.parse(startscreenResponse.value)){
    suggestionsEnabled.value = true;
    getSuggestedIds(CONNECTION_SEARCH_HISTORY_KEY).then(response => {
      suggestionsLoading.value = false

      response.forEach(connectionId => {
        // TODO should also include street/point ids now that connections support it
        const stationMatches = connectionId.match(/^(\d{8})-(\d{8})$/)
        if (stationMatches && stationMatches.length > 2) {
          const stationData1 = stationsJson.features.filter(d => d.properties.id === stationMatches[1])
          const stationData2 = stationsJson.features.filter(d => d.properties.id === stationMatches[2])
          suggestedConnections.value.push({connectionId: connectionId, stations: [
              {id: stationData1[0].properties.id, name: stationData1[0].properties.name, abbreviation: stationData1[0].properties.abbreviation},
              {id: stationData2[0].properties.id, name: stationData2[0].properties.name, abbreviation: stationData2[0].properties.abbreviation}
            ]})
        }
      })
    })
  }
})
</script>
