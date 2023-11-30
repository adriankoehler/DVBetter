import { fileURLToPath } from "node:url";

// import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
	root: "./src",
	build: {
		outDir: "../dist",
		minify: false,
		emptyOutDir: true,
	},
	plugins: [
		// quasar(),
		vue({
			// template: { transformAssetUrls },
		}),
	],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
});
