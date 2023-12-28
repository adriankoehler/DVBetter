<template>
  <q-page>
    <div class="content-wrapper list hide-scrollbar">
      <h2>Bookmarks</h2>
      <list-entry
        v-for="entry in ['Hauptbahnhof', 'Spenerstraße', 'Burgkstraße']"
        :name="entry"
        stationId="33000028"
        :key="entry"
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
import SearchField from 'components/SearchField.vue'
import ListEntry from 'components/ListEntry.vue'
</script>

<style lang="scss">
.list {
  overflow-y: auto; //the search field should take all the place it needs, while the list overflows if needed
}
</style>
