<template>
  <q-card flat class="entry bg-grey-3" @click="$router.push('/stations/' + props.stationId)">
    <q-card-section>
      {{ props.name }}
    </q-card-section>
  </q-card>
</template>

<script setup>
const props = defineProps(['name', 'stationId'])
</script>

<style lang="scss">
.entry {
  margin-bottom: 0.6rem;
  width: 100%;
  cursor: pointer;
}
</style>
