<template>
  <div class="search-field self-end">
    <q-select
      dense
      filled
      color="grey-10"
      bg-color="grey-2"
      label="Search for station"
      v-model="searchText"
      :options="options"
      option-value="id"
      option-label="name"
      hide-selected
      fill-input
      use-input
      input-debounce="120"
      @filter="filterFn"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey"> No results </q-item-section>
        </q-item>
      </template>

      <!--      TODO: show name+abbreviation when stop is selected, delete selection when on new search (hide-selected+fill-input have to be removed) -->
      <!--      <template v-slot:selected-item="scope">-->
      <!--        {{ scope.opt.name }} ( {{ scope.opt.abbreviation }} )-->
      <!--      </template>-->

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section>
            <q-item-label>{{ scope.opt.name }}</q-item-label>
            <q-item-label caption>{{ scope.opt.abbreviation }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:append>
        <q-btn
          flat
          round
          color="primary"
          icon="my_location"
          @click="getPosition()"
        />
      </template>
    </q-select>

    <q-input
      v-if="type === 'connections'"
      dense
      filled
      color="grey-10"
      bg-color="grey-2"
      label="Search for station"
      v-model="searchText2"
    ></q-input>

    <q-btn
      v-if="type === 'departures'"
      @click="findDepartures"
      color="primary"
      label="Find departures"
      no-caps
    />
    <q-btn v-else color="primary" label="Find departures" no-caps />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { Geolocation } from "@capacitor/geolocation";
import { api } from "boot/axios";
import proj4 from "proj4";

const $q = useQuasar();
const router = useRouter();

const props = defineProps(["type"]);
const searchText = ref();
const searchText2 = ref();
const options = ref([]);

async function getPosition() {
  const coordinates = await Geolocation.getCurrentPosition();

  console.log("Current position:", coordinates);

  var firstProjection =
    'PROJCS["NAD83 / Massachusetts Mainland",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","6269"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4269"]],UNIT["metre",1,AUTHORITY["EPSG","9001"]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",42.68333333333333],PARAMETER["standard_parallel_2",41.71666666666667],PARAMETER["latitude_of_origin",41],PARAMETER["central_meridian",-71.5],PARAMETER["false_easting",200000],PARAMETER["false_northing",750000],AUTHORITY["EPSG","26986"],AXIS["X",EAST],AXIS["Y",NORTH]]';
  var secondProjection =
    "+proj=gnom +lat_0=90 +lon_0=0 +x_0=6300000 +y_0=6300000 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";

  let wgs84 = proj4(
    firstProjection,
    secondProjection,
    [-122.305887, 58.9465872]
  );
  console.log(wgs84);
}

function findDepartures() {
  router.push(`/stations/${searchText.value.id}`);
}

function filterFn(val, update, abort) {
  if (val.length < 3) {
    abort();
    return;
  }

  update(() => {
    options.value = []; //empty the previous search results
    const searchTerm = val.toLowerCase();

    api
      .post("tr/pointfinder", {
        query: searchTerm,
        limit: 10,
        stopsOnly: true,
        regionalOnly: true,
        stopShortcuts: true,
      })
      .then((response) => {
        if (response.data.Status.Code !== "Ok") {
          $q.notify({
            color: "negative",
            message: "An API error occurred",
            caption: response.data.Status.Message,
            icon: "report_problem",
          });
        } else {
          const foundPoints = response.data.Points;
          const regex = /(\d{8})\|.*\|.*\|(.*)\|.*\|.*\|.*\|.*\|([A-Z]{3,4})?/;
          foundPoints.forEach((point) => {
            const match = point.match(regex);
            if (match[1] && match[2]) {
              const stopId = match[1];
              const stopName = match[2];
              const stopAbbreviation = match[3];
              options.value.push({
                id: stopId,
                name: stopName,
                abbreviation: stopAbbreviation,
              });
            }
          });
        }
        //   loading.value = false
      })
      .catch((e) => {
        console.log("error for ", searchTerm, e);
        $q.notify({
          color: "negative",
          message: "An error occurred fetching data from the VVO API",
          icon: "report_problem",
        });
      });
  });
}
</script>

<style lang="scss">
.search-field {
  padding: $main-content-padding;
  width: 100%;

  background-color: $dark;

  & > *:not(:last-child) {
    margin-bottom: 1.5em;
  }

  button {
    width: 100%;
  }
}
</style>
