<template>
  <q-page>
    <div class="content-wrapper">
      <h2>Settings</h2>
      <q-btn @click="setObject">set</q-btn>
      <q-btn @click="getObject">get</q-btn>
    </div>
  </q-page>
</template>

<script setup>
import { Preferences } from "@capacitor/preferences";

async function setObject() {
  await Preferences.set({
    key: "user",
    value: JSON.stringify({
      id: 1,
      name: "Joseph",
    }),
  });
}

async function getObject() {
  const ret = await Preferences.get({ key: "user" });
  const user = JSON.parse(ret.value);
  console.log(user);
}
</script>
