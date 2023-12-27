<template>
  <div class="search-field">
    <q-input dense filled color="grey-10" bg-color="grey-2" label="Search for station" v-model="searchText">
      <template v-slot:append>
        <q-btn flat round color="primary" icon="my_location" @click="console.log('get location')"/>
      </template>
    </q-input>

    <q-btn color="primary" label="Find departures" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const searchText = ref("")
</script>

<style lang="scss">
.search-field {
  padding: 2em;
  width: 100%;

  // stick to the bottom
  position: relative;
  left: 0;
  bottom: 0;

  background-color: $dark;

  & > *:not(:last-child) {
    margin-bottom: 1.5em;
  }

  button {
    width: 100%;
  }
}
</style>
