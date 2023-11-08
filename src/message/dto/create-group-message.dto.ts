import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';
import { Types } from 'mongoose';
import { InputType, Field, ID } from '@nestjs/graphql';

@InputType()
export class CreateGroupMessageDto {
  senderId: Types.ObjectId;
  isGroupChat: boolean;

  @Field(() => ID)
  @IsMongoId()
  @IsNotEmpty()
  roomId: Types.ObjectId;

  @Field()
  @IsNotEmpty()
  @IsString()
  message: string;

  members: Types.ObjectId[];
}
