import { User } from "../etities/User";
import { MyContext } from "src/types";
import argon from "argon2";
import { Arg, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME, FORGET_PASS_PREFIX } from "../constants";
import { UsernameAndPassInput } from "./UsernameAndPassInput";
import { validateRegister } from "../services/validation";
import { nodemailerService } from "../services/nodemailer";
import createHtmlForEmail from "../services/createHtmlForEmail";
import { v4 } from 'uuid';



@ObjectType()
class ErrorField{
    @Field(()=>String)
    field: string

    @Field(()=>String)
    message: string
}

@ObjectType()
class UserResponse {
    @Field(()=>[ErrorField], {nullable: true})
    errors?: ErrorField[];

    @Field(()=>User, {nullable: true})
    user?: User
}

interface newUser  {
    username: string,
    password: string,
    created_at: Date,
    email: string
}

@Resolver()
export class UserResolver {

    @Mutation(()=> UserResponse)
    async changePassword(
        @Ctx() ctx: MyContext,
        @Arg("token") token: string,
        @Arg("newPassword") newPassword: string
    ): Promise<UserResponse> {
        if(newPassword.length <= 3){
            return {
                errors: [{
                    field: "newPassword",
                    message: "New password is too short"
                }]
            }
        }
        const key = FORGET_PASS_PREFIX+token;
        const userId = await ctx.redis.get(key);

        if(!userId){
            return {
                errors: [{
                    field: "token",
                    message: "Token is expired"
                }]
            }
        }
        const  user = await ctx.em.findOne(User, {id: parseInt(userId)})
        if(!user) {
            return {
                errors: [{
                    field: "token",
                    message: "User no longer exists"
                }]
            }
        }
        //saving user and changin its password
        user.password = await argon.hash(newPassword);
        await ctx.em.persistAndFlush(user);
        
        ctx.redis.del(key);

        ctx.req.session.userId = user.id;
        return { user }
    }

    @Query(()=>User, {nullable: true})
    async me( @Ctx() ctx: MyContext ) {
        const userId = ctx.req.session.userId;
        const user = await ctx.em.findOne(User, {id: userId}); 
        if(!user){
            return null;
        }
        return user
    }

    @Mutation(()=> UserResponse)
    async registerUser(
        @Arg("options", ()=>UsernameAndPassInput) options: UsernameAndPassInput,
        @Ctx() ctx: MyContext
    ): Promise<UserResponse> {
       try {
        const userByUsername = await ctx.em.findOne(User, {username: options.username});
        const userByEmail = await ctx.em.findOne(User, {email: options.email});

        const errors = validateRegister(options, userByEmail, userByUsername);

        if(errors){
            console.log("Errors %s", errors);
            return { errors: errors }
        }

        const hashedPassword = await argon.hash(options.password)
        const userObj: newUser = {
            created_at: new Date(),
            email: options.email,
            password: hashedPassword,
            username: options.username
        }

        console.log('registered %s', userObj);

        const newUser = await (ctx.em as EntityManager).createQueryBuilder(User).getKnexQuery().insert(userObj).returning("*");
        
        return { user: newUser[0] }

        } catch (error) {
            return {
                errors: [{
                    field: error.code,
                    message: error.message
                }]  
            }      
        }
    }

    @Mutation(()=> UserResponse)
    async login(
        @Arg("usernameOrEmail") usernameOrEmail: string,
        @Arg("password") password: string,
        @Ctx() ctx: MyContext
    ): Promise<UserResponse>{
        const userFind = await ctx.em.findOne(User, usernameOrEmail.includes("@") ? {email: usernameOrEmail} : {username: usernameOrEmail} );

        if(!userFind){
            return {
                errors: [{
                    field: 'usernameOrEmail',
                    message: "Username doesn't exists"
                }]
            }
        }

        const valid = await argon.verify(userFind.password, password);
        if(!valid){
            return {
                errors:[ {
                    field: 'password',
                    message: "Password is incorrect"
                }]
            }
        }

        ctx.req.session.userId = userFind.id;

        return {
            user: userFind
        };
    }

    @Mutation(()=>Boolean)
    logout (
        @Ctx() ctx: MyContext
    ) {
        return new Promise((resolve)=>{
            ctx.req.session.destroy((err)=>{
                ctx.res.clearCookie(COOKIE_NAME);
                console.log(err);
                if(err) resolve(err);
                resolve(true);
            });
        })
    }
    
    @Mutation(()=>Boolean)
    async forgotPassword(
        @Arg("email") email: string,
        @Ctx() ctx: MyContext
    ): Promise<Boolean> {
        const user = await ctx.em.findOne(User, {email})

        console.log(user)
        console.log(email);
        
        if(!user){
            return true
        }

        const token = v4();

        await ctx.redis.set(FORGET_PASS_PREFIX + token, user.id, "ex", 1000*60*5); // 5 minutes to restore pass

        const html =  createHtmlForEmail.htmlForgotPassword(token);
        
        await nodemailerService({receiver: email, html }); 
        return true
    }
}
