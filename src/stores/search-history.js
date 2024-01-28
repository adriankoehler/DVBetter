import { Preferences } from "@capacitor/preferences";
import { Geolocation } from "@capacitor/geolocation";

/**
 * @typedef {{
 *   day: number,
 *   hours: number,
 *   minutes: number,
 *   latitude?: number,
 *   longitude?: number,
 *   stationId: string,
 * }} SearchHistoryEntry
 */

const SEARCH_HISTORY_KEY = "searchHistory";

/**
 * @param {string} stationId
 */
export async function pushToSearchHistory(stationId) {
  const searchHistory = await loadSearchHistory();
  let currentPosition = undefined;
  try {
    currentPosition = await Geolocation.getCurrentPosition();
  } catch (error) {
    console.warn("Could not save geolocation to search history");
  }
  const now = new Date();
  searchHistory.push({
    day: now.getDay(),
    hours: now.getHours(),
    minutes: now.getMinutes(),
    latitude: currentPosition?.coords.latitude,
    longitude: currentPosition?.coords.longitude,
    stationId: stationId,
  });
  await saveSearchHistory(searchHistory);
}

/**
 * @returns {Promise<SearchHistoryEntry[]>}
 */
export async function loadSearchHistory() {
  const result = await Preferences.get({
    key: SEARCH_HISTORY_KEY,
  });
  if (!result.value) {
    return [];
  } else {
    return JSON.parse(result.value);
  }
}

/**
 * @param {SearchHistoryEntry[]} searchHistory
 */
export async function saveSearchHistory(searchHistory) {
  await Preferences.set({
    key: SEARCH_HISTORY_KEY,
    value: JSON.stringify(searchHistory),
  });
}

/**
 * @returns {Promise<string>}
 */
export async function getSuggestedStations() {
  const searchHistory = await loadSearchHistory();
  const now = new Date();
  const currentDay = now.getDay();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  let entriesNearMe = searchHistory;
  try {
    currentPosition = await Geolocation.getCurrentPosition();
    entriesNearMe = searchHistory.filter((entry) => {
      if (!entry.latitude || !entry.longitude) {
        return false;
      }
      const distance = Math.sqrt(
        Math.pow(entry.latitude - currentPosition.coords.latitude, 2) +
        Math.pow(entry.longitude - currentPosition.coords.longitude, 2)
      );
      return distance < 0.01;
    });
  } catch (error) {
    console.warn("Could not get GPS data, please enable GPS");
  }

  const entriesThreeDays = entriesNearMe.filter((entry) => {
    return (
      entry.day === currentDay - (1 % 7) ||
      entry.day === currentDay ||
      entry.day === (currentDay + 1) % 7
    );
  });

  const entriesToday = entriesThreeDays.filter((entry) => {
    return entry.day === currentDay;
  });

  const entriesThreeHours = entriesToday.filter((entry) => {
    return (
      entry.hours === (currentHours - 1) % 24 ||
      entry.hours === currentHours ||
      entry.hours === (currentHours + 1) % 24
    );
  });

  const entriesHalfHour = entriesThreeHours.filter((entry) => {
    return (
      entry.day === currentDay &&
      entry.hours === currentHours &&
      entry.minutes >= currentMinutes - 30 &&
      entry.minutes <= currentMinutes + 30
    );
  });

  let stationCounts = aggregateStationCounts(entriesHalfHour);
  let stationCountsEntries = Object.entries(stationCounts);
  if (stationCountsEntries.length > 0) {
    stationCountsEntries.sort((a, b) => b[1] - a[1]);
    return stationCountsEntries.map((entry) => entry[0]).slice(0, 5);
  }

  stationCounts = aggregateStationCounts(entriesThreeHours);
  stationCountsEntries = Object.entries(stationCounts);
  if (stationCountsEntries.length > 0) {
    stationCountsEntries.sort((a, b) => b[1] - a[1]);
    return stationCountsEntries.map((entry) => entry[0]).slice(0, 5);
  }

  stationCounts = aggregateStationCounts(entriesToday);
  stationCountsEntries = Object.entries(stationCounts);
  if (stationCountsEntries.length > 0) {
    stationCountsEntries.sort((a, b) => b[1] - a[1]);
    return stationCountsEntries.map((entry) => entry[0]).slice(0, 5);
  }

  stationCounts = aggregateStationCounts(entriesThreeDays);
  stationCountsEntries = Object.entries(stationCounts);
  if (stationCountsEntries.length > 0) {
    stationCountsEntries.sort((a, b) => b[1] - a[1]);
    return stationCountsEntries.map((entry) => entry[0]).slice(0, 5);
  }

  stationCounts = aggregateStationCounts(entriesNearMe);
  stationCountsEntries = Object.entries(stationCounts);
  if (stationCountsEntries.length > 0) {
    stationCountsEntries.sort((a, b) => b[1] - a[1]);
    return stationCountsEntries.map((entry) => entry[0]).slice(0, 5);
  }

  return [
    "33000037", // Postplatz
    "33000028", // Dresden Hauptbahnhof
    "33000032", // Dresden Hauptbahnhof Nord
    "33000016", // Dresden Neustadt
    "33000001", // Dresden Mitte
  ];
}

function aggregateStationCounts(entries) {
  /** @type {{[stationId: string]: number}} */
  const stationCounts = {};
  for (const entry of entries) {
    if (!stationCounts[entry.stationId]) {
      stationCounts[entry.stationId] = 0;
    }
    stationCounts[entry.stationId]++;
  }
  return stationCounts;
}
