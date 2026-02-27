use yeti_core::prelude::*;

// Simple greeting resource (public, no auth required).
//
// Uses yeti_log! to emit telemetry-visible log events.
// Note: In production (environment: production), only error-level
// logs are captured by the telemetry system.

pub type Greeting = GreetingResource;

#[derive(Default)]
pub struct GreetingResource;

impl Resource for GreetingResource {
    fn name(&self) -> &str {
        "greeting"
    }

    fn is_public(&self) -> bool { true }

    get!(_request, _ctx, {
        yeti_log!(info, "Greeting requested");
        reply().json(json!({"greeting": "Hello, World!"}))
    });
}

register_resource!(GreetingResource);
