import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Redis } from "ioredis";
import { Response, Request } from "express";
import { Session } from "express-session";

export type MyContext = {
    em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>,
    redis: Redis,
    req: Request & { session?: Session & { userId?: number } };
    res: Response
}