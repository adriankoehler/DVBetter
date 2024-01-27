<template>
  <q-expansion-item
    header-class="connection-entry-header"
    expand-icon-class="expand-departure-icon"
    hide-expand-icon
  >
    <template v-slot:header>
      <q-item-section avatar>
        <span class="text-weight-bold">ab {{ startTime }} </span>
        <span v-if="interchanges === 0"> kein Umstieg</span>
        <span v-else-if="interchanges === 1"> 1 Umstieg</span>
        <span v-else-if="interchanges > 1"> {{ interchanges }} Umstiege</span>
      </q-item-section>
      <q-item-section class="mot-icons">
        <q-icon
          v-for="mot in motChainIcons"
          size="xs"
          :key="mot"
          :name="mot"
        />
      </q-item-section>
      <q-item-section side>
        <span class="text-weight-bold">an {{ arrivalTime }} </span><br>
        <span>{{ duration }}</span>
      </q-item-section>
    </template>

    <q-item class="q-px-std q-py-sm connection-entry-content text-caption">
      <!--  detailed view of connection  -->
    </q-item>

  </q-expansion-item>
</template>

<script setup>
import {ref} from "vue";

const props = defineProps(['connection'])
import { dateFunctions } from 'stores/helperFunctions.js'

// console.log(props.connection)

const firstStop = props.connection.PartialRoutes[0].RegularStops[0]
const startTimeRaw = firstStop.ArrivalRealTime ? firstStop.ArrivalRealTime : firstStop.ArrivalTime
const startTime = ref(dateFunctions.getTimeFormatted(dateFunctions.convertVVOToDate(startTimeRaw)))

const lastStop = props.connection.PartialRoutes[props.connection.PartialRoutes.length-1].RegularStops[props.connection.PartialRoutes[props.connection.PartialRoutes.length-1].RegularStops.length-1]
const arrivalTimeRaw = lastStop.ArrivalRealTime ? lastStop.ArrivalRealTime : lastStop.ArrivalTime
const arrivalTime = ref(dateFunctions.getTimeFormatted(dateFunctions.convertVVOToDate(arrivalTimeRaw)))

const duration = ref(props.connection.Duration + " min")
const interchanges = ref(props.connection.Interchanges)

let motChainIcons = props.connection.MotChain.map((mot) => {
  if (mot.Type === "Footpath") {
    return "directions_walk"
  } else if (mot.Type === "Tram") {
    return "tram"
  } else if (mot.Type === "CityBus" || mot.Type === "Bus") {
    return "directions_bus"
  } else if (mot.Type === "IntercityBus" || mot.Type === "PlusBus") {
    return "directions_bus_filled"
  } else if (mot.Type === "SuburbanRailway") {
    return "directions_railway"
  } else if (mot.Type === "Train") {
    return "directions_railway_filled"
  }
  return "help_center" // unknown mot
})
// insert a spacer icon between each element
motChainIcons = [].concat(...motChainIcons.map(n => [n, "horizontal_rule"])).slice(0, -1)
// TODO add detailed connection view

// TODO if cancelled/rerouted=true -> fetch all route changes and get the reason
</script>

<style lang="scss">
.connection-entry-header {
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
    width: 100px; // fix left side width so centered text is the same for every entry
  }

  .q-item__section--main {
    text-align: center;

    &.mot-icons {
      flex-direction: row;
    }
  }

  .q-item__section--side {
    color: inherit;
  }

  .expand-departure-icon {
    color: $secondary;
  }
}

.q-expansion-item--expanded {
  .connection-entry-header {
    background: $primary-10;
    // background: #DDA85633;
    color: $primary;
    font-weight: bold;
  }

  .connection-entry-content {
    background-color: $primary-05;
    color: $primary-dark;
    font-size: 0.8rem;
  }
}
</style>
