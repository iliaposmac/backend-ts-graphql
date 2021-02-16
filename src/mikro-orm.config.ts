import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./etities/Post";
import { join } from 'path';
import { User } from "./etities/User";

export default {
    dbName: "fullstack",
    type: "postgresql",
    user: "postgres",
    password: "posmacilia",
    debug: !__prod__, 
    entities: [Post, User],
    migrations: {
        path: join(__dirname, "./migrations"),
        pattern: /^[\w-]+\d+\.[tj]s$/,  
    }
} as Parameters<typeof MikroORM.init>[0];

console.log(typeof MikroORM.init)

