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
import { ref, onMounted } from 'vue';
import "leaflet/dist/leaflet.css";
import * as L from 'leaflet';

// TODO dark background/white icons+text?, add icons

const initialMap = ref(null);
const mapOptions = { zoomControl: false, zoom:1, zoomAnimation:false, fadeAnimation:true, markerZoomAnimation:true }
const initialCenter = [51.05090121, 13.73357] // Postplatz

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
    console.log(initialMap.value.invalidateSize())
}

onMounted(()=> {
    initialMap.value = L.map('map', mapOptions).setView(initialCenter, 17);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(initialMap.value);

    // L.marker([24.3746, 88.6004], {icon: myIcon}).addTo(initialMap.value);
});


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
