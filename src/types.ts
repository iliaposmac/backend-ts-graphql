import { Redis } from "ioredis";
import { Response, Request } from "express";
import { Session } from "express-session";

export type MyContext = {
    redis: Redis,
    req: Request & { session?: Session & { userId?: number } };
    res: Response
}