import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  @Field(() => ID)
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  @Field(() => ID)
  roomId: Types.ObjectId;

  @Field()
  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Boolean, default: false })
  @Field()
  isGroupChat: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  @Field(() => [ID])
  members: Types.ObjectId[];

  @Field()
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Field()
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
