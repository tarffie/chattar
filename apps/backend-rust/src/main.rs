use crate::util::config::database;

pub mod util;

// need to check for necessary variables
// need to connect to my db
fn main() {
    database::connect();
}
