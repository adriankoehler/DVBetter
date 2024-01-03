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
