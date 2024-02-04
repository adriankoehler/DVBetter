# DVBetter (dvbetter)

App for the dvb-network built with quasar and capacitor.
Read more about developing with capacitor: https://quasar.dev/quasar-cli-vite/developing-capacitor-apps/preparation

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev #web
quasar dev -m capacitor -T android #android

```


### Lint the files
```bash
yarn lint
# or
npm run lint
```


### Format the files
```bash
yarn format
# or
npm run format
```



### Build the app for production
```bash
quasar build #web
quasar build -m capacitor -T android --ide #android
```
If there are errors during the build, you may have to:
- delete the `src-capacitor/android` folder
- rebuild
- sync project with gradle files in Android Studio (under "File")
- build the app in Android Studio (under "Build" → "Make project" / "Build APK")

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
