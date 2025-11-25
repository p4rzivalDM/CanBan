import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: 'https://p4rzivalDM.github.io',
  bsase: '/CanBan/',
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["@uiw/react-md-editor", "@uiw/react-markdown-preview"],
      external: ["@babel/runtime"]
    }
  }
});