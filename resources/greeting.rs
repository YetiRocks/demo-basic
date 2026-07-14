// Import Yeti's JS-like abstractions.
use yeti_sdk::prelude::*;

// Simple custom resource using concise syntax.
//
// `allow_read => true` declares this endpoint publicly readable — the resource
// equivalent of a table's `@access(public: [read])` (a custom `resource!()` is
// not a table, so it has no schema `@access`). Without it a custom resource is
// default-deny and returns 401 under `ENVIRONMENT=production`.
//
// NOTE: on the wasm path this declaration is currently INERT — the host's
// `WasmResource` adapter does not yet forward a guest custom-resource's
// `allow_*` to the router, and the WIT `resource-info` catalog has no
// `public-access` field to carry it (only the table-spec does). So the greeting
// still 401s in production until that host wiring lands (tracked as prod-parity
// finding PROD-GAP-1). The declaration is kept here so the app is correct at the
// source level and becomes public automatically once the host honors it.
resource!(Greeting {
  allow_read => true,
  get => json!({"greeting": "Hello, World!"})
});
