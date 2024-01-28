<template>
  <q-expansion-item
    header-class="connection-entry-header"
    expand-icon-class="expand-departure-icon"
    hide-expand-icon
  >
    <!--  quick overview of connection  -->
    <template v-slot:header>
      <q-item-section avatar>
        <span class="text-weight-bold">from {{ startTime }} </span>
        <span v-if="interchanges === 0"> no interchange</span>
        <span v-else-if="interchanges === 1"> 1 interchange</span>
        <span v-else-if="interchanges > 1"> {{ interchanges }} interchanges</span>
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
        <span class="text-weight-bold">arrives {{ arrivalTime }} </span><br>
        <span>{{ duration }}</span>
      </q-item-section>
    </template>

    <q-item class="q-px-std q-py-sm connection-entry-content text-caption">
      <!--  detailed view of connection  -->
      <q-timeline color="secondary" class="sub-connections">
        <q-timeline-entry
          v-for="partialRoute in partialRoutes"
          :key="partialRoute.Id"
        >
          <template v-slot:subtitle>
<!--            Name(/Ort) von Startpunkt oder Zwischenstation oder Endstation-->
            {{partialRoute.StationOrPlace}}
          </template>
          <template v-slot:title>
<!--            Zusatzinfo (Steig usw.)-->
            {{partialRoute.MotDetails}}
          </template>
          <div class="subconnection-details">
            {{partialRoute.Mot}}
<!--            zu nehmende Linie (dazu vlt noch zusatzinfo?) oder Fußweg (TODO mit Zeit)-->
          </div>
        </q-timeline-entry>
      </q-timeline>
    </q-item>

  </q-expansion-item>
</template>

<script setup>
import {ref} from "vue";

const props = defineProps(['connection'])
import { dateFunctions } from 'stores/helperFunctions.js'

const connection = props.connection


const firstStop = connection.PartialRoutes[0].RegularStops[0]
const startTimeRaw = firstStop.ArrivalRealTime ? firstStop.ArrivalRealTime : firstStop.ArrivalTime
const startTime = ref(dateFunctions.getTimeFormatted(dateFunctions.convertVVOToDate(startTimeRaw)))

const lastStop = connection.PartialRoutes[connection.PartialRoutes.length-1].RegularStops[connection.PartialRoutes[connection.PartialRoutes.length-1].RegularStops.length-1]
const arrivalTimeRaw = lastStop.ArrivalRealTime ? lastStop.ArrivalRealTime : lastStop.ArrivalTime
const arrivalTime = ref(dateFunctions.getTimeFormatted(dateFunctions.convertVVOToDate(arrivalTimeRaw)))

const duration = ref(connection.Duration + " min")
const interchanges = ref(connection.Interchanges)

let motChainIcons = connection.MotChain.map((mot) => {
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


// ----- trip details (sub-connections/partial routes) -------
// add startpoint and sub-connections of trip
let maxPartialRouteId = 0
const partialRoutes = ref([])
for (let i = 0; i < connection.PartialRoutes.length; i++) {
  // exclude MobilityStairsDown and StayForConnection from connection details
  if(connection.PartialRoutes[i].Mot.Type === "MobilityStairsDown" || connection.PartialRoutes[i].Mot.Type === "StayForConnection"){
    break
  }

  const stationOrPlace = connection.PartialRoutes[i].RegularStops ? connection.PartialRoutes[i].RegularStops[0].Name : connection.PartialRoutes[i-1].RegularStops[connection.PartialRoutes[i-1].RegularStops.length-1].Name
  const mot = connection.PartialRoutes[i].Mot.Type === "Footpath" ? "Footpath" : (connection.PartialRoutes[i].Mot.Name + " " + connection.PartialRoutes[i].Mot.Direction)

  // if a station arrival is followed by a footpath, also get the platform the user arrived on
  let motDetails
  if (connection.PartialRoutes[i].Mot.Type === "Footpath" && connection.PartialRoutes[i-1] !== undefined && "RegularStops" in connection.PartialRoutes[i-1]){
    const platformDetails = connection.PartialRoutes[i-1].RegularStops[connection.PartialRoutes[i-1].RegularStops.length-1].Platform
    motDetails = platformDetails.Type + " " + platformDetails.Name
  } else {
    motDetails = connection.PartialRoutes[i].Mot.Type === "Footpath" ? "" : (connection.PartialRoutes[i].RegularStops[0].Platform.Type + " " + connection.PartialRoutes[i].RegularStops[0].Platform.Name)
  }
  const motIcon = connection.PartialRoutes[i].Mot.Type === "Footpath" ? "" : "tram" // TODO function to return mot->matching icon

  maxPartialRouteId = connection.PartialRoutes[i].PartialRouteId ?? 0
  partialRoutes.value.push({"Id": connection.PartialRoutes[i].PartialRouteId, "Duration": connection.PartialRoutes[i].Duration, "StationOrPlace": stationOrPlace, "Mot": mot, "MotDetails": motDetails, "MotIcon": motIcon})
}

// add endpoint of trip
const lastPartialRoute = connection.PartialRoutes[connection.PartialRoutes.length-1]
const stationOrPlace = lastPartialRoute.RegularStops ? lastPartialRoute.RegularStops[lastPartialRoute.RegularStops.length-1].Name : "Footpath asd"
const motIcon = lastPartialRoute.Mot.Type === "Footpath" ? false : "tram" // TODO function to return mot->matching icon + actually add icon
partialRoutes.value.push({"Id": maxPartialRouteId+1, "Duration": lastPartialRoute.Duration, "StationOrPlace": stationOrPlace, "Mot": "", "MotDetails": "", "MotIcon": motIcon})

// TODOLATER if cancelled/rerouted=true -> fetch all route changes and get the reason
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
    width: 109px; // fix left side width so centered text is the same for every entry
  }

  .q-item__section--main {
    text-align: center;
    color: #7a7a7a;

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
    color: $primary;
    //font-weight: bold;
  }

  .connection-entry-content {
    background-color: $primary-05;
    color: $primary-dark;
    font-size: 0.8rem;
  }
}

.q-timeline.sub-connections {
  .q-timeline__subtitle {
    // startpunkt/haltestelle
    font-size: 1.05em;
    //font-weight: normal;

    opacity: 1;
    text-transform: initial;
    letter-spacing: initial;
    margin-bottom: 2px;
  }

  .q-timeline__content {
    padding-bottom: 16px;

    // steig für haltestelle
    .q-timeline__title {
      font-size: 1em;
      line-height: 1em;
      //font-weight: normal;
      opacity: 0.6;
    }

    // verbindung
    .subconnection-details {

    }
  }
}
</style>
