use yeti_core::prelude::*;

// TableName: public read + update (demo counter)
// No create/delete — prevents spam-creating records or wiping the counter.
resource!(TableExtender for TableName {
    get => allow_read(),
    put => allow_update(),
});
