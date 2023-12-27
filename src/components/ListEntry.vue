<template>
  <div class="entry bg-grey-3 q-pa-md rounded-borders cursor-pointer row" @click="$router.push('/stations/' + props.stationId)">
    <span class="col-grow">{{ props.name }}</span>
    <q-icon class="self-center" name="arrow_forward" />
  </div>
</template>

<script setup>
const props = defineProps(['name', 'stationId'])
</script>

<style lang="scss">
.entry {
  margin-bottom: 0.6rem;
  width: 100%;
}
</style>
