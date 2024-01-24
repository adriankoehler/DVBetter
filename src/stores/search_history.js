import { Preferences } from "@capacitor/preferences";
import { Geolocation } from "@capacitor/geolocation";

/**
 * @typedef {{
 *   timestamp: Date,
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
  searchHistory.push({
    timestamp: new Date(),
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
    return JSON.parse(result.value).map((entry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }));
  }
}

/**
 * @param {SearchHistoryEntry[]} searchHistory
 */
export async function saveSearchHistory(searchHistory) {
  await Preferences.set({
    key: SEARCH_HISTORY_KEY,
    value: JSON.stringify(
      searchHistory.map((entry) => ({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
      }))
    ),
  });
}
