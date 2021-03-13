import { MyContext } from "src/types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyContext> = ({context}, next): Promise<any> => {
    const userID = context.req.session.userId;
    if(!userID){
        throw new Error("User is not auth");
    }
    return next()
}