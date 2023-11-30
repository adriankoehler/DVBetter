// import { Quasar } from "quasar";
import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";

// import "quasar/dist/quasar.css";

import index from "./index.vue";

const router = createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			path: "/",
			name: "home",
			component: () => import("./views/home.vue"),
		},
	],
});

const app = createApp(index);

app.use(router);

// app.use(Quasar);

app.mount("body");
