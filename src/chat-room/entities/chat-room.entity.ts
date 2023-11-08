import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class ChatRoom {
  @Prop({ type: String })
  @Field()
  name: string;

  @Prop({ type: String, default: '' })
  @Field()
  description: string;

  @Prop({ type: Boolean, default: false })
  @Field()
  isGroupChat: boolean;

  @Prop({ type: [Types.ObjectId], required: true, ref: 'User' })
  @Field(() => [ID])
  members: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  @Field(() => [ID])
  admins: Types.ObjectId[];

  @Field()
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Field()
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
ChatRoomSchema.index({ isGroupChat: 1, members: 1 });
ChatRoomSchema.index({ members: 1 });
