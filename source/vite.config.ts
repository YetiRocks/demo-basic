import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Single source of truth. Must match this app's config.yaml and ~/yeti/yeti-config.yaml.
//   STATIC_ROOT    = '' for root_app, otherwise '/' + app_id
//   RESOURCES_ROOT = resources.route (no slashes)
const STATIC_ROOT = '/demo-basic'
const RESOURCES_ROOT = 'api'

// Read yeti server port from ~/yeti/yeti-config.yaml (3 levels up from this file)
const __dir = dirname(fileURLToPath(import.meta.url))
const yetiYaml = readFileSync(resolve(__dir, '../../../yeti-config.yaml'), 'utf-8')
const YETI_PORT = parseInt(yetiYaml.match(/^port:\s*(\d+)/m)?.[1] ?? '9996', 10)

// Cell-config seam (YTC-702). One codebase drives every demo-matrix cell.
// Each global is sourced from a VITE_* env var; when unset it resolves to an
// empty string, and src/cellConfig.ts substitutes the canonical demo-basic
// default. So with NO VITE_* vars set, the build is behavior-equivalent to the
// pre-parameterization demo-basic.
const env = (key: string) => process.env[key] ?? ''

export default defineConfig({
  base: `${STATIC_ROOT}/`,
  define: {
    __STATIC_ROOT__: JSON.stringify(STATIC_ROOT),
    __RESOURCES_ROOT__: JSON.stringify(RESOURCES_ROOT),
    __CELL_LANGUAGE__: JSON.stringify(env('VITE_CELL_LANGUAGE')),
    __CELL_FORMAT__: JSON.stringify(env('VITE_CELL_FORMAT')),
    __CELL_LOCATION__: JSON.stringify(env('VITE_CELL_LOCATION')),
    __API_BASE__: JSON.stringify(env('VITE_API_BASE')),
    __GREETING_SOURCE__: JSON.stringify(env('VITE_GREETING_SOURCE')),
    __GREETING_LANGUAGE__: JSON.stringify(env('VITE_GREETING_LANGUAGE')),
    __SCHEMA_SOURCE__: JSON.stringify(env('VITE_SCHEMA_SOURCE')),
    __SCHEMA_LANGUAGE__: JSON.stringify(env('VITE_SCHEMA_LANGUAGE')),
  },
  server: {
    proxy: {
      [`${STATIC_ROOT}/${RESOURCES_ROOT}`]: {
        target: `https://localhost:${YETI_PORT}`,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  build: { outDir: '../web', emptyOutDir: true },
})
