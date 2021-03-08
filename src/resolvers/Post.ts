import { Post } from "../etities/Post";
import { Arg,  Int, Mutation, Query, Resolver } from "type-graphql";


@Resolver()
export class PostResolver {
    @Query(()=> [Post] )
    async getPosts (): Promise<Post[]>  {
        const posts = Post.find();
        return posts
    }

    @Query(()=> Post, {nullable: true})
    getPostById ( @Arg("id", () => Int) id: number ): Promise<Post | undefined> {
        return Post.findOne(id);
    }

    @Mutation(()=>Post)
    async createPost(
        @Arg('title', ()=> String) title: string
    ): Promise<Post>  {
        const post = Post.create({title}).save();
        return post
    }

    @Mutation(()=>Post)
    async updatePost(
        @Arg("id", ()=>Int, {nullable: false}) id: number,
        @Arg("title", ()=>String, {nullable: true}) title: string
    ): Promise<Post | null> {
        const post = await Post.findOne({where: {id}})
        if(!post){
            return  null  
        }
        if(typeof title !== 'undefined'){
            await Post.update({id}, {title})
        }
        return post
    }
@Mutation(()=>Boolean)
async deletePost(
    @Arg("id", ()=>Int, {nullable: false}) id: number
): Promise<Boolean> {
    try {
        await Post.delete(id)
        return true
    } catch (error) {
        console.log(error);
        return false
    }
}
}  