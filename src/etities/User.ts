import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity{
   @Field(()=>Int)
   @PrimaryGeneratedColumn()
   id!: number

   @Field(()=>String)
   @CreateDateColumn()
   createdAt = new Date();
   
   @Field(()=>String )
   @Column({ unique: true })
   username: string

   @Field(()=>String)
   @Column({ unique: true })
   email: string

   @Field(()=>String)
   @Column()
   password: string
}