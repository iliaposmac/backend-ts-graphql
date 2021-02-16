import 'reflect-metadata';
import { Connection, IDatabaseDriver, Logger, MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import mikroORMinit from './mikro-orm.config';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { PostResolver } from './resolvers/Post';
import { UserResolver } from './resolvers/users';
import redis from 'redis';
import connectRedis from 'connect-redis';
import session from 'express-session';
import { SessionOptions } from 'express-session';

const main  = async(): Promise<void> => {
    const logger = new Logger((message) => console.log(message), true);
    logger.log( "discovery" ,"Defining mikro orm")

    const orm: MikroORM<IDatabaseDriver<Connection>> = await MikroORM.init(mikroORMinit);
    await orm.getMigrator().up()

    const RedisStore = connectRedis(session);
    const redisClient = redis.createClient();

    const cookieOptions: session.CookieOptions = {
        httpOnly: true,
        maxAge: 1000*24*60*60*365, // 365 days
        secure: __prod__, 
        sameSite: "lax"
    }

    const sessionOptions : SessionOptions =  {
        secret: "asdsadasasdaasdasdddsa",
        store: new RedisStore({client: redisClient, disableTouch: true,  host:"localhost", port:6379, ttl: 86400}),
        name: "qid",
        resave: false,
        cookie: cookieOptions,
        saveUninitialized: false,
    }

    const app = express();
    app.use(session(sessionOptions))

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [PostResolver, UserResolver], 
            validate: false
        }),
        context: ({req, res}) => ({em: orm.em, req, res})
    })

    apolloServer.applyMiddleware({ app: app });
    
    app.get('/', (_, res)=>{
        res.send('HELL 2.25 h timestamp');
    })
    app.listen(4000, ()=>{
        logger.log("info" ,"express server started".toUpperCase())
    })
}

main().catch(error => console.error(error)); 