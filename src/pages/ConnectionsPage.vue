<template>
  <q-page>
    <div class="list hide-scrollbar">
      <h2>Bookmarks</h2>
      <list-entry
        v-for="entry in [['Hauptbahnhof', 'Theaterplatz'], ['Spenerstraße', 'Burgkstraße']]"
        :name="entry[0]"
        :name2="entry[1]"
        stationId="33000028"
        stationId2="33000020"
        :key="entry"
      />

      <h2>Suggestions</h2>
      <p class="text-grey-6">(none)</p>
    </div>

    <search-field type="connections" />
  </q-page>
</template>

<script setup>
import SearchField from 'src/components/SearchField.vue'
import ListEntry from 'components/ListEntry.vue'
</script>
