/**
 * cellConfig — the single source of truth for per-cell parameterization of the
 * Yeti SDK demo matrix (YTC-702).
 *
 * One codebase drives every matrix cell. Each cell is a (language × format ×
 * location) combination: e.g. `rust / native / local`, `python / wasm / remote`.
 * The values are injected at build time through Vite `define` globals (see
 * `vite.config.ts`), each of which falls back to the canonical demo-basic value
 * when its `VITE_*` env var is unset. With NO env vars set, this returns exactly
 * what demo-basic does today, so the default build stays byte-equivalent in
 * behavior to the canonical demo-basic.
 */

export type CellFormat = 'native' | 'wasm' | 'spin'
export type CellLocation = 'local' | 'remote'

export interface CellConfig {
  /** SDK source language for this cell — drives the TopNav badge. */
  language: string
  /** Build/runtime format — drives the TopNav badge. */
  format: CellFormat
  /** Where this cell's backend runs — drives the TopNav badge. */
  location: CellLocation
  /**
   * Base URL for counter + greeting fetches. Default is same-origin
   * `${STATIC_ROOT}/${RESOURCES_ROOT}` (= `/demo-basic/api`). A remote cell
   * overrides this with its backend deployment URL.
   */
  apiBase: string
  /** The custom-resource SDK source shown in the greeting panel, in this cell's language. */
  greetingSource: string
  /** CodeMirror grammar id for `greetingSource` (e.g. 'rust', 'python', 'typescript'). */
  greetingLanguage: string
  /** The schema source shown in the counter panel. */
  schemaSource: string
  /** CodeMirror grammar id for `schemaSource`. */
  schemaLanguage: string
}

// Canonical demo-basic defaults. These are the exact strings the SPA shipped
// before parameterization — used whenever the matching VITE_* env var is unset.
const DEFAULT_SCHEMA_GRAPHQL = `## Simple counter schema

type TableName @table @export {
    id: ID! @primaryKey
    count: Int!
}`

const DEFAULT_GREETING_RS = `use yeti_sdk::prelude::*;

/// Custom greeting resource using concise syntax
resource!(Greeting {
    get => json!({"greeting": "Hello, World!"})
});`

function asFormat(value: string): CellFormat {
  return value === 'wasm' || value === 'spin' || value === 'native' ? value : 'native'
}

function asLocation(value: string): CellLocation {
  return value === 'remote' ? 'remote' : 'local'
}

/**
 * Resolve this build's cell config. Pure read of the build-time `define`
 * globals; safe to call from any component on every render.
 */
export function getCellConfig(): CellConfig {
  // Default apiBase is same-origin, identical to the pre-parameterization
  // `${__STATIC_ROOT__}/${__RESOURCES_ROOT__}` template (= `/demo-basic/api`).
  const apiBase = __API_BASE__ || `${__STATIC_ROOT__}/${__RESOURCES_ROOT__}`

  return {
    language: __CELL_LANGUAGE__ || 'rust',
    format: asFormat(__CELL_FORMAT__),
    location: asLocation(__CELL_LOCATION__),
    apiBase,
    greetingSource: __GREETING_SOURCE__ || DEFAULT_GREETING_RS,
    greetingLanguage: __GREETING_LANGUAGE__ || 'rust',
    schemaSource: __SCHEMA_SOURCE__ || DEFAULT_SCHEMA_GRAPHQL,
    schemaLanguage: __SCHEMA_LANGUAGE__ || 'graphql',
  }
}
