import { CreateChatRoomInput } from './create-chat-room.input';
import { InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateChatRoomInput extends PartialType(CreateChatRoomInput) {}
