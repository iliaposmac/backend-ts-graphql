import { Post } from "../etities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver {
    @Query(()=> [Post] )
    async getPosts (@Ctx() { em }: MyContext): Promise<Post[]>  {
        const posts = em.find(Post, {});
        return posts
    }

    @Query(()=> Post, {nullable: true})
    getPostById (@Ctx() ctx: MyContext, @Arg("id", () => Int) id: number ): Promise<Post | null> {
        return ctx.em.findOne(Post, {id})
    }

    @Mutation(()=>Post)
    async createPost(
        @Arg('title', ()=> String) title: string,
        @Ctx() ctx : MyContext
    ): Promise<Post>  {
        const post = ctx.em.create(Post, {title})
        await ctx.em.persistAndFlush(post)
        return post
    }

    @Mutation(()=>Post)
    async updatePost(
        @Arg("id", ()=>Int, {nullable: false}) id: number,
        @Arg("title", ()=>String, {nullable: true}) title: string,
        @Ctx() ctx: MyContext
    ): Promise<Post | null> {
        const post = await ctx.em.findOne(Post, {id})
        if(!post){
            return  null  
        }
        if(typeof title !== 'undefined'){
            post.title = title;
            ctx.em.persistAndFlush(post)
        }
        return post
    }
@Mutation(()=>Boolean)
async deletePost(
    @Arg("id", ()=>Int, {nullable: false}) id: number,
    @Ctx() ctx: MyContext
): Promise<Boolean | null> {
    try {
        await ctx.em.nativeDelete(Post, {id: id})
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}
}  