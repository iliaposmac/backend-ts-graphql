import { User } from "../etities/User";
import { MyContext } from "src/types";
import argon from "argon2";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";


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
    @Field(()=>ErrorField, {nullable: true})
    error?: ErrorField;

    @Field(()=>User, {nullable: true})
    user?: User
}

@Resolver()
export class UserResolver {
    @Query(()=>User, {nullable: true})
    async me( @Ctx() ctx: MyContext ) {
        console.log(ctx.req.session)
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
        const isUserExists = await ctx.em.findOne(User, {username: options.username});

        if(isUserExists){
            return {
                error: {
                    field:"User",
                    message: "User already exists"
                }
            }
        }

        if(options.username.length <=2 ){
            return {
                error: {
                    field: "username",
                    message: "Username is too short > 2 s"
                }
            }
        }

        if(options.password.length <=5 ){
            return {
                error: {
                    field: "password",
                    message: "Psw is too short > 6 s"
                }
            }
        }
        const hashedPassword = await argon.hash(options.password)
        const user = ctx.em.create(User, {username: options.username, password: hashedPassword})
        await ctx.em.persistAndFlush(user)
        return { user }       
    }

    @Mutation(()=> UserRespone)
    async login(
        @Arg("oprions", ()=>UsernameAndPassInput) options: UsernameAndPassInput,
        @Ctx() ctx: MyContext
    ): Promise<UserRespone>{
        const userFind = await ctx.em.findOne(User, {username: options.username});
        
        if(!userFind){
            return {
                error: {
                    field: 'username',
                    message: "username doesnt exists"
                }
            }
        }

        const valid = await argon.verify(userFind.password, options.password);
        if(!valid){
            return {
                error: {
                    field: 'password',
                    message: "password is incorrect4"
                }
            }
        }

        ctx.req.session.userId = userFind.id;

        return {
            user: userFind
        };
    }
} 