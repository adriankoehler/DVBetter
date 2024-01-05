<template>
  <div class="search-field self-end">
    <q-input dense filled color="grey-10" bg-color="grey-2" label="Search for station" v-model="searchText">
      <template v-slot:append>
        <q-btn flat round color="primary" icon="my_location" @click="console.log('get location')"/>
      </template>
    </q-input>
    <q-input v-if="type=='connections'" dense filled color="grey-10" bg-color="grey-2" label="Search for station" v-model="searchText2"></q-input>

    <q-btn v-if="type=='departures'" color="primary" label="Find departures" no-caps/>
    <q-btn v-else color="primary" label="Find departures" no-caps/>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps(['type'])
const searchText = ref("")
const searchText2 = ref("")
</script>

<style lang="scss">
.search-field {
  padding: $main-content-padding;
  width: 100%;

  background-color: $dark;

  & > *:not(:last-child) {
    margin-bottom: 1.5em;
  }

  button {
    width: 100%;
  }
}
</style>
