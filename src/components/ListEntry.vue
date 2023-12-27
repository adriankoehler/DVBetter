<template>
  <q-card flat class="entry bg-grey-3">
    <q-card-section>
      {{ props.name }}
    </q-card-section>
  </q-card>
</template>

<script setup>
const props = defineProps(['name'])
</script>

<style lang="scss">
.entry {
  margin-bottom: 0.6rem;
  width: 100%;
}
</style>
