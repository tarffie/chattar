pub mod database {
    use crate_root;
    use dotenv::dotenv;
    use std::{env, path};

    #[derive(Debug)]
    pub struct Uri {
        username: String,
        password: String,
        database: String,
        host: String,
        port: String,

    }

    // enum Uri {
    //     Username(String),
    //     Password(String),
    //     Database(String),
    //     Host(String),
    //     Port(String),
    // }

    pub fn connect() {
        dotenv().ok();
        // dotenv::from_path(env_path.as_path()).expect("Expected extracting env vars from root");
        let fields = ["USERNAME", "PASSWORD", "DATABASE", "HOST", "PORT"];
        let mut env_vars: Vec<String> = Vec::new();
        for field in fields {
            env_vars.push(env::var(format!("MONGO_{field}")).expect("user variable must be set."));
        }

        let mongo_uri = assemble_mongo_uri(env_vars);
        println!("{:?}", mongo_uri);
    }

    fn assemble_mongo_uri(vars: Vec<String>) -> Uri {
        let mut fields: Vec<&str> = Vec::new();
        for var in vars.iter() {
            fields.push(var.as_ref());
        }
        let username = String::from(fields[0]);
        let password = String::from(fields[1]);
        let database = String::from(fields[2]);
        let host = String::from(fields[3]);
        let port = String::from(fields[4]);

        Uri {
            username,
            password,
            database,
            host,
            port,
        }
    }
}
