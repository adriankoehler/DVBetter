<template>
  <q-expansion-item
    v-if="!alreadyLeft"
    header-class="departure-entry-header"
    expand-icon-class="expand-departure-icon"
  >

    <template v-slot:header>
      <q-item-section avatar> {{ line }}              </q-item-section>
      <q-item-section>
        <span>{{ direction }}
          <q-icon v-if="cancelled" class="on-right" name="cancel" size="xs"/>
          <q-icon v-else-if="rerouted" class="on-right rotate-90" name="turn_sharp_left" size="xs"/>
        </span>
      </q-item-section>
      <q-item-section side>   {{ arrivalTimeString }} </q-item-section>
    </template>

    <q-item class="q-px-std q-py-sm departure-entry-content text-caption">
      <q-item-section avatar>
        <q-icon v-if="mot === 'Tram'" name="tram" size="xs"/>
        <q-icon v-if="mot === 'CityBus' || mot ==='Bus'" name="directions_bus" size="xs"/>
        <q-icon v-if="mot === 'IntercityBus' || mot === 'PlusBus'" name="directions_bus_filled" size="xs"/>
        <q-icon v-if="mot === 'SuburbanRailway'" name="directions_railway" size="xs"/>
        <q-icon v-if="mot === 'Train'" name="directions_railway_filled" size="xs"/>
      </q-item-section>
      <q-item-section>
        <span>{{ platform.Type }} {{ platform.Name }}</span>
         <span v-if="occupancy && occupancy !== 'Unknown'">Occupancy {{ occupancy === "ManySeats" ? "low" : "high"}}</span>
      </q-item-section>
    </q-item>

  </q-expansion-item>
</template>

<script setup>
const props = defineProps(['departure'])
import { dateFunctions } from 'stores/helperFunctions.js'

const line = props.departure.LineName
const direction = props.departure.Direction
const mot = props.departure.Mot //Tram, CityBus, IntercityBus, SuburbanRailway, Train, PlusBus, ("Undefined")
const delayed = props.departure.State === "Delayed" //daran vlt uhrzeitberechnung +- TODO
const rerouted = props.departure.RouteChanges.length != 0
const cancelled = props.departure.CancelReasons.length != 0
const occupancy = props.departure.Occupancy //icons: person, people, groups ("ManySeats, StandingOnly, Unknown")
const platform = props.departure.Platform ?? "" // "Platform" attribute can sometimes be missing
const arrivalDateScheduled = dateFunctions.convertVVOToDate(props.departure.ScheduledTime)
const arrivalDateReal = dateFunctions.convertVVOToDate(props.departure.RealTime)

// since the Realtime date is not always available, get the scheduled time if necessary
const arrivalTimeString = dateFunctions.getArrivalTimeString(arrivalDateReal ? arrivalDateReal : arrivalDateScheduled)
const alreadyLeft = arrivalDateReal ? arrivalDateReal < Date.now() : arrivalDateScheduled < Date.now()

// TODO if cancelled/rerouted=true -> fetch all route changes and get the reason
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
    color: $primary-dark;
    font-size: 0.8rem;
  }
}
</style>
