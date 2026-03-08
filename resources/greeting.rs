/// Import Yeti's JS-like abstractions (!)
use yeti_sdk::prelude::*;

/// Simple custom resource using concise syntax
resource!(Greeting {
  get => json!({"greeting": "Hello, World!"})
});
