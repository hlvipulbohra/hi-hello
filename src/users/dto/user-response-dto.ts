import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@ObjectType()
export class UserResponseDTO {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field()
  name: string;

  @Field()
  about: string;

  @Field()
  email: string;

  password: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
