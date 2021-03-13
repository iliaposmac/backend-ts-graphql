import { ManyToOne } from "typeorm";
import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post extends BaseEntity {

  @Field(()=> Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(()=>String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(()=>String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(()=>String)
  @Column()
  title: string;

  @Field(()=>String)
  @Column()
  text: string;

  @Field(()=>Number)
  @Column({type: "int", default: 0})
  likes!: number;

  @Field(()=>Int)
  @Column()
  creatorId: number

  @Field(()=>User)
  @ManyToOne(()=>User, user => user.posts)
  creator: User;
}
