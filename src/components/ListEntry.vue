<template>
  <!-- station A -->
  <div v-if="!props.name2" class="entry bg-grey-3 q-py-md q-px-lg rounded-borders cursor-pointer row" @click="$router.push('/stations/' + props.stationId)">
    <div class="col-grow">
      <span v-if="props.abbreviation"><b>{{ props.abbreviation }}</b> | </span>
      <span>{{ props.name }}</span>
    </div>
    <q-icon class="self-center" name="arrow_forward" />
  </div>

  <!-- connection A→B -->
  <div v-else class="entry bg-grey-3 q-py-md q-px-lg rounded-borders cursor-pointer row" @click="$router.push('/connections/' + props.stationId + '-' + props.stationId2)">
    <!-- FIXME should not grow to avoid arrow not lining up -->
    <!-- TODO fix width to be calc 50%-some px icon width -->
    <span class="col-grow">
      <span v-if="props.abbreviation"><b>{{ props.abbreviation }}</b> | </span>
      <span>{{ props.name }}</span>
    </span>
    <q-icon class="self-center" name="arrow_forward" />
    <span class="col-grow text-right">
      <span v-if="props.abbreviation2"><b>{{ props.abbreviation2 }}</b> | </span>
      <span>{{ props.name2 }}</span>
    </span>
  </div>
</template>

<script setup>
const props = defineProps(['name', 'stationId', 'name2', 'stationId2', 'abbreviation', 'abbreviation2'])
</script>

<style lang="scss">
.entry {
  margin-bottom: 0.6rem;
  width: 100%;
}
</style>
