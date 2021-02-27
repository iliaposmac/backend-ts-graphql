import { User } from "../etities/User";
import { MyContext } from "src/types";
import argon from "argon2";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { EntityManager } from "@mikro-orm/postgresql";
import { COOKIE_NAME } from "../constants";


@InputType()
class UsernameAndPassInput {
    @Field(()=>String)
    username!: string

    @Field(()=>String)
    password!:string
}

@ObjectType()
class ErrorField{
    @Field(()=>String)
    field: string

    @Field(()=>String)
    message: string
}

@ObjectType()
class UserRespone {
    @Field(()=>[ErrorField], {nullable: true})
    errors?: ErrorField[];

    @Field(()=>User, {nullable: true})
    user?: User
}

interface newUser  {
    username: string,
    password: string,
    created_at: Date
}

@Resolver()
export class UserResolver {

    @Query(()=>User, {nullable: true})
    async me( @Ctx() ctx: MyContext ) {
        const userId = ctx.req.session.userId;
        const user = await ctx.em.findOne(User, {id: userId}); 
        if(!user){
            return null;
        }
        return user
    }

    @Mutation(()=> UserRespone)
    async registerUser(
        @Arg("options", ()=>UsernameAndPassInput) options: UsernameAndPassInput,
        @Ctx() ctx: MyContext
    ): Promise<UserRespone> {
       try {
        const isUserExists = await ctx.em.findOne(User, {username: options.username});
        
        if(isUserExists){
            return {
                errors: [{
                    field:"username",
                    message: "User already exists"
                }]
            }
        }

        if(options.username.length <=2 ){
            return {
                errors:[{
                    field: "username",
                    message: "Username is too short > 2 s"
                }] 
            }
        }

        if(options.password.length <=5 ){
            return {
                errors: [{
                    field: "password",
                    message: "Psw is too short > 6 s"
                }]  
            }
        }

        const hashedPassword = await argon.hash(options.password)
        const userObj: newUser = {
            created_at: new Date(),
            password: hashedPassword,
            username: options.username
        }

        // const user = ctx.em.create(User, {username: options.username, password: hashedPassword});
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

    @Mutation(()=> UserRespone)
    async login(
        @Arg("options", ()=> UsernameAndPassInput) options: UsernameAndPassInput,
        @Ctx() ctx: MyContext
    ): Promise<UserRespone>{
        const userFind = await ctx.em.findOne(User, {username: options.username});

        if(!userFind){
            return {
                errors: [{
                    field: 'username',
                    message: "Username doesn't exists"
                }]
            }
        }

        const valid = await argon.verify(userFind.password, options.password);
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
        @Ctx() ctx:MyContext
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
}
