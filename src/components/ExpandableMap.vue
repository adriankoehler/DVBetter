<template>
    <div class="map-wrapper self-end shadow-2">
        <q-expansion-item
            expand-separator
            icon="map"
            expand-icon="expand_less"
            expanded-icon="expand_more"
            @after-show="reloadMap()"
        >
            <div id='map'></div>
        </q-expansion-item>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import stationsJson from 'assets/stations_dresden.json'

const props = defineProps(['station'])

// dark background/white icons+text?, add icons

const initialMap = ref(null);
const mapOptions = { zoomControl: false, zoom:1, zoomAnimation:false, fadeAnimation:true, markerZoomAnimation:true }
const initialCenter = [51.05090121, 13.73357] // Postplatz

// TODO get the locations of all platforms for the station and set icons accordingly
// const myIcon = L.icon({
//     iconUrl: "iconadress",
//     iconSize: [30, 30],
//     iconAnchor: [22, 94],
//     popupAnchor: [-3, -76],
//     shadowUrl: "markerShadowadress",
//     shadowSize: [60, 30],
//     shadowAnchor: [22, 94]
// });

function reloadMap() {
    // map has to be reloaded when expanded, otherwise leaflet thinks its still small (doesn't load properly)
    initialMap.value.invalidateSize()
}

onMounted(()=> {
    initialMap.value = L.map('map', mapOptions).setView(initialCenter, 17);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(initialMap.value);

    // L.marker([24.3746, 88.6004], {icon: myIcon}).addTo(initialMap.value);
});

watch(()=> props.station, (newVal)=> {
    // since the station name is not immediately available (wait for API call in StationDetail component),
    // we have to watch for a props.station change and then update the map to show the station

    const stationData = stationsJson.features.filter(d => d.properties.name == newVal)
    if (stationData.length > 1) {
      console.log("multiple stations found for name, take first one", stationData[0])
    } else if (stationData.length < 1) {
      console.log("no geo data found for this station, map will only display default location")
      // TODO display grey overlay on map with error.. or get the geo data elsewhere (f.e. API pointfinder + convert GK4 coordinates)
      return
    }

    let lonCoordinate = stationData[0].geometry.coordinates[0]
    let latCoordinate = stationData[0].geometry.coordinates[1]

    const newCoordinates = [latCoordinate, lonCoordinate]
    initialMap.value.setView(newCoordinates)
})

</script>

<style lang="scss">
.map-wrapper {
    width: 100%;

    .q-item {
        padding: 0 $main-content-padding;
    }
}

#map {
    height: 60vh;
}
</style>
