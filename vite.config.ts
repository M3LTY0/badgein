import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// The optional resume-parsing server (npm run api) listens here; the app calls it same-origin via /api.
const api = { "/api": "http://localhost:8787" };

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: api },
  preview: { proxy: api },
});
