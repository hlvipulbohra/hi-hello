import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@ObjectType()
export class MessageResponseDTO {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field(() => ID)
  senderId: Types.ObjectId;

  @Field()
  message: string;

  @Field()
  isGroupChat: boolean;

  @Field(() => ID)
  roomId: Types.ObjectId;

  @Field(() => [ID])
  members: Types.ObjectId[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
