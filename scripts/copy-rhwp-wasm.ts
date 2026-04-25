import { copyFileSync, existsSync, mkdirSync, statSync } from "fs";
import { resolve, dirname } from "path";

const src = resolve(__dirname, "../node_modules/@rhwp/core/rhwp_bg.wasm");
const dst = resolve(__dirname, "../public/rhwp_bg.wasm");

if (!existsSync(src)) {
  console.warn(`[rhwp] source not found: ${src} — skipping copy`);
  process.exit(0);
}

mkdirSync(dirname(dst), { recursive: true });
copyFileSync(src, dst);

const { size } = statSync(dst);
console.log(`[rhwp] copied rhwp_bg.wasm (${(size / 1024 / 1024).toFixed(2)} MB) to public/`);
