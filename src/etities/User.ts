import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType()
@Entity()
export class User {
   @Field(()=>Int, {nullable:false})
   @PrimaryKey()
   id!:number

   @Field(()=>String)
   @Property({ type: "date"})
   createdAt = new Date();
   
   @Field(()=>String, {nullable: false})
   @Property({nullable: false, unique: true, type: "text"})
   username: string

   @Field(()=>String)
   @Property({nullable: false, type: "text"})
   password: string
}