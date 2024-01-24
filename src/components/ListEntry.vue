<template>
  <!-- station A -->
  <div
    v-if="!props.name2"
    class="entry bg-grey-3 q-py-md q-px-lg rounded-borders cursor-pointer row"
    @click="$router.push('/stations/' + props.stationId)"
  >
    <div class="col-grow">
      <span v-if="props.abbreviation"
        ><b>{{ props.abbreviation }}</b> |
      </span>
      <span>{{ props.name }}</span>
    </div>
    <q-icon class="self-center" name="arrow_forward" />
  </div>

  <!-- connection A→B -->
  <div
    v-else
    class="entry bg-grey-3 q-py-md q-px-lg rounded-borders cursor-pointer row"
    @click="
      $router.push('/connections/' + props.stationId + '-' + props.stationId2)
    "
  >
    <span class="col-grow">{{ props.name }}</span>
    <q-icon class="self-center" name="arrow_forward" />
    <span class="col-grow text-right">{{ props.name2 }}</span>
  </div>
</template>

<script setup>
const props = defineProps([
  "name",
  "stationId",
  "name2",
  "stationId2",
  "abbreviation",
]);
</script>

<style lang="scss">
.entry {
  margin-bottom: 0.6rem;
  width: 100%;
}
</style>
