import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@ObjectType()
export class ChatRoomResponseDTO {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  isGroupChat: boolean;

  @Field(() => [ID])
  members: Types.ObjectId[];

  @Field(() => [ID])
  admins: Types.ObjectId[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
