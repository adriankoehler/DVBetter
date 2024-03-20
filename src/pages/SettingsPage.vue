<template>
  <q-page>
    <div class="content-wrapper">
      <h2>Settings</h2>
      <p>Start page when you open the app (default: stations)</p>
      <q-btn-toggle
        v-model="startPageModel"
        @update:model-value="setStartpage()"
        toggle-color="primary"
        :options="[
          {label: 'Stations', value: 'stations'},
          {label: 'Connections', value: 'connections'},
        ]"
      />
      <br>
      <br>
      <p>Enable/Disable suggestions</p>
      <q-btn-toggle
        v-model="suggestionsToggle"
        @update:model-value="toggleSuggestions()"
        toggle-color="primary"
        :options="[
          {label: 'On', value: true},
          {label: 'Off', value: false},
        ]"
      />
      <!-- TODO walking speed -->
<!--      <q-btn @click="getStartpage">get</q-btn>-->
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { Preferences } from '@capacitor/preferences';
// import { setCssVar } from 'quasar'

// TODOLATER add themes
// setCssVar('light', '#DDD')

const startPageModel = ref("stations")
const suggestionsToggle = ref(true)
getStartpage().then((response) => startPageModel.value = response)
getSuggestions().then((response) => suggestionsToggle.value = response)

async function setStartpage() {
  await Preferences.set({
    key: 'startScreen',
    value: startPageModel.value
  })
}

async function getStartpage() {
  const startPage = await Preferences.get({ key: 'startScreen' })
  return startPage.value
}

async function toggleSuggestions() {
  await Preferences.set({
    key: 'suggestions',
    value: JSON.stringify(suggestionsToggle.value)
  })
}

async function getSuggestions() {
  const suggestions = await Preferences.get({ key: 'suggestions' })
  return JSON.parse(suggestions.value)
}
</script>
