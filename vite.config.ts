import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import dusk from "vite-plugin-dusk"

// https://vitejs.dev/config/
export default defineConfig({
  base: "",
  plugins: [react(), dusk({ logicPath: "./src/logic.ts" })],
})
