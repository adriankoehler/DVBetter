import { Preferences } from "@capacitor/preferences";
import { Geolocation } from "@capacitor/geolocation";

/**
 * @typedef {{
 *   day: number,
 *   hours: number,
 *   minutes: number,
 *   latitude?: number,
 *   longitude?: number,
 *   id: string,
 * }} SearchHistoryEntry
 */

export const STATION_SEARCH_HISTORY_KEY = "stationSearchHistory";
export const CONNECTION_SEARCH_HISTORY_KEY = "connectionSearchHistory";

/**
 * @param {string} key
 * @param {string} id
 */
export async function pushToSearchHistory(key, id) {
  const searchHistory = await loadSearchHistory(key);
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
    id,
  });
  await saveSearchHistory(key, searchHistory);
}

/**
 * @param {string} key
 * @returns {Promise<SearchHistoryEntry[]>}
 */
export async function loadSearchHistory(key) {
  const result = await Preferences.get({ key });
  if (!result.value) {
    return [];
  } else {
    return JSON.parse(result.value);
  }
}

/**
 * @param {string} key
 * @param {SearchHistoryEntry[]} searchHistory
 */
export async function saveSearchHistory(key, searchHistory) {
  await Preferences.set({
    key,
    value: JSON.stringify(searchHistory),
  });
}

/**
 * @param {string} key
 * @returns {Promise<string>}
 */
export async function getSuggestedIds(key) {
  const searchHistory = await loadSearchHistory(key);
  const now = new Date();
  const currentDay = now.getDay();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  let entriesNearMe = searchHistory;
  try {
    let currentPosition = await Geolocation.getCurrentPosition();
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

  let counts = aggregateCounts(entriesHalfHour);
  let countsEntries = Object.entries(counts);
  if (countsEntries.length > 0) {
    countsEntries.sort((a, b) => b[1] - a[1]);
    return countsEntries.map((entry) => entry[0]).slice(0, 5);
  }

  counts = aggregateCounts(entriesThreeHours);
  countsEntries = Object.entries(counts);
  if (countsEntries.length > 0) {
    countsEntries.sort((a, b) => b[1] - a[1]);
    return countsEntries.map((entry) => entry[0]).slice(0, 5);
  }

  counts = aggregateCounts(entriesToday);
  countsEntries = Object.entries(counts);
  if (countsEntries.length > 0) {
    countsEntries.sort((a, b) => b[1] - a[1]);
    return countsEntries.map((entry) => entry[0]).slice(0, 5);
  }

  counts = aggregateCounts(entriesThreeDays);
  countsEntries = Object.entries(counts);
  if (countsEntries.length > 0) {
    countsEntries.sort((a, b) => b[1] - a[1]);
    return countsEntries.map((entry) => entry[0]).slice(0, 5);
  }

  counts = aggregateCounts(entriesNearMe);
  countsEntries = Object.entries(counts);
  if (countsEntries.length > 0) {
    countsEntries.sort((a, b) => b[1] - a[1]);
    return countsEntries.map((entry) => entry[0]).slice(0, 5);
  }

  if (key === STATION_SEARCH_HISTORY_KEY) {
    return [
      "33000037", // Postplatz
      "33000028", // Dresden Hauptbahnhof
      "33000032", // Dresden Hauptbahnhof Nord
      "33000016", // Dresden Neustadt
      "33000001", // Dresden Mitte
    ];
  }
  return [];
}

function aggregateCounts(entries) {
  /** @type {{[id: string]: number}} */
  const counts = {};
  for (const entry of entries) {
    if (!counts[entry.id]) {
      counts[entry.id] = 0;
    }
    counts[entry.id]++;
  }
  return counts;
}
