// vite.config.mjs
import { fileURLToPath, URL } from "node:url";
import { PrimeVueResolver } from "file:///C:/laragon/www/quantlas/AteneaMetis/app-atenea-sakai/node_modules/@primevue/auto-import-resolver/index.mjs";
import vue from "file:///C:/laragon/www/quantlas/AteneaMetis/app-atenea-sakai/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import Components from "file:///C:/laragon/www/quantlas/AteneaMetis/app-atenea-sakai/node_modules/unplugin-vue-components/dist/vite.js";
import { defineConfig } from "file:///C:/laragon/www/quantlas/AteneaMetis/app-atenea-sakai/node_modules/vite/dist/node/index.js";
var __vite_injected_original_import_meta_url = "file:///C:/laragon/www/quantlas/AteneaMetis/app-atenea-sakai/vite.config.mjs";
var vite_config_default = defineConfig({
  optimizeDeps: {
    noDiscovery: true
  },
  plugins: [
    vue(),
    Components({
      resolvers: [PrimeVueResolver()]
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  server: {
    host: "company.local",
    port: 3e3,
    // Cambia el puerto si es necesario
    https: false
    // Puedes cambiar esto a true si deseas usar HTTPS
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcbGFyYWdvblxcXFx3d3dcXFxccXVhbnRsYXNcXFxcQXRlbmVhTWV0aXNcXFxcYXBwLWF0ZW5lYS1zYWthaVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcbGFyYWdvblxcXFx3d3dcXFxccXVhbnRsYXNcXFxcQXRlbmVhTWV0aXNcXFxcYXBwLWF0ZW5lYS1zYWthaVxcXFx2aXRlLmNvbmZpZy5tanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L2xhcmFnb24vd3d3L3F1YW50bGFzL0F0ZW5lYU1ldGlzL2FwcC1hdGVuZWEtc2FrYWkvdml0ZS5jb25maWcubWpzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSAnbm9kZTp1cmwnO1xyXG5cclxuaW1wb3J0IHsgUHJpbWVWdWVSZXNvbHZlciB9IGZyb20gJ0BwcmltZXZ1ZS9hdXRvLWltcG9ydC1yZXNvbHZlcic7XHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcclxuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAndW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZSc7XHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICAgIG9wdGltaXplRGVwczoge1xyXG4gICAgICAgIG5vRGlzY292ZXJ5OiB0cnVlXHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICAgIHZ1ZSgpLFxyXG4gICAgICAgIENvbXBvbmVudHMoe1xyXG4gICAgICAgICAgICByZXNvbHZlcnM6IFtQcmltZVZ1ZVJlc29sdmVyKCldXHJcbiAgICAgICAgfSlcclxuICAgIF0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgYWxpYXM6IHtcclxuICAgICAgICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgICAgaG9zdDogJ2NvbXBhbnkubG9jYWwnLFxyXG4gICAgICAgIHBvcnQ6IDMwMDAsIC8vIENhbWJpYSBlbCBwdWVydG8gc2kgZXMgbmVjZXNhcmlvXHJcbiAgICAgICAgaHR0cHM6IGZhbHNlIC8vIFB1ZWRlcyBjYW1iaWFyIGVzdG8gYSB0cnVlIHNpIGRlc2VhcyB1c2FyIEhUVFBTXHJcbiAgICB9XHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRWLFNBQVMsZUFBZSxXQUFXO0FBRS9YLFNBQVMsd0JBQXdCO0FBQ2pDLE9BQU8sU0FBUztBQUNoQixPQUFPLGdCQUFnQjtBQUN2QixTQUFTLG9CQUFvQjtBQUwrTCxJQUFNLDJDQUEyQztBQVE3USxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixjQUFjO0FBQUEsSUFDVixhQUFhO0FBQUEsRUFDakI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLElBQUk7QUFBQSxJQUNKLFdBQVc7QUFBQSxNQUNQLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQztBQUFBLElBQ2xDLENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3hEO0FBQUEsRUFDSjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ0osTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBO0FBQUEsSUFDTixPQUFPO0FBQUE7QUFBQSxFQUNYO0FBQ0osQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
