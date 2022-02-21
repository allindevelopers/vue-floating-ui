import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import * as path from "path";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	build: {
		lib: {
			formats: ["es"],
			entry: path.resolve(__dirname, "src/vue-floating-ui.ts"),
			fileName: (format) => `vue-floating-ui.${format}.js`,
		},
		rollupOptions: {
			external: ["vue", "@floating-ui/core", "@floating-ui/dom"],
		},
	},
});
