import { Preferences } from '@capacitor/preferences';
import beta from 'assets/BETA2007.gsb?url'
import proj4 from 'proj4'

export const dateFunctions = {
    // somewhat hacky way of deciphering the date string returned in the VVO API via regex capture groups and turn it into a date object
    convertVVOToDate: (VVOTimestamp) => {
        if (!VVOTimestamp) {
          console.log("Error: VVO timestamp was invalid")
          return false
        }

        const regexp = /\/Date\((\d+)([+-]\d+)\)\//g
        const matches = [...VVOTimestamp.matchAll(regexp)]

        let unixTimestamp = parseInt(matches[0][1]) // first match is raw unix timestamp
        if (matches[0][2] === "+0100") {             // second match is summertime modifier (3600s=1h)
          unixTimestamp += 3600000
        }

      return new Date(unixTimestamp)
    },

    // returns the time of a Date formatted as HH:mm
    getTimeFormatted: (arrivalDate) => {
        if (!arrivalDate) {
          console.log("Error: date was invalid")
          return false
        }

        const hours = arrivalDate.getHours()
        const minutes = String(arrivalDate.getMinutes()).padStart(2, '0') // add leading 0 if minutes are a single digit
        return hours + ":" + minutes
    },

    // returns the hours/minutes until the next departure as a string (f.e. "1h 5min")
    getArrivalTimeString: (arrivalDate) => {
        let diff = arrivalDate.getTime() - Date.now()
        let mm = Math.floor(diff / 1000 / 60) % 60;
        let hh = Math.floor(diff / 1000 / 60 / 60);

        if (diff < 0 || mm == 0) {
          return "jetzt"
        } else if (hh == 0) {
          return mm + "min"
        } else {
          return hh + "h " + mm + "min"
        }
    }
}

export const geoFunctions = {
  convertCoordinates_WGS84_GK4: async (long, lat) => {
    const fromProjection = "WGS84"

    // EPSG:31468 DHDN / 3-degree Gauss-Kruger zone 4
    const buffer = await fetch(beta).then(res => res.arrayBuffer())
    proj4.nadgrid('key', buffer); // used for Grid Based Datum Adjustments
    const toProjection = "+proj=tmerc +lat_0=0 +lon_0=12 +k=1 +x_0=4500000 +y_0=0 +ellps=bessel +nadgrids=@key,null +units=m +no_defs +type=crs"

    const convertedCoordinates = proj4(fromProjection, toProjection, [long, lat]);
    return [Math.round(convertedCoordinates[0]), Math.round(convertedCoordinates[1])]
  }
}

export const settingsFunctions = {
  // checks wether a station or connection is bookmarked
  // if the station/connection was not yet bookmarked (and the value for the key is null, the function returns false)
  isBookmarked: async(bookmarkId) => {
    if (bookmarkId) {
      // station
      const ret = await Preferences.get({ key: bookmarkId })
      const isBookmarked = JSON.parse(ret.value) ?? false

      return isBookmarked ?? false
    } else {
      throw new Error("Error checking bookmarks for station/connection (missing parameters)")
    }
  },

  // sets/removes a bookmark via preferences API
  // station bookmarks are saved by their station-ID (i.e. "123" as the preferences key)
  // connection bookmarks are saved with both station-IDs separated by a hyphen (i.e. "123-124" as the preferences key)
  // if the value of the key is true, the station/connection is currently bookmarked
  // returns true/false depending on the new bookmark state (f.e. true if the station is now bookmarked, when it previously wasn't)
  bookmark: async(stationId1, stationId2) => {
    let bookmarkId
    if (!stationId2) {
      // station
      bookmarkId = stationId1
    } else {
      // connection
      bookmarkId = stationId1 + "-" + stationId2
    }
    // ggf.  throw new Error("Error bookmarking station/connection (missing parameters)")

    if (await settingsFunctions.isBookmarked(bookmarkId)) {
      await Preferences.set({
        key: bookmarkId,
        value: JSON.stringify(false)
      })
      return false
    } else {
      await Preferences.set({
        key: bookmarkId,
        value: JSON.stringify(true)
      })
      return true
    }
  },

  // iterates through all stations in the preferences and returns an array of all station-IDs that are currently bookmarked (value: true)
  getBookmarkedStations: async () => {
    const keys = await Preferences.keys()
    const stations = keys.keys.filter(key => key.match(/^\d{8}$/))

    let bookmarkedStations = []
    for (const stationId of stations) {
      let station = await Preferences.get({ key: stationId })
      if(JSON.parse(station.value)){
        bookmarkedStations.push(stationId)
      }
    }

    return bookmarkedStations
  },

  getBookmarkedConnections: async () => {
    const keys = await Preferences.keys()
    const connections = keys.keys.filter(key => key.match(/^\d{8}-\d{8}$/))

    let bookmarkedConnections = []
    for (const connectionId of connections) {
      let connection = await Preferences.get({ key: connectionId })
      if(JSON.parse(connection.value)){
        bookmarkedConnections.push(connectionId)
      }
    }

    return bookmarkedConnections
  }
}
