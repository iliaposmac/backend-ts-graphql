import { Field, InputType } from "type-graphql";

@InputType()
export class TitleAndText {
    @Field(() => String)
    title: string;

    @Field(() => String)
    text: string;
}
