<template>
  <div class="row q-py-sm">
    <!-- possible icons: directions_bus,tram,train -->
    <!-- <span class="col-1"><q-icon class="self-center" name="tram" /></span> -->

    <span class="col-1"><b>{{ line }}</b></span>
    <span class="col-8">{{ direction }}</span>
    <span class="col-3 text-right">{{ arrivalTimeString }}</span>
  </div>
</template>

<script setup>
const props = defineProps(['departure'])

const line = props.departure.LineName
const direction = props.departure.Direction
const arrivalDate = convertVVOToDate(props.departure.ScheduledTime)
const arrivalTimeString = getArrivalTimeString(arrivalDate)

// somewhat hacky way of deciphering the date string returned in the VVO API via regex capture groups and turn it into a date object
function convertVVOToDate(VVOTimestamp) {
  const regexp = /\/Date\((\d+)([+-]\d+)\)\//g
  const matches = [...VVOTimestamp.matchAll(regexp)]

  let unixTimestamp = parseInt(matches[0][1]) // first match is raw unix timestamp
  if (matches[0][2] == "+0100") {             // second match is summertime modifier (3600s=1h)
    unixTimestamp += 3600000
  }

  const arrivalDate = new Date(unixTimestamp);
  return arrivalDate
}

// returns the hours/minutes until the tram arrives as a string (f.e. "1h 5min")
function getArrivalTimeString (arrivalDate) {
  let diff = arrivalDate.getTime() - Date.now()
  let mm = Math.floor(diff / 1000 / 60) % 60;
  let hh = Math.floor(diff / 1000 / 60 / 60);

  if (hh == 0) {
    return mm + "min"
  } else {
    return hh + "h " + mm + "min"
  }
}
</script>

<style lang="scss">
.entry {
  margin-bottom: 0.6rem;
  width: 100%;
}
</style>
