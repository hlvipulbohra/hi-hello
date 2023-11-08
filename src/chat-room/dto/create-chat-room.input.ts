import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { Types } from 'mongoose';
import { IsNonEmptyArray } from './custom-validators';

@InputType()
export class CreateChatRoomInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  description: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: false }) // Mark isGroupChat as optional in the GraphQL schema
  isGroupChat: boolean;

  @Field(() => [String])
  @IsNonEmptyArray()
  members: Types.ObjectId[];

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsOptional()
  admins: Types.ObjectId[];
}
