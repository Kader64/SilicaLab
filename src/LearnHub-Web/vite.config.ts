import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // ASP.NET Core backend (dev)
      "/api": {
        target: "https://localhost:7051",
        changeOrigin: true,
        secure: false, // for dev only
      },
    },
  },
});
