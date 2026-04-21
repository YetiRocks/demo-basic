//! demo-basic — Phase 48 static-crate entry point.
//!
//! Unlike apps with an existing `impl Service` (streamlock,
//! test-service-ext), this app is purely auto-router-driven: one
//! resource (`Greeting`) defined via the `resource!` macro, no
//! explicit service trait. Under static linking we synthesize a
//! `DemoBasicService` that carries the app's config + schema +
//! resource list.
//!
//! This is "pattern B" of the slice 4 migration (pattern A is
//! app-with-existing-Service like streamlock). Cookbook notes both.

use yeti_sdk::extensions::{RegistrationContext, Service};
use yeti_sdk::prelude::*;

#[path = "../resources/greeting.rs"]
mod greeting;

/// Factory invoked by the customer deployment binary.
pub fn service() -> Box<dyn Service> {
    Box::new(DemoBasicService)
}

struct DemoBasicService;

impl Service for DemoBasicService {
    fn id(&self) -> &'static str {
        "demo-basic"
    }

    fn name(&self) -> &'static str {
        "Basic Demo"
    }

    fn is_extension(&self) -> bool {
        false
    }

    fn config_yaml(&self) -> Option<&'static str> {
        Some(include_str!("../config.yaml"))
    }

    fn schemas(&self) -> Vec<&'static str> {
        vec![include_str!("../schemas/basic.graphql")]
    }

    fn resources(&self, ctx: &mut RegistrationContext) -> yeti_sdk::error::Result<()> {
        ctx.add_resource(Box::new(greeting::Greeting));
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn factory_returns_configured_service() {
        let svc = service();
        assert_eq!(svc.id(), "demo-basic");
        assert_eq!(svc.name(), "Basic Demo");
        assert!(!svc.is_extension());
        assert_eq!(svc.schemas().len(), 1);
        assert!(svc.schemas()[0].contains("TableName"));
        assert!(svc.config_yaml().is_some());
    }

    #[test]
    fn factory_satisfies_server_builder_bounds() {
        fn assert_factory_bounds<F>(_: F)
        where
            F: Fn() -> Box<dyn Service> + Send + Sync + 'static,
        {
        }
        assert_factory_bounds(service);
    }
}
