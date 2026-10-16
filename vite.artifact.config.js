import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Single-file build for the Claude artifact: all JS and CSS inlined into one HTML page.
// tools/artifact-fragment.mjs then turns it into the fragment the artifact host expects.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  // not minified: the artifact page stays readable, like the original single-file game
  build: { outDir: 'dist-artifact', emptyOutDir: true, minify: false, modulePreload: false },
});
