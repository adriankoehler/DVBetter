<template>
  <q-expansion-item header-class="departure-entry-header" expand-icon-class="expand-departure-icon">
    <template v-slot:header>
      <!-- icons for mode of transportation possible : directions_bus,tram,train -->
      <q-item-section avatar> {{ line }}              </q-item-section>
      <q-item-section>        {{ direction }}         </q-item-section>
      <q-item-section side>   {{ arrivalTimeString }} </q-item-section>
    </template>

    <q-card class="q-px-std q-py-sm departure-entry-content">
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
.departure-entry-header {
  padding-left: $main-content-padding;
  padding-right: $main-content-padding;

  .q-focus-helper {
    display: none; //interferes with custom hover effect
  }
  &:hover {
    background-color: $primary-10;
    transition: background-color 0.4s ease-in-out;
  }

  .q-item__section--avatar {
    font-weight: bold;
    width: 45px;
  }

  .q-item__section--side {
    color: inherit;
  }

  .expand-departure-icon {
    color: $secondary;
  }
}

.q-expansion-item--expanded {
  .departure-entry-header {
    background: $primary-10;
    // background: #DDA85633;
    color: $primary;
    font-weight: bold;
  }

  .departure-entry-content {
    background-color: $primary-05;
  }
}
</style>
