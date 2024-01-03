<template>
  <div class="row q-py-sm">
    <!-- possible icons: directions_bus,tram,train -->
    <!-- <span class="col-1"><q-icon class="self-center" name="tram" /></span> -->

    <span class="col-2"><b>{{ line }}</b></span>
    <span class="col-7">{{ direction }}</span>
    <!-- TODO could be expansion item with additional information (delays, reroutes, free seats)-->
    <span class="col-3 text-right">{{ arrivalTimeString }}</span>
  </div>
</template>

<script setup>
const props = defineProps(['departure'])
import { dateFunctions } from 'stores/helperFunctions.js'

// (todo) could be possible to periodically update the table with out manually triggering it
// with props.departure.Id + props.departure.ScheduledTime

const line = props.departure.LineName
const direction = props.departure.Direction
const arrivalDateScheduled = dateFunctions.convertVVOToDate(props.departure.ScheduledTime)
const arrivalDateReal = dateFunctions.convertVVOToDate(props.departure.RealTime)
// console.log(arrivalDateScheduled, arrivalDateReal)

// since the Realtime date is not always available, get the scheduled time if necessary
const arrivalTimeString = dateFunctions.getArrivalTimeString(arrivalDateReal ? arrivalDateReal : arrivalDateScheduled)
</script>

<style lang="scss">
.entry {
  margin-bottom: 0.6rem;
  width: 100%;
}
</style>
