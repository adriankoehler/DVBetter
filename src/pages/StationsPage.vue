<template>
  <q-page>
    <h4>Stations</h4>
    <p v-if="stationId">Selected station: {{ stationId }}</p>
  </q-page>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute()
const stationId = route.params.stationId;
</script>
