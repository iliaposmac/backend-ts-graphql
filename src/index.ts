import 'reflect-metadata';
import {  Logger } from '@mikro-orm/core';
import { COOKIE_NAME, FRONT_URL, __prod__ } from './constants';
import { typeORMconfig } from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/Post';
import { UserResolver } from './resolvers/users';
import Redis from 'ioredis';
import { createConnection } from 'typeorm';
import connectRedis from 'connect-redis';
import session from 'express-session';
import { SessionOptions } from 'express-session';
import cors from 'cors';

const main  = async(): Promise<void> => {
    const logger = new Logger((message) => console.log(message), true);
    logger.log("discovery" ,"Defining mikro orm")

    const connection = await createConnection(typeORMconfig);
    
   

    const RedisStore = connectRedis(session);
    const redis = new Redis();

    const cookieOptions: session.CookieOptions = {
        httpOnly: true,
        maxAge: 1000*24*60*60*365, // 365 days
        secure: __prod__, 
        sameSite: "lax"
    }

    const sessionOptions : SessionOptions =  {
        secret: "asdsadasasdaasdasdddsa",
        store: new RedisStore({client: redis, disableTouch: true,  host:"localhost", port:6379, ttl: 86400}),
        name: COOKIE_NAME,
        resave: false,
        cookie: cookieOptions,
        saveUninitialized: false,
    }

    const app = express();

    app.use(cors({
        origin: FRONT_URL,
        credentials: true
    }));

    app.use(session(sessionOptions))

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver], 
            validate: false
        }),
        context: ({req, res}) => ({ req, res, redis })
    })

    apolloServer.applyMiddleware({ 
        app: app,
        cors: false
    });
    
    app.get('/', (_, res)=>{
        res.send('HELL 2.25 h timestamp');
    })
    app.listen(4000, ()=>{
        logger.log("info" ,"express server started".toUpperCase())
    })
}

main().catch(error => console.error(error)); 