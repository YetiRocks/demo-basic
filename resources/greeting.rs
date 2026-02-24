use yeti_core::prelude::*;

/// Simple greeting resource using concise syntax.
///
/// Uses yeti_log! to emit telemetry-visible log events.
/// Note: In production (environment: production), only error-level
/// logs are captured by the telemetry system.
resource!(Greeting {
    get => {
        yeti_log!(info, "Greeting requested");
        json!({"greeting": "Hello, World!"})
    }
});
