<template>
  <q-expansion-item header-class="departure-entry" expand-icon-class="expand-departure-icon">
    <template v-slot:header>
      <!-- icons for mode of transportation possible : directions_bus,tram,train -->
      <q-item-section avatar> {{ line }}              </q-item-section>
      <q-item-section>        {{ direction }}         </q-item-section>
      <q-item-section side>   {{ arrivalTimeString }} </q-item-section>
    </template>

    <q-card class="q-px-std">
      (some additional info)
    </q-card>
  </q-expansion-item>
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

// since the Realtime date is not always available, get the scheduled time if necessary
const arrivalTimeString = dateFunctions.getArrivalTimeString(arrivalDateReal ? arrivalDateReal : arrivalDateScheduled)
</script>

<style lang="scss">
.departure-entry {
  padding-left: $main-content-padding;
  padding-right: $main-content-padding;

  .q-item__section--avatar {
    font-weight: bold;
  }

  .q-item__section--side {
    color: inherit;
  }

  .expand-departure-icon {
    color: $secondary;
  }

  // TODO
  &.selected {
    background: #DDA856;
    color: white;
    // wenn ausgeklappt noch opacity dazu
  }
}
</style>
