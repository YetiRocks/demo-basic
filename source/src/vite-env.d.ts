/// <reference types="vite/client" />

declare const __STATIC_ROOT__: string
declare const __RESOURCES_ROOT__: string

// Cell-config globals (YTC-702). Injected by vite.config.ts `define`, each
// sourced from a VITE_* env var with the canonical demo-basic value as the
// fallback. Empty string means "use the default" — see src/cellConfig.ts.
declare const __CELL_LANGUAGE__: string
declare const __CELL_FORMAT__: string
declare const __CELL_LOCATION__: string
declare const __API_BASE__: string
declare const __GREETING_SOURCE__: string
declare const __GREETING_LANGUAGE__: string
declare const __SCHEMA_SOURCE__: string
declare const __SCHEMA_LANGUAGE__: string
